import { describe, it, expect } from "vitest";
import {
  buildHeatDataFromRows,
  computeHistBins,
  getTimeWeight
} from "@/lib/utils/heatmap";
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

  it("passes k to getTimeWeight — larger k gives higher weight for older rows", () => {
    const rows: HeatRow[] = [
      { hood_158: 1, lat: 43.7, lng: -79.4, count: 1, occ_date: "2020-01-01" },
      { hood_158: 1, lat: 43.8, lng: -79.5, count: 1, occ_date: "2026-01-01" }
    ];
    const ref: MonthYear = { year: 2026, month: 0 };
    const lowK = buildHeatDataFromRows(rows, false, "inv", ref, 0.1);
    const highK = buildHeatDataFromRows(rows, false, "inv", ref, 2.0);
    // older row (2020) should get higher weight with larger k
    const oldLat = 43.7;
    const oldIntLowK = lowK.values.find((v) => v[0] === oldLat)![2];
    const oldIntHighK = highK.values.find((v) => v[0] === oldLat)![2];
    expect(oldIntHighK).toBeGreaterThan(oldIntLowK);
  });

  it("with an early refDate, the oldest row gets a higher time-weight than the most recent row (direction inverted)", () => {
    const earlyRef: MonthYear = { year: 2014, month: 0 };
    const rows: HeatRow[] = [
      { hood_158: 1, lat: 1, lng: 1, count: 10, occ_date: "2014-01-15" },
      { hood_158: 2, lat: 2, lng: 2, count: 10, occ_date: "2025-12-15" }
    ];
    const result = buildHeatDataFromRows(rows, false, "lin", earlyRef);
    const [, , oldestIntensity] = result.values[0];
    const [, , recentIntensity] = result.values[1];
    expect(oldestIntensity).toBeGreaterThan(recentIntensity);
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

describe("computeHistBins", () => {
  const REF14: MonthYear = { year: 2026, month: 0 };

  it("returns nBins-length array", () => {
    const rows: HeatRow[] = [
      { hood_158: 1, lat: 1, lng: 1, count: 5, occ_date: "2025-01-01" }
    ];
    expect(computeHistBins(rows, REF14)).toHaveLength(14);
  });

  it("returns all-zero array for empty rows", () => {
    const bins = computeHistBins([], REF14);
    expect(bins).toHaveLength(14);
    expect(bins.every((b) => b === 0)).toBe(true);
  });

  it("normalizes so max bin is 1", () => {
    const rows: HeatRow[] = [
      { hood_158: 1, lat: 1, lng: 1, count: 10, occ_date: "2025-07-01" },
      { hood_158: 2, lat: 2, lng: 2, count: 2, occ_date: "2024-01-01" }
    ];
    const bins = computeHistBins(rows, REF14);
    expect(Math.max(...bins)).toBe(1);
    expect(bins.every((b) => b >= 0 && b <= 1)).toBe(true);
  });

  it("recent rows land in lower-index bins than old rows", () => {
    // ref: Jan 2026; recent = Dec 2025 (delta ~1mo); old = Jan 2014 (delta ~144mo)
    const rows: HeatRow[] = [
      { hood_158: 1, lat: 1, lng: 1, count: 10, occ_date: "2025-12-15" },
      { hood_158: 2, lat: 2, lng: 2, count: 10, occ_date: "2014-01-15" }
    ];
    const bins = computeHistBins(rows, REF14);
    const recentBin = bins.findIndex((b) => b > 0);
    const oldBin =
      bins.length - 1 - [...bins].reverse().findIndex((b) => b > 0);
    expect(oldBin).toBeGreaterThan(recentBin);
  });

  it("with an early refDate, oldest rows land in lower-index bins than recent rows", () => {
    // ref: Jan 2014; oldest = Jan 2014 (delta ~0mo); recent = Dec 2025 (delta ~143mo)
    const earlyRef: MonthYear = { year: 2014, month: 0 };
    const rows: HeatRow[] = [
      { hood_158: 1, lat: 1, lng: 1, count: 10, occ_date: "2014-01-15" },
      { hood_158: 2, lat: 2, lng: 2, count: 10, occ_date: "2025-12-15" }
    ];
    const bins = computeHistBins(rows, earlyRef);
    const oldBin = bins.findIndex((b) => b > 0);
    const recentBin =
      bins.length - 1 - [...bins].reverse().findIndex((b) => b > 0);
    expect(recentBin).toBeGreaterThan(oldBin);
  });

  it("respects custom nBins", () => {
    const rows: HeatRow[] = [
      { hood_158: 1, lat: 1, lng: 1, count: 1, occ_date: "2025-01-01" }
    ];
    expect(computeHistBins(rows, REF14, 20)).toHaveLength(20);
    expect(computeHistBins(rows, REF14, 5)).toHaveLength(5);
  });
});

describe("getTimeWeight", () => {
  describe("lin", () => {
    it("returns 1 at delta=0", () => {
      expect(getTimeWeight("lin", 0, 10)).toBe(1);
    });
    it("returns 0 at delta=maxDelta", () => {
      expect(getTimeWeight("lin", 10, 10)).toBe(0);
    });
    it("returns 0.5 at delta=maxDelta/2", () => {
      expect(getTimeWeight("lin", 5, 10)).toBeCloseTo(0.5);
    });
    it("clamps to 0 when delta > maxDelta", () => {
      expect(getTimeWeight("lin", 20, 10)).toBe(0);
    });
  });

  describe("inv (k=1 default)", () => {
    it("returns 1 at delta=0", () => {
      expect(getTimeWeight("inv", 0, 10)).toBe(1);
    });
    it("returns 0.5 at delta=maxDelta (half-life at t=1 when k=1)", () => {
      expect(getTimeWeight("inv", 10, 10)).toBeCloseTo(0.5);
    });
    it("returns higher weight for smaller k (steeper decay)", () => {
      const gradual = getTimeWeight("inv", 5, 10, 1.0);
      const steep = getTimeWeight("inv", 5, 10, 0.2);
      expect(steep).toBeLessThan(gradual);
    });
    it("returns lower weight for larger k (more gradual decay)", () => {
      const gradual = getTimeWeight("inv", 5, 10, 2.0);
      const normal = getTimeWeight("inv", 5, 10, 1.0);
      expect(gradual).toBeGreaterThan(normal);
    });
  });

  describe("invquad (k=1 default)", () => {
    it("returns 1 at delta=0", () => {
      expect(getTimeWeight("invquad", 0, 10)).toBe(1);
    });
    it("returns 0.5 at delta=maxDelta (same endpoint as inv at k=1)", () => {
      expect(getTimeWeight("invquad", 10, 10)).toBeCloseTo(0.5);
    });
    it("is above inv at mid-range delta (flatter curve for t<1)", () => {
      // t=0.5: inv=1/(0.5+1)=0.667, invquad=1/(0.25+1)=0.8
      const inv = getTimeWeight("inv", 5, 10);
      const invquad = getTimeWeight("invquad", 5, 10);
      expect(invquad).toBeGreaterThan(inv);
    });
    it("k controls steepness: smaller k → lower weight at mid-range", () => {
      const gradual = getTimeWeight("invquad", 5, 10, 1.0);
      const steep = getTimeWeight("invquad", 5, 10, 0.2);
      expect(steep).toBeLessThan(gradual);
    });
  });

  describe("edge cases", () => {
    it("returns 1 when maxDelta is 0 (no temporal spread)", () => {
      expect(getTimeWeight("lin", 0, 0)).toBe(1);
      expect(getTimeWeight("inv", 0, 0)).toBe(1);
      expect(getTimeWeight("invquad", 0, 0)).toBe(1);
    });
    it("output is always in [0, 1]", () => {
      for (const type of ["lin", "inv", "invquad"] as const) {
        for (const delta of [0, 5, 10, 20]) {
          const w = getTimeWeight(type, delta, 10, 0.5);
          expect(w).toBeGreaterThanOrEqual(0);
          expect(w).toBeLessThanOrEqual(1);
        }
      }
    });
  });
});
