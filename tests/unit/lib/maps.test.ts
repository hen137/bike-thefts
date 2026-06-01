import { describe, it, expect, vi } from "vitest";
import L from "leaflet";
import {
  calculateRawBounds,
  calculateBounds,
  expandBounds,
  calculateBoundsArea,
  isCoordinateInBounds,
  getBoundsCenter,
  safeGetZoom,
  safeGetCenter,
  safeGetBounds,
  safeSetView,
  safeFlyTo,
  safeZoomIn,
  safeZoomOut,
  safeGetMarkerPosition,
  safeSetMarkerPosition,
  safeRemoveLayer,
  safeAddLayer,
  safeHasLayer,
  safeInvalidateSize,
  safeFitBounds
} from "@/lib/utils/maps";

describe("calculateRawBounds", () => {
  it("returns null for empty array", () => {
    expect(calculateRawBounds([])).toBeNull();
  });

  it("returns a small box around a single coordinate", () => {
    const bounds = calculateRawBounds([[43.7, -79.4]]);
    expect(bounds).toEqual({
      minLat: 43.7 - 0.001,
      maxLat: 43.7 + 0.001,
      minLng: -79.4 - 0.001,
      maxLng: -79.4 + 0.001
    });
  });

  it("computes min/max across multiple coordinates", () => {
    const bounds = calculateRawBounds([
      [43.7, -79.4],
      [43.9, -79.1],
      [43.5, -79.6]
    ]);
    expect(bounds).toEqual({
      minLat: 43.5,
      maxLat: 43.9,
      minLng: -79.6,
      maxLng: -79.1
    });
  });

  it("handles two identical coordinates (degenerate box)", () => {
    const bounds = calculateRawBounds([
      [10, 20],
      [10, 20]
    ]);
    expect(bounds).toEqual({ minLat: 10, maxLat: 10, minLng: 20, maxLng: 20 });
  });
});

describe("calculateBounds (async, real Leaflet)", () => {
  it("returns null for empty input", async () => {
    expect(await calculateBounds([])).toBeNull();
  });
  it("returns a LatLngBounds spanning the coordinates", async () => {
    const bounds = await calculateBounds([
      [43.5, -79.6],
      [43.9, -79.1]
    ]);
    expect(bounds).not.toBeNull();
    expect(bounds!.getSouthWest().lat).toBeCloseTo(43.5, 5);
    expect(bounds!.getSouthWest().lng).toBeCloseTo(-79.6, 5);
    expect(bounds!.getNorthEast().lat).toBeCloseTo(43.9, 5);
    expect(bounds!.getNorthEast().lng).toBeCloseTo(-79.1, 5);
  });
});

describe("expandBounds (async, real Leaflet)", () => {
  it("grows bounds outward by the given percentage", async () => {
    const original = L.latLngBounds([43.5, -79.6], [43.9, -79.1]);
    const expanded = await expandBounds(original, 0.1);
    expect(expanded.getSouthWest().lat).toBeLessThan(43.5);
    expect(expanded.getNorthEast().lat).toBeGreaterThan(43.9);
    expect(expanded.getSouthWest().lng).toBeLessThan(-79.6);
    expect(expanded.getNorthEast().lng).toBeGreaterThan(-79.1);
  });
  it("defaults to 10% expansion", async () => {
    const original = L.latLngBounds([0, 0], [10, 10]);
    const expanded = await expandBounds(original);
    // 10% of a 10° span = 1° on each side
    expect(expanded.getSouthWest().lat).toBeCloseTo(-1, 5);
    expect(expanded.getNorthEast().lat).toBeCloseTo(11, 5);
  });
});

describe("calculateBoundsArea (async, real Leaflet)", () => {
  it("returns a positive area for a non-degenerate box", async () => {
    const bounds = L.latLngBounds([43.5, -79.6], [43.9, -79.1]);
    const area = await calculateBoundsArea(bounds);
    expect(area).toBeGreaterThan(0);
  });
  it("returns ~0 for a degenerate (single-point) box", async () => {
    const bounds = L.latLngBounds([43.7, -79.4], [43.7, -79.4]);
    expect(await calculateBoundsArea(bounds)).toBeCloseTo(0, 5);
  });
});

