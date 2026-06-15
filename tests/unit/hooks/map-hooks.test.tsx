import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { MapContext } from "@/contexts/MapContext";
import type { MapContextValue } from "@/types/map";
import { useLeafletMap } from "@/hooks/useLeafletMap";
import { useMapControls } from "@/hooks/useMapControls";
import { useSafeMapOperations } from "@/hooks/useSafeMapOperations";
import { useGeolocation } from "@/hooks/useGeolocation";

vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
import { toast } from "sonner";

// Wrap a hook in a MapContext.Provider carrying the given (fake) map.
function wrapperFor(map: unknown) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MapContext.Provider value={{ map } as unknown as MapContextValue}>
        {children}
      </MapContext.Provider>
    );
  };
}

describe("useLeafletMap", () => {
  it("throws when used outside a MapProvider", () => {
    // Suppress React's error boundary console noise
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useLeafletMap())).toThrow(
      /must be used within a MapProvider/
    );
    spy.mockRestore();
  });

  it("returns the map from context", () => {
    const map = { id: "fake-map" };
    const { result } = renderHook(() => useLeafletMap(), {
      wrapper: wrapperFor(map)
    });
    expect(result.current).toBe(map);
  });

  it("returns null when context map is null", () => {
    const { result } = renderHook(() => useLeafletMap(), {
      wrapper: wrapperFor(null)
    });
    expect(result.current).toBeNull();
  });
});

describe("useMapControls", () => {
  it("zoomIn / zoomOut call the map", () => {
    const map = { zoomIn: vi.fn(), zoomOut: vi.fn(), setView: vi.fn() };
    const { result } = renderHook(() => useMapControls(), {
      wrapper: wrapperFor(map)
    });
    act(() => result.current.zoomIn());
    act(() => result.current.zoomOut());
    expect(map.zoomIn).toHaveBeenCalled();
    expect(map.zoomOut).toHaveBeenCalled();
  });

  it("resetView sets the default Toronto view", () => {
    const map = { zoomIn: vi.fn(), zoomOut: vi.fn(), setView: vi.fn() };
    const { result } = renderHook(() => useMapControls(), {
      wrapper: wrapperFor(map)
    });
    act(() => result.current.resetView());
    expect(map.setView).toHaveBeenCalledWith([43.670177, -79.386741], 12);
  });

  it("is a no-op (no throw) when map is null", () => {
    const { result } = renderHook(() => useMapControls(), {
      wrapper: wrapperFor(null)
    });
    expect(() => {
      act(() => result.current.zoomIn());
      act(() => result.current.resetView());
    }).not.toThrow();
  });

  describe("toggleFullscreen", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("requests fullscreen when none is active", () => {
      const requestFullscreen = vi.fn();
      Object.defineProperty(document, "fullscreenElement", {
        value: null,
        configurable: true
      });
      Object.defineProperty(document.documentElement, "requestFullscreen", {
        value: requestFullscreen,
        configurable: true
      });
      const { result } = renderHook(() => useMapControls(), {
        wrapper: wrapperFor(null)
      });
      act(() => result.current.toggleFullscreen());
      expect(requestFullscreen).toHaveBeenCalled();
    });

    it("exits fullscreen when one is active", () => {
      const exitFullscreen = vi.fn();
      Object.defineProperty(document, "fullscreenElement", {
        value: document.body,
        configurable: true
      });
      Object.defineProperty(document, "exitFullscreen", {
        value: exitFullscreen,
        configurable: true
      });
      const { result } = renderHook(() => useMapControls(), {
        wrapper: wrapperFor(null)
      });
      act(() => result.current.toggleFullscreen());
      expect(exitFullscreen).toHaveBeenCalled();
    });
  });
});

