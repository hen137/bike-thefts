import { describe, it, expect } from "vitest";
import { cn, calcNormalDistribution } from "@/lib/utils";

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
