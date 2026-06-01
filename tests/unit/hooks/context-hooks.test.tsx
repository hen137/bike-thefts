import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";

// ---- useTheme (wraps next-themes) ----
const mockNextSetTheme = vi.fn();
const nextThemeState = {
  theme: "light" as string | undefined,
  setTheme: mockNextSetTheme,
  systemTheme: "light" as string | undefined,
  resolvedTheme: "light" as string | undefined
};
vi.mock("next-themes", () => ({
  useTheme: () => nextThemeState
}));

// useMapTileProvider consumes the real useTheme (backed by the next-themes
// mock above), so theme is driven via nextThemeState — no barrel mock, which
// would otherwise break useLeafletMap used by useMapContextMenu.
import { useTheme } from "@/hooks/useTheme";
import { useMapTileProvider } from "@/hooks/useMapTileProvider";
import { useLeafletHeatLayer } from "@/hooks/useLeafletHeatLayer";
import { useMapContextMenu } from "@/hooks/useMapContextMenu";
import { HeatContext } from "@/contexts/HeatContext";
import { MapContext } from "@/contexts/MapContext";
import type { HeatContextValue, MapContextValue } from "@/types/map";

describe("useTheme", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    nextThemeState.theme = "light";
    nextThemeState.systemTheme = "light";
    nextThemeState.resolvedTheme = "light";
  });

  it("returns the resolved theme when mounted", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("light");
    expect(result.current.mounted).toBe(true);
  });

  it("toggleTheme flips light → dark", () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.toggleTheme());
    expect(mockNextSetTheme).toHaveBeenCalledWith("dark");
  });

  it("toggleTheme flips dark → light", () => {
    nextThemeState.resolvedTheme = "dark";
    const { result } = renderHook(() => useTheme());
    act(() => result.current.toggleTheme());
    expect(mockNextSetTheme).toHaveBeenCalledWith("light");
  });

  it("resolves 'system' via systemTheme when resolvedTheme is absent", () => {
    nextThemeState.resolvedTheme = undefined;
    nextThemeState.theme = "system";
    nextThemeState.systemTheme = "dark";
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("dark");
  });
});

describe("useMapTileProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    nextThemeState.theme = "light";
    nextThemeState.systemTheme = "light";
    nextThemeState.resolvedTheme = "light";
  });

  it("auto-selects the OSM basemap for the light theme", () => {
    const { result } = renderHook(() => useMapTileProvider());
    expect(result.current.currentProviderId).toBe("osm");
    expect(result.current.tileProvider.id).toBe("osm");
  });

  it("auto-selects the dark basemap for the dark theme", () => {
    nextThemeState.resolvedTheme = "dark";
    const { result } = renderHook(() => useMapTileProvider());
    expect(result.current.currentProviderId).toBe("dark");
    expect(result.current.tileProvider.id).toBe("dark");
  });

  it("manual selection overrides the theme default", () => {
    const { result } = renderHook(() => useMapTileProvider());
    act(() => result.current.setProviderId("satellite"));
    expect(result.current.currentProviderId).toBe("satellite");
    expect(result.current.tileProvider.id).toBe("satellite");
  });

  it("falls back to the default provider for an unknown manual id", () => {
    const { result } = renderHook(() => useMapTileProvider());
    act(() => result.current.setProviderId("does-not-exist"));
    expect(result.current.tileProvider.id).toBe("osm");
  });
});

describe("useLeafletHeatLayer", () => {
  it("throws outside a HeatProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useLeafletHeatLayer())).toThrow(
      /must be used within a HeatProvider/
    );
    spy.mockRestore();
  });

  it("returns the heat context value when provided", () => {
    const ctx = { heatLayer: null, setHeatValues: vi.fn() };
    function Wrapper({ children }: { children: ReactNode }) {
      return (
        <HeatContext.Provider value={ctx as unknown as HeatContextValue}>
          {children}
        </HeatContext.Provider>
      );
    }
    const { result } = renderHook(() => useLeafletHeatLayer(), {
      wrapper: Wrapper
    });
    expect(result.current).toBe(ctx);
  });
});

describe("useMapContextMenu", () => {
  function wrapperFor(map: unknown) {
    return function Wrapper({ children }: { children: ReactNode }) {
      return (
        <MapContext.Provider value={{ map } as unknown as MapContextValue}>
          {children}
        </MapContext.Provider>
      );
    };
  }

  it("starts closed with no position", () => {
    const { result } = renderHook(() => useMapContextMenu(), {
      wrapper: wrapperFor(null)
    });
    expect(result.current.isOpen).toBe(false);
    expect(result.current.position).toBeNull();
  });

  it("attaches contextmenu/click/movestart handlers to the map", () => {
    const map = { on: vi.fn(), off: vi.fn() };
    renderHook(() => useMapContextMenu(), { wrapper: wrapperFor(map) });
    const events = map.on.mock.calls.map((c) => c[0]);
    expect(events).toEqual(
      expect.arrayContaining(["contextmenu", "click", "movestart"])
    );
  });

  it("opens with screen + latlng position on right-click", () => {
    const handlers: Record<string, (e: unknown) => void> = {};
    const map = {
      on: vi.fn((event: string, cb: (e: unknown) => void) => {
        handlers[event] = cb;
      }),
      off: vi.fn()
    };
    const { result } = renderHook(() => useMapContextMenu(), {
      wrapper: wrapperFor(map)
    });

    act(() =>
      handlers["contextmenu"]({
        originalEvent: { preventDefault: vi.fn() },
        containerPoint: { x: 12, y: 34 },
        latlng: { lat: 43.7, lng: -79.4 }
      })
    );

    expect(result.current.isOpen).toBe(true);
    expect(result.current.position).toEqual({
      x: 12,
      y: 34,
      latlng: { lat: 43.7, lng: -79.4 }
    });
  });

  it("close() resets open state and position", () => {
    const handlers: Record<string, (e: unknown) => void> = {};
    const map = {
      on: vi.fn((event: string, cb: (e: unknown) => void) => {
        handlers[event] = cb;
      }),
      off: vi.fn()
    };
    const { result } = renderHook(() => useMapContextMenu(), {
      wrapper: wrapperFor(map)
    });
    act(() =>
      handlers["contextmenu"]({
        originalEvent: { preventDefault: vi.fn() },
        containerPoint: { x: 1, y: 2 },
        latlng: { lat: 0, lng: 0 }
      })
    );
    expect(result.current.isOpen).toBe(true);
    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.position).toBeNull();
  });

  it("detaches handlers on unmount", () => {
    const map = { on: vi.fn(), off: vi.fn() };
    const { unmount } = renderHook(() => useMapContextMenu(), {
      wrapper: wrapperFor(map)
    });
    unmount();
    const events = map.off.mock.calls.map((c) => c[0]);
    expect(events).toEqual(
      expect.arrayContaining(["contextmenu", "click", "movestart"])
    );
  });
});
