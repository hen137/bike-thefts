import { describe, it, expect } from "vitest";
import { cn, calcNormalDistribution, calcRawSliderToDates } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });
  it("handles falsy values", () => {
    expect(cn("foo", false, undefined, null, "bar")).toBe("foo bar");
  });
  it("deduplicates conflicting Tailwind classes", () => {
    expect(cn("p-4", "p-2")).toBe("p-2");
  });
});

describe("calcNormalDistribution", () => {
  it("returns peak value when x equals mean", () => {
    const peak = calcNormalDistribution(5, 5, 1);
    const offset = calcNormalDistribution(6, 5, 1);
    expect(peak).toBeGreaterThan(offset);
  });
  it("returns near zero for x far from mean", () => {
    const val = calcNormalDistribution(100, 5, 1);
    expect(val).toBeCloseTo(0, 10);
  });
  it("matches known analytical value (x=0, mean=0, std=1)", () => {
    const expected = 1 / Math.sqrt(2 * Math.PI);
    expect(calcNormalDistribution(0, 0, 1)).toBeCloseTo(expected, 8);
  });
  it("returns positive for any input", () => {
    expect(calcNormalDistribution(3, 5, 2)).toBeGreaterThan(0);
  });
});

describe("calcRawSliderToDates", () => {
  const RANGE = 1000;
  const lower = new Date(2014, 0); // Jan 2014
  const upper = new Date(2024, 11); // Dec 2024
  const bounds = { lowerBound: lower, upperBound: upper };

  it("slider at 0 returns lowerBound month/year", () => {
    const { startDate } = calcRawSliderToDates([0, RANGE], RANGE, bounds);
    expect(startDate).toEqual({ month: 0, year: 2014 });
  });

  it("slider at max returns upperBound month/year", () => {
    const { endDate } = calcRawSliderToDates([0, RANGE], RANGE, bounds);
    expect(endDate).toEqual({ month: 11, year: 2024 });
  });

  it("both thumbs at 0 return lowerBound for start and end", () => {
    const { startDate, endDate } = calcRawSliderToDates([0, 0], RANGE, bounds);
    expect(startDate).toEqual({ month: 0, year: 2014 });
    expect(endDate).toEqual({ month: 0, year: 2014 });
  });

  it("both thumbs at max return upperBound for start and end", () => {
    const { startDate, endDate } = calcRawSliderToDates(
      [RANGE, RANGE],
      RANGE,
      bounds
    );
    expect(startDate).toEqual({ month: 11, year: 2024 });
    expect(endDate).toEqual({ month: 11, year: 2024 });
  });

  it("midpoint thumb maps near middle of date range", () => {
    // 131 months total (Jan 2014 → Dec 2024 inclusive)
    // thumb at 500/1000 ≈ month 65 offset → Jul 2019
    const { startDate } = calcRawSliderToDates([500, RANGE], RANGE, bounds);
    expect(startDate.year).toBeGreaterThanOrEqual(2018);
    expect(startDate.year).toBeLessThanOrEqual(2020);
  });

  it("month is 0-indexed in returned value", () => {
    // upperBound is month 11 (Dec), not 12
    const { endDate } = calcRawSliderToDates([0, RANGE], RANGE, bounds);
    expect(endDate.month).toBe(11);
    expect(endDate.month).toBeLessThan(12);
  });

  it("startDate never exceeds endDate when thumbs in order", () => {
    for (const lo of [0, 250, 500, 750]) {
      const { startDate, endDate } = calcRawSliderToDates(
        [lo, RANGE],
        RANGE,
        bounds
      );
      const startMs = startDate.year * 12 + startDate.month;
      const endMs = endDate.year * 12 + endDate.month;
      expect(startMs).toBeLessThanOrEqual(endMs);
    }
  });

  it("works when bounds span less than one year", () => {
    const lo = new Date(2020, 3); // Apr 2020
    const hi = new Date(2020, 8); // Sep 2020
    const { startDate, endDate } = calcRawSliderToDates([0, RANGE], RANGE, {
      lowerBound: lo,
      upperBound: hi
    });
    expect(startDate).toEqual({ month: 3, year: 2020 });
    expect(endDate).toEqual({ month: 8, year: 2020 });
  });

  it("works when bounds cross a year boundary", () => {
    const lo = new Date(2023, 10); // Nov 2023
    const hi = new Date(2024, 1); // Feb 2024
    const { startDate, endDate } = calcRawSliderToDates([0, RANGE], RANGE, {
      lowerBound: lo,
      upperBound: hi
    });
    expect(startDate).toEqual({ month: 10, year: 2023 });
    expect(endDate).toEqual({ month: 1, year: 2024 });
  });

  it("performance: 10 000 calls complete in under 50 ms", () => {
    const t0 = performance.now();
    for (let i = 0; i < 10_000; i++) {
      calcRawSliderToDates([i % RANGE, RANGE], RANGE, bounds);
    }
    expect(performance.now() - t0).toBeLessThan(50);
  });
});
