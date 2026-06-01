import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { MapContext } from "@/contexts/MapContext";
import type { MapContextValue } from "@/types/map";
import { useMeasurement } from "@/hooks/useMeasurement";

// A fake Leaflet map: Leaflet layers' `.addTo(map)` just calls map.addLayer,
// so construction of circleMarker/polyline/polygon never touches the DOM here.
function makeFakeMap() {
  const style: { cursor?: string } = {};
  return {
    on: vi.fn(),
    off: vi.fn(),
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
    hasLayer: vi.fn(() => true),
    getContainer: vi.fn(() => ({ style }))
  };
}

function wrapperFor(map: unknown) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MapContext.Provider value={{ map } as unknown as MapContextValue}>
        {children}
      </MapContext.Provider>
    );
  };
}

// Pull the click handler that startMeasurement registered via map.on("click", …)
function clickHandlerFrom(map: ReturnType<typeof makeFakeMap>) {
  const call = map.on.mock.calls.find((c) => c[0] === "click");
  return call?.[1] as (e: { latlng: { lat: number; lng: number } }) => void;
}

describe("useMeasurement", () => {
  beforeEach(() => vi.clearAllMocks());

  it("starts idle", () => {
    const { result } = renderHook(() => useMeasurement(), {
      wrapper: wrapperFor(makeFakeMap())
    });
    expect(result.current.mode).toBeNull();
    expect(result.current.points).toEqual([]);
    expect(result.current.distance).toBe(0);
    expect(result.current.area).toBe(0);
    expect(result.current.isActive).toBe(false);
    expect(result.current.pointCount).toBe(0);
  });

  it("guards every action when the map is null", async () => {
    const { result } = renderHook(() => useMeasurement(), {
      wrapper: wrapperFor(null)
    });
    await act(async () => {
      await result.current.startMeasurement("distance");
      result.current.clearMeasurement();
      result.current.finishMeasurement();
      result.current.undoLastPoint();
    });
    expect(result.current.mode).toBeNull();
    expect(result.current.isActive).toBe(false);
  });

  it("startMeasurement attaches a click handler, sets crosshair + mode", async () => {
    const map = makeFakeMap();
    const { result } = renderHook(() => useMeasurement(), {
      wrapper: wrapperFor(map)
    });
    await act(async () => {
      await result.current.startMeasurement("distance");
    });
    expect(result.current.mode).toBe("distance");
    expect(result.current.isActive).toBe(true);
    expect(map.on).toHaveBeenCalledWith("click", expect.any(Function));
    expect(map.getContainer().style.cursor).toBe("crosshair");
  });

  it("distance mode accumulates distance across clicks", async () => {
    const map = makeFakeMap();
    const { result } = renderHook(() => useMeasurement(), {
      wrapper: wrapperFor(map)
    });
    await act(async () => {
      await result.current.startMeasurement("distance");
    });
    const click = clickHandlerFrom(map);

    act(() => click({ latlng: { lat: 43.65, lng: -79.38 } }));
    expect(result.current.pointCount).toBe(1);
    expect(result.current.distance).toBe(0); // need 2 points

    act(() => click({ latlng: { lat: 43.77, lng: -79.25 } }));
    expect(result.current.pointCount).toBe(2);
    expect(result.current.distance).toBeGreaterThan(10000); // ~12 km apart
  });

  it("area mode computes a positive area after three points", async () => {
    const map = makeFakeMap();
    const { result } = renderHook(() => useMeasurement(), {
      wrapper: wrapperFor(map)
    });
    await act(async () => {
      await result.current.startMeasurement("area");
    });
    const click = clickHandlerFrom(map);

    act(() => click({ latlng: { lat: 43.6, lng: -79.5 } }));
    act(() => click({ latlng: { lat: 43.7, lng: -79.5 } }));
    expect(result.current.area).toBe(0); // need 3 points
    act(() => click({ latlng: { lat: 43.7, lng: -79.4 } }));
    expect(result.current.pointCount).toBe(3);
    expect(result.current.area).toBeGreaterThan(0);
  });

  it("undoLastPoint removes the most recent point", async () => {
    const map = makeFakeMap();
    const { result } = renderHook(() => useMeasurement(), {
      wrapper: wrapperFor(map)
    });
    await act(async () => {
      await result.current.startMeasurement("distance");
    });
    const click = clickHandlerFrom(map);
    act(() => click({ latlng: { lat: 43.65, lng: -79.38 } }));
    act(() => click({ latlng: { lat: 43.77, lng: -79.25 } }));
    expect(result.current.pointCount).toBe(2);

    act(() => result.current.undoLastPoint());
    expect(result.current.pointCount).toBe(1);
    expect(result.current.distance).toBe(0); // back under 2 points
  });

  it("finishMeasurement detaches the handler and clears mode but keeps points", async () => {
    const map = makeFakeMap();
    const { result } = renderHook(() => useMeasurement(), {
      wrapper: wrapperFor(map)
    });
    await act(async () => {
      await result.current.startMeasurement("distance");
    });
    const click = clickHandlerFrom(map);
    act(() => click({ latlng: { lat: 43.65, lng: -79.38 } }));

    act(() => result.current.finishMeasurement());
    expect(result.current.mode).toBeNull();
    expect(map.off).toHaveBeenCalledWith("click", expect.any(Function));
    expect(result.current.pointCount).toBe(1); // points preserved
    expect(map.getContainer().style.cursor).toBe("");
  });

  it("clearMeasurement resets all state and removes layers", async () => {
    const map = makeFakeMap();
    const { result } = renderHook(() => useMeasurement(), {
      wrapper: wrapperFor(map)
    });
    await act(async () => {
      await result.current.startMeasurement("distance");
    });
    const click = clickHandlerFrom(map);
    act(() => click({ latlng: { lat: 43.65, lng: -79.38 } }));
    act(() => click({ latlng: { lat: 43.77, lng: -79.25 } }));

    act(() => result.current.clearMeasurement());
    expect(result.current.mode).toBeNull();
    expect(result.current.points).toEqual([]);
    expect(result.current.distance).toBe(0);
    expect(result.current.area).toBe(0);
    expect(map.removeLayer).toHaveBeenCalled(); // markers/polyline removed
  });
});
