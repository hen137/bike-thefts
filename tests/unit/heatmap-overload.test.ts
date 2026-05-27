import { describe, it, expect } from "vitest";
import { buildHeatDataFromRows } from "@/lib/utils/heatmap";
import type { HeatRow } from "@/types/db";

describe("buildHeatDataFromRows", () => {
  it("returns HeatLatLngTuple[] from HeatRow[]", () => {
    const rows: HeatRow[] = [
      { lat: 43.7, lng: -79.4, count: 5 },
      { lat: 43.65, lng: -79.38, count: 2 }
    ];
    const result = buildHeatDataFromRows(rows);
    expect(result.values).toHaveLength(2);
    result.values.forEach((tuple) => {
      expect(tuple).toHaveLength(3);
      expect(typeof tuple[0]).toBe("number");
      expect(typeof tuple[1]).toBe("number");
      expect(typeof tuple[2]).toBe("number");
    });
  });

  it("normalizes intensities (values between 0 and 1)", () => {
    const rows: HeatRow[] = [
      { lat: 43.7, lng: -79.4, count: 1 },
      { lat: 43.65, lng: -79.38, count: 5 },
      { lat: 43.6, lng: -79.3, count: 10 }
    ];
    const result = buildHeatDataFromRows(rows);
    result.values.forEach((tuple) => {
      expect(tuple[2]).toBeGreaterThan(0);
      expect(tuple[2]).toBeLessThanOrEqual(1);
    });
  });

  it("returns correct seenMean and stdev", () => {
    const rows: HeatRow[] = [
      { lat: 43.7, lng: -79.4, count: 1 },
      { lat: 43.65, lng: -79.38, count: 2 },
      { lat: 43.6, lng: -79.3, count: 3 }
    ];
    const result = buildHeatDataFromRows(rows);
    expect(result.seenMean).toBe(2);
    // simple-statistics standardDeviation is population stdev (ddof=0):
    // sqrt(((1-2)^2+(2-2)^2+(3-2)^2)/3) = sqrt(2/3) ≈ 0.8165
    expect(result.stdev).toBeCloseTo(0.8165, 3);
  });

  it("single row returns valid result without throwing", () => {
    const rows: HeatRow[] = [{ lat: 43.7, lng: -79.4, count: 3 }];
    expect(() => buildHeatDataFromRows(rows)).not.toThrow();
    const result = buildHeatDataFromRows(rows);
    expect(result.values).toHaveLength(1);
  });

  it("empty rows returns empty result", () => {
    const result = buildHeatDataFromRows([]);
    expect(result).toEqual({
      values: [],
      seenMean: 0,
      stdev: 0,
      avgIntensity: 0
    });
  });

  it("lat/lng are correctly placed in tuple (lat first, then lng)", () => {
    const rows: HeatRow[] = [{ lat: 43.7, lng: -79.4, count: 1 }];
    const result = buildHeatDataFromRows(rows);
    expect(result.values[0][0]).toBe(43.7);
    expect(result.values[0][1]).toBe(-79.4);
  });
});