describe("isCoordinateInBounds", () => {
  it("delegates to bounds.contains", () => {
    const bounds = { contains: vi.fn(() => true) };
    const result = isCoordinateInBounds(
      [43.7, -79.4],
      bounds as unknown as L.LatLngBounds
    );
    expect(result).toBe(true);
    expect(bounds.contains).toHaveBeenCalledWith([43.7, -79.4]);
  });
});

describe("getBoundsCenter", () => {
  it("returns center as [lat, lng] tuple", () => {
    const bounds = { getCenter: () => ({ lat: 1.5, lng: 2.5 }) };
    expect(getBoundsCenter(bounds as unknown as L.LatLngBounds)).toEqual([
      1.5, 2.5
    ]);
  });
});

describe("safeGetZoom", () => {
  it("returns the map zoom", () => {
    const map = { getZoom: () => 11 };
    expect(safeGetZoom(map as unknown as L.Map)).toBe(11);
  });
  it("returns default for null map", () => {
    expect(safeGetZoom(null)).toBe(13);
    expect(safeGetZoom(null, 7)).toBe(7);
  });
  it("returns default when getZoom throws", () => {
    const map = {
      getZoom: () => {
        throw new Error("not ready");
      }
    };
    expect(safeGetZoom(map as unknown as L.Map, 9)).toBe(9);
  });
});

describe("safeGetCenter", () => {
  it("returns [lat, lng] from map center", () => {
    const map = { getCenter: () => ({ lat: 43.7, lng: -79.4 }) };
    expect(safeGetCenter(map as unknown as L.Map)).toEqual([43.7, -79.4]);
  });
  it("returns default for null map", () => {
    expect(safeGetCenter(null)).toEqual([51.505, -0.09]);
  });
  it("returns default when getCenter throws", () => {
    const map = {
      getCenter: () => {
        throw new Error("boom");
      }
    };
    expect(safeGetCenter(map as unknown as L.Map, [1, 2])).toEqual([1, 2]);
  });
});

describe("safeGetBounds", () => {
  it("returns bounds from map", () => {
    const bounds = {};
    const map = { getBounds: () => bounds };
    expect(safeGetBounds(map as unknown as L.Map)).toBe(bounds);
  });
  it("returns null for null map", () => {
    expect(safeGetBounds(null)).toBeNull();
  });
  it("returns null when getBounds throws", () => {
    const map = {
      getBounds: () => {
        throw new Error("boom");
      }
    };
    expect(safeGetBounds(map as unknown as L.Map)).toBeNull();
  });
});

describe("safeSetView", () => {
  it("calls setView and returns true", () => {
    const setView = vi.fn();
    const map = { setView };
    expect(safeSetView(map as unknown as L.Map, [1, 2], 10)).toBe(true);
    expect(setView).toHaveBeenCalledWith([1, 2], 10);
  });
  it("returns false for null map", () => {
    expect(safeSetView(null, [1, 2], 10)).toBe(false);
  });
  it("returns false when setView throws", () => {
    const map = {
      setView: () => {
        throw new Error("boom");
      }
    };
    expect(safeSetView(map as unknown as L.Map, [1, 2], 10)).toBe(false);
  });
});

describe("safeFlyTo", () => {
  it("calls flyTo and returns true", () => {
    const flyTo = vi.fn();
    expect(safeFlyTo({ flyTo } as unknown as L.Map, [1, 2], 10)).toBe(true);
    expect(flyTo).toHaveBeenCalledWith([1, 2], 10);
  });
  it("returns false for null map", () => {
    expect(safeFlyTo(null, [1, 2], 10)).toBe(false);
  });
});

describe("safeZoomIn / safeZoomOut", () => {
  it("zoomIn calls map.zoomIn with default delta", () => {
    const zoomIn = vi.fn();
    expect(safeZoomIn({ zoomIn } as unknown as L.Map)).toBe(true);
    expect(zoomIn).toHaveBeenCalledWith(1);
  });
  it("zoomOut respects custom delta", () => {
    const zoomOut = vi.fn();
    expect(safeZoomOut({ zoomOut } as unknown as L.Map, 3)).toBe(true);
    expect(zoomOut).toHaveBeenCalledWith(3);
  });
  it("both return false for null map", () => {
    expect(safeZoomIn(null)).toBe(false);
    expect(safeZoomOut(null)).toBe(false);
  });
});