describe("useSafeMapOperations", () => {
  it("isReady reflects map presence", () => {
    const { result: ready } = renderHook(() => useSafeMapOperations(), {
      wrapper: wrapperFor({})
    });
    expect(ready.current.isReady).toBe(true);
    const { result: notReady } = renderHook(() => useSafeMapOperations(), {
      wrapper: wrapperFor(null)
    });
    expect(notReady.current.isReady).toBe(false);
  });

  it("getZoom / getCenter / getBounds read from the map", () => {
    const map = {
      getZoom: () => 14,
      getCenter: () => ({ lat: 43.7, lng: -79.4 }),
      getBounds: () => ({ id: "bounds" })
    };
    const { result } = renderHook(() => useSafeMapOperations(), {
      wrapper: wrapperFor(map)
    });
    expect(result.current.getZoom()).toBe(14);
    expect(result.current.getCenter()).toEqual([43.7, -79.4]);
    expect(result.current.getBounds()).toEqual({ id: "bounds" });
  });

  it("getters return defaults when map is null", () => {
    const { result } = renderHook(() => useSafeMapOperations(), {
      wrapper: wrapperFor(null)
    });
    expect(result.current.getZoom(9)).toBe(9);
    expect(result.current.getCenter([1, 2])).toEqual([1, 2]);
    expect(result.current.getBounds()).toBeNull();
  });

  it("mutators return true on success and false on null map", () => {
    const map = {
      setView: vi.fn(),
      flyTo: vi.fn(),
      fitBounds: vi.fn(),
      zoomIn: vi.fn(),
      zoomOut: vi.fn(),
      invalidateSize: vi.fn(),
      panTo: vi.fn()
    };
    const { result } = renderHook(() => useSafeMapOperations(), {
      wrapper: wrapperFor(map)
    });
    expect(result.current.setView([1, 2], 10)).toBe(true);
    expect(result.current.flyTo([1, 2], 10)).toBe(true);
    expect(result.current.fitBounds({} as unknown as L.LatLngBounds)).toBe(
      true
    );
    expect(result.current.zoomIn()).toBe(true);
    expect(result.current.zoomOut()).toBe(true);
    expect(result.current.invalidateSize()).toBe(true);
    expect(result.current.panTo([1, 2])).toBe(true);

    const { result: nullMap } = renderHook(() => useSafeMapOperations(), {
      wrapper: wrapperFor(null)
    });
    expect(nullMap.current.setView([1, 2], 10)).toBe(false);
    expect(nullMap.current.flyTo([1, 2], 10)).toBe(false);
    expect(nullMap.current.zoomIn()).toBe(false);
    expect(nullMap.current.invalidateSize()).toBe(false);
    expect(nullMap.current.panTo([1, 2])).toBe(false);
  });

  it("getZoom returns default when the map throws", () => {
    const map = {
      getZoom: () => {
        throw new Error("not ready");
      }
    };
    const { result } = renderHook(() => useSafeMapOperations(), {
      wrapper: wrapperFor(map)
    });
    expect(result.current.getZoom(7)).toBe(7);
  });
});

describe("useGeolocation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("isAvailable is false and locateUser warns when no map", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { result } = renderHook(() => useGeolocation(), {
      wrapper: wrapperFor(null)
    });
    expect(result.current.isAvailable).toBe(false);
    act(() => result.current.locateUser());
    expect(warn).toHaveBeenCalledWith("Map instance not available");
    warn.mockRestore();
  });

  it("locateUser attaches handlers and calls map.locate", () => {
    const map = {
      hasLayer: vi.fn(() => false),
      removeLayer: vi.fn(),
      off: vi.fn(),
      once: vi.fn(),
      locate: vi.fn()
    };
    const { result } = renderHook(() => useGeolocation(), {
      wrapper: wrapperFor(map)
    });
    expect(result.current.isAvailable).toBe(true);
    act(() => result.current.locateUser());
    expect(map.once).toHaveBeenCalledWith(
      "locationfound",
      expect.any(Function)
    );
    expect(map.once).toHaveBeenCalledWith(
      "locationerror",
      expect.any(Function)
    );
    expect(map.locate).toHaveBeenCalledWith({ setView: true, maxZoom: 16 });
    expect(result.current.isLocating).toBe(true);
  });

  it("location error handler toasts and clears the locating state", () => {
    const handlers: Record<string, (e: unknown) => void> = {};
    const map = {
      hasLayer: vi.fn(() => false),
      removeLayer: vi.fn(),
      off: vi.fn(),
      once: vi.fn((event: string, cb: (e: unknown) => void) => {
        handlers[event] = cb;
      }),
      locate: vi.fn()
    };
    const { result } = renderHook(() => useGeolocation(), {
      wrapper: wrapperFor(map)
    });
    act(() => result.current.locateUser());
    expect(result.current.isLocating).toBe(true);

    act(() => handlers["locationerror"]({ message: "denied" }));

    expect(result.current.isLocating).toBe(false);
    expect(toast.error).toHaveBeenCalledWith(
      "Unable to find your location. Please check your browser permissions."
    );
  });
});
