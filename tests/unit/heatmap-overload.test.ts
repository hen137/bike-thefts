import { describe, it, expect } from "vitest";
import { buildHeatDataFromRows } from "@/lib/utils/heatmap";
import type { HeatRow } from "@/types/db";

describe("buildHeatDataFromRows", () => {
  it("returns HeatLatLngTuple[] from HeatRow[]", () => {
    const rows: HeatRow[] = [
      { hood_158: 123, lat: 43.7, lng: -79.4, count: 5 },
      { hood_158: 456, lat: 43.65, lng: -79.38, count: 2 }
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
      { hood_158: 123, lat: 43.7, lng: -79.4, count: 1 },
      { hood_158: 456, lat: 43.65, lng: -79.38, count: 5 },
      { hood_158: 789, lat: 43.6, lng: -79.3, count: 10 }
    ];
    const result = buildHeatDataFromRows(rows);
    result.values.forEach((tuple) => {
      expect(tuple[2]).toBeGreaterThan(0);
      expect(tuple[2]).toBeLessThanOrEqual(1);
    });
  });

  it("single row returns valid result without throwing", () => {
    const rows: HeatRow[] = [
      { hood_158: 123, lat: 43.7, lng: -79.4, count: 3 }
    ];
    expect(() => buildHeatDataFromRows(rows)).not.toThrow();
    const result = buildHeatDataFromRows(rows);
    expect(result.values).toHaveLength(1);
  });

  it("empty rows returns empty result", () => {
    const result = buildHeatDataFromRows([]);
    expect(result).toEqual({
      values: [],
      avgIntensity: 0
    });
  });

  it("lat/lng are correctly placed in tuple (lat first, then lng)", () => {
    const rows: HeatRow[] = [
      { hood_158: 123, lat: 43.7, lng: -79.4, count: 1 }
    ];
    const result = buildHeatDataFromRows(rows);
    expect(result.values[0][0]).toBe(43.7);
    expect(result.values[0][1]).toBe(-79.4);
  });
});

describe("buildHeatDataFromRows — byHood=true (stratified)", () => {
  it("normalizes intensity per neighbourhood, not globally", () => {
    // Hood 1: counts 2,4 → max 4 → intensities 0.5, 1
    // Hood 2: counts 1,100 → max 100 → intensities 0.01, 1
    const rows: HeatRow[] = [
      { hood_158: 1, lat: 43.7, lng: -79.4, count: 2 },
      { hood_158: 1, lat: 43.71, lng: -79.41, count: 4 },
      { hood_158: 2, lat: 43.8, lng: -79.5, count: 1 },
      { hood_158: 2, lat: 43.81, lng: -79.51, count: 100 }
    ];
    const result = buildHeatDataFromRows(rows, true);
    expect(result.values).toHaveLength(4);

    // Find each row's intensity by matching lat
    const byLat = (lat: number) => result.values.find((t) => t[0] === lat)![2];
    expect(byLat(43.7)).toBeCloseTo(0.5, 10); // 2/4
    expect(byLat(43.71)).toBe(1); // 4/4 — hood-local max
    expect(byLat(43.8)).toBeCloseTo(0.01, 10); // 1/100
    expect(byLat(43.81)).toBe(1); // 100/100 — hood-local max
  });

  it("each hood's max row reaches intensity 1", () => {
    const rows: HeatRow[] = [
      { hood_158: 5, lat: 1, lng: 1, count: 3 },
      { hood_158: 5, lat: 2, lng: 2, count: 9 },
      { hood_158: 9, lat: 3, lng: 3, count: 7 }
    ];
    const result = buildHeatDataFromRows(rows, true);
    const ones = result.values.filter((t) => t[2] === 1);
    // One max per hood: count=9 in hood 5, count=7 (sole row) in hood 9
    expect(ones).toHaveLength(2);
  });

  it("avgIntensity is the mean of all per-hood intensities", () => {
    const rows: HeatRow[] = [
      { hood_158: 1, lat: 1, lng: 1, count: 5 }, // 5/5 = 1
      { hood_158: 2, lat: 2, lng: 2, count: 2 }, // 2/4 = 0.5
      { hood_158: 2, lat: 3, lng: 3, count: 4 } // 4/4 = 1
    ];
    const result = buildHeatDataFromRows(rows, true);
    // mean of [1, 0.5, 1] = 0.8333...
    expect(result.avgIntensity).toBeCloseTo((1 + 0.5 + 1) / 3, 10);
  });

  it("single-row hood yields intensity 1 without throwing", () => {
    const rows: HeatRow[] = [{ hood_158: 42, lat: 1, lng: 2, count: 8 }];
    const result = buildHeatDataFromRows(rows, true);
    expect(result.values).toEqual([[1, 2, 1]]);
    expect(result.avgIntensity).toBe(1);
  });

  it("empty rows returns empty result even with byHood=true", () => {
    expect(buildHeatDataFromRows([], true)).toEqual({
      values: [],
      avgIntensity: 0
    });
  });
});