describe("safeGetMarkerPosition", () => {
  it("returns [lat, lng] from marker", () => {
    const marker = { getLatLng: () => ({ lat: 5, lng: 6 }) };
    expect(safeGetMarkerPosition(marker as unknown as L.Marker)).toEqual([
      5, 6
    ]);
  });
  it("returns default for null marker", () => {
    expect(safeGetMarkerPosition(null)).toEqual([0, 0]);
    expect(safeGetMarkerPosition(null, [9, 9])).toEqual([9, 9]);
  });
});

describe("safeSetMarkerPosition", () => {
  it("calls setLatLng and returns true", () => {
    const setLatLng = vi.fn();
    expect(
      safeSetMarkerPosition({ setLatLng } as unknown as L.Marker, [1, 2])
    ).toBe(true);
    expect(setLatLng).toHaveBeenCalledWith([1, 2]);
  });
  it("returns false for null marker", () => {
    expect(safeSetMarkerPosition(null, [1, 2])).toBe(false);
  });
});

describe("layer helpers", () => {
  const layer = {} as unknown as L.TileLayer;

  it("safeAddLayer adds and returns true", () => {
    const addLayer = vi.fn();
    expect(safeAddLayer({ addLayer } as unknown as L.Map, layer)).toBe(true);
    expect(addLayer).toHaveBeenCalledWith(layer);
  });
  it("safeRemoveLayer removes and returns true", () => {
    const removeLayer = vi.fn();
    expect(safeRemoveLayer({ removeLayer } as unknown as L.Map, layer)).toBe(
      true
    );
    expect(removeLayer).toHaveBeenCalledWith(layer);
  });
  it("safeHasLayer returns the map result", () => {
    const map = { hasLayer: vi.fn(() => true) };
    expect(safeHasLayer(map as unknown as L.Map, layer)).toBe(true);
  });
  it("all return false when layer is null", () => {
    const map = {} as unknown as L.Map;
    expect(safeAddLayer(map, null)).toBe(false);
    expect(safeRemoveLayer(map, null)).toBe(false);
    expect(safeHasLayer(map, null)).toBe(false);
  });
  it("all return false when map is null", () => {
    expect(safeAddLayer(null, layer)).toBe(false);
    expect(safeRemoveLayer(null, layer)).toBe(false);
    expect(safeHasLayer(null, layer)).toBe(false);
  });
  it("all return false when the underlying call throws", () => {
    const boom = () => {
      throw new Error("boom");
    };
    expect(safeAddLayer({ addLayer: boom } as unknown as L.Map, layer)).toBe(
      false
    );
    expect(
      safeRemoveLayer({ removeLayer: boom } as unknown as L.Map, layer)
    ).toBe(false);
    expect(safeHasLayer({ hasLayer: boom } as unknown as L.Map, layer)).toBe(
      false
    );
  });
});

describe("safeInvalidateSize", () => {
  it("calls invalidateSize and returns true", () => {
    const invalidateSize = vi.fn();
    expect(safeInvalidateSize({ invalidateSize } as unknown as L.Map)).toBe(
      true
    );
    expect(invalidateSize).toHaveBeenCalled();
  });
  it("returns false for null map", () => {
    expect(safeInvalidateSize(null)).toBe(false);
  });
  it("returns false when invalidateSize throws", () => {
    const map = {
      invalidateSize: () => {
        throw new Error("boom");
      }
    };
    expect(safeInvalidateSize(map as unknown as L.Map)).toBe(false);
  });
});

describe("safeFitBounds", () => {
  it("calls fitBounds and returns true", () => {
    const fitBounds = vi.fn();
    const bounds = {} as unknown as L.LatLngBounds;
    expect(safeFitBounds({ fitBounds } as unknown as L.Map, bounds)).toBe(true);
    expect(fitBounds).toHaveBeenCalledWith(bounds);
  });
  it("returns false for null map or null bounds", () => {
    expect(safeFitBounds(null, {} as unknown as L.LatLngBounds)).toBe(false);
    expect(safeFitBounds({} as unknown as L.Map, null)).toBe(false);
  });
  it("returns false when fitBounds throws", () => {
    const map = {
      fitBounds: () => {
        throw new Error("boom");
      }
    };
    expect(
      safeFitBounds(map as unknown as L.Map, {} as unknown as L.LatLngBounds)
    ).toBe(false);
  });
});
