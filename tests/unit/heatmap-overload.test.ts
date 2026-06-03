import { describe, it, expect } from "vitest";
import { buildHeatDataFromRows, getTimeWeight } from "@/lib/utils/heatmap";
import type { HeatRow } from "@/types/db";
import type { MonthYear } from "@/types/map";

// refDate used across tests that don't specifically test time-weighting behaviour.
// Using "none" keeps intensity = count/maxCount, same as the original logic.
const REF: MonthYear = { year: 2026, month: 5 };

describe("buildHeatDataFromRows", () => {
  it("returns HeatLatLngTuple[] from HeatRow[]", () => {
    const rows: HeatRow[] = [
      {
        hood_158: 123,
        lat: 43.7,
        lng: -79.4,
        count: 5,
        occ_date: "2021-06-01"
      },
      {
        hood_158: 456,
        lat: 43.65,
        lng: -79.38,
        count: 2,
        occ_date: "2021-06-01"
      }
    ];
    const result = buildHeatDataFromRows(rows, false, "none", REF);
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
      {
        hood_158: 123,
        lat: 43.7,
        lng: -79.4,
        count: 1,
        occ_date: "2021-06-01"
      },
      {
        hood_158: 456,
        lat: 43.65,
        lng: -79.38,
        count: 5,
        occ_date: "2021-06-01"
      },
      {
        hood_158: 789,
        lat: 43.6,
        lng: -79.3,
        count: 10,
        occ_date: "2021-06-01"
      }
    ];
    const result = buildHeatDataFromRows(rows, false, "none", REF);
    result.values.forEach((tuple) => {
      expect(tuple[2]).toBeGreaterThan(0);
      expect(tuple[2]).toBeLessThanOrEqual(1);
    });
  });

  it("single row returns valid result without throwing", () => {
    const rows: HeatRow[] = [
      { hood_158: 123, lat: 43.7, lng: -79.4, count: 3, occ_date: "2021-06-01" }
    ];
    expect(() => buildHeatDataFromRows(rows, false, "none", REF)).not.toThrow();
    const result = buildHeatDataFromRows(rows, false, "none", REF);
    expect(result.values).toHaveLength(1);
  });

  it("empty rows returns empty result", () => {
    const result = buildHeatDataFromRows([], false, "none", REF);
    expect(result).toEqual({ values: [], avgIntensity: 0 });
  });

  it("lat/lng are correctly placed in tuple (lat first, then lng)", () => {
    const rows: HeatRow[] = [
      { hood_158: 123, lat: 43.7, lng: -79.4, count: 1, occ_date: "2021-06-01" }
    ];
    const result = buildHeatDataFromRows(rows, false, "none", REF);
    expect(result.values[0][0]).toBe(43.7);
    expect(result.values[0][1]).toBe(-79.4);
  });
});

