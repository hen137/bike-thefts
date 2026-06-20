import { describe, it, expect, vi } from "vitest";
import { renderHook, render, act } from "@testing-library/react";
import { useContext } from "react";

// next-themes is mocked so TileProvider/ThemeProvider work without a real
// theme provider in the tree.
vi.mock("next-themes", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => ({
    theme: "light",
    setTheme: vi.fn(),
    systemTheme: "light",
    resolvedTheme: "light"
  })
}));

import { MapProvider, MapContext } from "@/contexts/MapContext";
import { HeatProvider, HeatContext } from "@/contexts/HeatContext";
import { TileProvider, TileContext } from "@/contexts/TileContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { DataProvider } from "@/contexts/DataContext";
import { useDataSettings } from "@/hooks/useDataSettings";

describe("MapProvider", () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MapProvider>{children}</MapProvider>
  );

  it("starts with no map and isReady=false", () => {
    const { result } = renderHook(() => useContext(MapContext), { wrapper });
    expect(result.current!.map).toBeNull();
    expect(result.current!.isReady).toBe(false);
  });

  it("setMap stores the map, clears error and flips isReady", () => {
    const { result } = renderHook(() => useContext(MapContext), { wrapper });
    const fakeMap = { id: "map" };
    act(() => result.current!.setMap(fakeMap as never));
    expect(result.current!.map).toBe(fakeMap);
    expect(result.current!.isReady).toBe(true);
    expect(result.current!.error).toBeNull();
  });

  it("setMapError sets error and makes isReady false even with a map", () => {
    const { result } = renderHook(() => useContext(MapContext), { wrapper });
    act(() => result.current!.setMap({ id: "map" } as never));
    act(() => result.current!.setMapError(new Error("boom")));
    expect(result.current!.error?.message).toBe("boom");
    expect(result.current!.isReady).toBe(false);
  });

  it("startInitializing toggles the initializing flag", () => {
    const { result } = renderHook(() => useContext(MapContext), { wrapper });
    act(() => result.current!.startInitializing());
    expect(result.current!.isInitializing).toBe(true);
  });
});

describe("HeatProvider", () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <HeatProvider>{children}</HeatProvider>
  );

  it("setHeatOptions / setHeatValues are no-ops until a heat layer exists", () => {
    const { result } = renderHook(() => useContext(HeatContext), { wrapper });
    act(() => result.current!.setHeatOptions({ radius: 10 }));
    act(() => result.current!.setHeatValues([[1, 2, 0.5]]));
    // No layer yet → nothing applied/stored
    expect(result.current!.heatOptions).toBeNull();
    expect(result.current!.heatValues).toBeNull();
  });

  it("applies options and values to the layer once it is set", () => {
    const layer = { setOptions: vi.fn(), setLatLngs: vi.fn() };
    const { result } = renderHook(() => useContext(HeatContext), { wrapper });

    act(() => result.current!.setHeatLayer(layer as never));
    expect(result.current!.heatLayer).toBe(layer);

    act(() => result.current!.setHeatOptions({ radius: 25 }));
    expect(layer.setOptions).toHaveBeenCalledWith({ radius: 25 });
    expect(result.current!.heatOptions).toEqual({ radius: 25 });

    const values: [number, number, number][] = [[43.7, -79.4, 0.8]];
    act(() => result.current!.setHeatValues(values as never));
    expect(layer.setLatLngs).toHaveBeenCalledWith(values);
    expect(result.current!.heatValues).toBe(values);
  });

  it("setZoomRadius forwards the radius to the registered handler", () => {
    const { result } = renderHook(() => useContext(HeatContext), { wrapper });
    const handler = vi.fn();
    act(() => result.current!.registerZoomRadiusHandler(handler));
    act(() => result.current!.setZoomRadius(95));
    expect(handler).toHaveBeenCalledWith(95);
  });

  it("setZoomBlur forwards the blur to the registered handler", () => {
    const { result } = renderHook(() => useContext(HeatContext), { wrapper });
    const handler = vi.fn();
    act(() => result.current!.registerZoomBlurHandler(handler));
    act(() => result.current!.setZoomBlur(12));
    expect(handler).toHaveBeenCalledWith(12);
  });
});

describe("TileProvider", () => {
  it("exposes the theme-derived tile provider to consumers", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TileProvider>{children}</TileProvider>
    );
    const { result } = renderHook(() => useContext(TileContext), { wrapper });
    expect(result.current!.tileProvider.id).toBe("osm");
    expect(result.current!.currentProviderId).toBe("osm");
    expect(typeof result.current!.setProviderId).toBe("function");
  });
});

describe("DataProvider", () => {
  it("initializes queryRange with a non-null 90-day-relative-to-today default", () => {
    const { result } = renderHook(() => useDataSettings(), {
      wrapper: DataProvider
    });
    expect(result.current.queryRange).not.toBeNull();
    expect(result.current.queryRange.startDate).toHaveProperty("month");
    expect(result.current.queryRange.startDate).toHaveProperty("year");
    expect(result.current.queryRange.endDate).toHaveProperty("month");
    expect(result.current.queryRange.endDate).toHaveProperty("year");

    const today = new Date();
    expect(result.current.queryRange.endDate).toEqual({
      month: today.getMonth(),
      year: today.getFullYear()
    });
  });
});

describe("ThemeProvider", () => {
  it("renders its children", () => {
    const { getByText } = render(
      <ThemeProvider>
        <span>child-content</span>
      </ThemeProvider>
    );
    expect(getByText("child-content")).toBeInTheDocument();
  });
});