describe("buildHeatDataFromRows — byHood=true (stratified)", () => {
  it("normalizes intensity per neighbourhood, not globally", () => {
    // Hood 1: counts 2,4 → max 4 → intensities 0.5, 1
    // Hood 2: counts 1,100 → max 100 → intensities 0.01, 1
    const rows: HeatRow[] = [
      { hood_158: 1, lat: 43.7, lng: -79.4, count: 2, occ_date: "2021-06-01" },
      {
        hood_158: 1,
        lat: 43.71,
        lng: -79.41,
        count: 4,
        occ_date: "2021-06-01"
      },
      { hood_158: 2, lat: 43.8, lng: -79.5, count: 1, occ_date: "2021-06-01" },
      {
        hood_158: 2,
        lat: 43.81,
        lng: -79.51,
        count: 100,
        occ_date: "2021-06-01"
      }
    ];
    const result = buildHeatDataFromRows(rows, true, "none", REF);
    expect(result.values).toHaveLength(4);

    const byLat = (lat: number) => result.values.find((t) => t[0] === lat)![2];
    expect(byLat(43.7)).toBeCloseTo(0.5, 10); // 2/4
    expect(byLat(43.71)).toBe(1); // 4/4 — hood-local max
    expect(byLat(43.8)).toBeCloseTo(0.01, 10); // 1/100
    expect(byLat(43.81)).toBe(1); // 100/100 — hood-local max
  });

  it("each hood's max row reaches intensity 1", () => {
    const rows: HeatRow[] = [
      { hood_158: 5, lat: 1, lng: 1, count: 3, occ_date: "2021-06-01" },
      { hood_158: 5, lat: 2, lng: 2, count: 9, occ_date: "2021-06-01" },
      { hood_158: 9, lat: 3, lng: 3, count: 7, occ_date: "2021-06-01" }
    ];
    const result = buildHeatDataFromRows(rows, true, "none", REF);
    const ones = result.values.filter((t) => t[2] === 1);
    expect(ones).toHaveLength(2);
  });

  it("avgIntensity is the mean of all per-hood intensities", () => {
    const rows: HeatRow[] = [
      { hood_158: 1, lat: 1, lng: 1, count: 5, occ_date: "2021-06-01" }, // 5/5 = 1
      { hood_158: 2, lat: 2, lng: 2, count: 2, occ_date: "2021-06-01" }, // 2/4 = 0.5
      { hood_158: 2, lat: 3, lng: 3, count: 4, occ_date: "2021-06-01" } // 4/4 = 1
    ];
    const result = buildHeatDataFromRows(rows, true, "none", REF);
    expect(result.avgIntensity).toBeCloseTo((1 + 0.5 + 1) / 3, 10);
  });

  it("single-row hood yields intensity 1 without throwing", () => {
    const rows: HeatRow[] = [
      { hood_158: 42, lat: 1, lng: 2, count: 8, occ_date: "2021-06-01" }
    ];
    const result = buildHeatDataFromRows(rows, true, "none", REF);
    expect(result.values).toEqual([[1, 2, 1]]);
    expect(result.avgIntensity).toBe(1);
  });

  it("empty rows returns empty result even with byHood=true", () => {
    expect(buildHeatDataFromRows([], true, "none", REF)).toEqual({
      values: [],
      avgIntensity: 0
    });
  });
});

describe("getTimeWeight", () => {
  it("lin: weight is 1 at delta=0 and 0 at delta=maxDelta", () => {
    expect(getTimeWeight("lin", 0, 10)).toBe(1);
    expect(getTimeWeight("lin", 10, 10)).toBe(0);
  });

  it("lin: weight is 0.5 at delta=maxDelta/2", () => {
    expect(getTimeWeight("lin", 5, 10)).toBeCloseTo(0.5);
  });

  it("lin: clamps to 0 when delta exceeds maxDelta", () => {
    expect(getTimeWeight("lin", 20, 10)).toBe(0);
  });

  it("inv: weight is 1 at delta=0", () => {
    expect(getTimeWeight("inv", 0, 10)).toBe(1);
  });

  it("inv: weight is 0.5 at delta=maxDelta", () => {
    expect(getTimeWeight("inv", 10, 10)).toBeCloseTo(0.5);
  });

  it("invquad: weight is 1 at delta=0", () => {
    expect(getTimeWeight("invquad", 0, 10)).toBe(1);
  });

  it("invquad: weight decreases faster than inv at same delta", () => {
    const inv = getTimeWeight("inv", 5, 10);
    const invquad = getTimeWeight("invquad", 5, 10);
    expect(invquad).toBeLessThan(inv);
  });

  it("returns 1 when maxDelta is 0 (no temporal spread)", () => {
    expect(getTimeWeight("lin", 0, 0)).toBe(1);
    expect(getTimeWeight("inv", 0, 0)).toBe(1);
    expect(getTimeWeight("invquad", 0, 0)).toBe(1);
  });
});
