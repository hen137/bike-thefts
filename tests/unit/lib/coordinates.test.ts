import { describe, it, expect } from "vitest";
import {
  isValidCoordinate,
  formatCoordinate,
  parseCoordinate,
  formatDecimalDegrees,
  decimalToDMS,
  formatDMS,
  normalizeLongitude,
  clampLatitude,
  normalizeCoordinate,
  calculateDistance
} from "@/lib/utils/coordinates";

describe("isValidCoordinate", () => {
  it("accepts valid coordinate", () => {
    expect(isValidCoordinate([43.7, -79.4])).toBe(true);
  });
  it("rejects lat > 90", () => {
    expect(isValidCoordinate([91, 0])).toBe(false);
  });
  it("rejects lat < -90", () => {
    expect(isValidCoordinate([-91, 0])).toBe(false);
  });
  it("rejects lng > 180", () => {
    expect(isValidCoordinate([0, 181])).toBe(false);
  });
  it("rejects lng < -180", () => {
    expect(isValidCoordinate([0, -181])).toBe(false);
  });
  it("accepts boundary values", () => {
    expect(isValidCoordinate([90, 180])).toBe(true);
    expect(isValidCoordinate([-90, -180])).toBe(true);
  });
});

describe("formatCoordinate", () => {
  it("formats north/east correctly", () => {
    expect(formatCoordinate([51.505, 0.09])).toBe("51.505000°N, 0.090000°E");
  });
  it("formats south/west correctly", () => {
    expect(formatCoordinate([-33.86, -70.65])).toBe("33.860000°S, 70.650000°W");
  });
  it("respects custom precision", () => {
    expect(formatCoordinate([51.505, 0.09], 2)).toBe("51.51°N, 0.09°E");
  });
});

describe("parseCoordinate", () => {
  it("round-trips with formatCoordinate", () => {
    const coord: [number, number] = [43.7, -79.4];
    const formatted = formatCoordinate(coord);
    const parsed = parseCoordinate(formatted);
    expect(parsed).not.toBeNull();
    expect(parsed![0]).toBeCloseTo(coord[0], 5);
    expect(parsed![1]).toBeCloseTo(coord[1], 5);
  });
  it("returns null for malformed string", () => {
    expect(parseCoordinate("not a coord")).toBeNull();
  });
  it("returns null for out-of-range coord", () => {
    expect(parseCoordinate("91.000000°N, 0.000000°E")).toBeNull();
  });
});

describe("formatDecimalDegrees", () => {
  it("formats positive coords", () => {
    expect(formatDecimalDegrees([43.7, 79.4])).toBe("43.700000, 79.400000");
  });
  it("formats negative coords", () => {
    expect(formatDecimalDegrees([-33.86, -70.65])).toBe(
      "-33.860000, -70.650000"
    );
  });
});

describe("decimalToDMS", () => {
  it("converts a known value", () => {
    const result = decimalToDMS(51.5);
    expect(result.degrees).toBe(51);
    expect(result.minutes).toBe(30);
    expect(result.seconds).toBeCloseTo(0, 1);
  });
  it("handles zero", () => {
    const result = decimalToDMS(0);
    expect(result.degrees).toBe(0);
    expect(result.minutes).toBe(0);
    expect(result.seconds).toBeCloseTo(0, 1);
  });
  it("handles negative (uses absolute value)", () => {
    const pos = decimalToDMS(51.5);
    const neg = decimalToDMS(-51.5);
    expect(neg.degrees).toBe(pos.degrees);
    expect(neg.minutes).toBe(pos.minutes);
  });
});

describe("formatDMS", () => {
  it("includes direction letters", () => {
    const result = formatDMS([43.7, -79.4]);
    expect(result).toContain("N");
    expect(result).toContain("W");
  });
  it("includes degree symbols", () => {
    const result = formatDMS([0, 0]);
    expect(result).toContain("°");
  });
});

describe("normalizeLongitude", () => {
  it("leaves in-range value unchanged", () => {
    expect(normalizeLongitude(90)).toBe(90);
  });
  it("wraps longitude > 180", () => {
    expect(normalizeLongitude(270)).toBe(-90);
  });
  it("wraps longitude < -180", () => {
    expect(normalizeLongitude(-270)).toBe(90);
  });
  it("wraps 360 to 0", () => {
    expect(normalizeLongitude(360)).toBe(0);
  });
});

describe("clampLatitude", () => {
  it("clamps above 90", () => {
    expect(clampLatitude(100)).toBe(90);
  });
  it("clamps below -90", () => {
    expect(clampLatitude(-100)).toBe(-90);
  });
  it("leaves in-range value unchanged", () => {
    expect(clampLatitude(45)).toBe(45);
  });
});

describe("normalizeCoordinate", () => {
  it("clamps lat and wraps lng", () => {
    const [lat, lng] = normalizeCoordinate([100, 270]);
    expect(lat).toBe(90);
    expect(lng).toBe(-90);
  });
  it("leaves valid coord unchanged", () => {
    expect(normalizeCoordinate([43.7, -79.4])).toEqual([43.7, -79.4]);
  });
});

describe("calculateDistance", () => {
  it("returns 0 for same point", () => {
    expect(calculateDistance([43.7, -79.4], [43.7, -79.4])).toBe(0);
  });
  it("calculates Toronto to Scarborough (~12 km)", () => {
    const dist = calculateDistance([43.6532, -79.3832], [43.7731, -79.2576]);
    expect(dist).toBeGreaterThan(10000);
    expect(dist).toBeLessThan(20000);
  });
  it("is symmetric", () => {
    const a: [number, number] = [43.6532, -79.3832];
    const b: [number, number] = [43.7731, -79.2576];
    expect(calculateDistance(a, b)).toBeCloseTo(calculateDistance(b, a), 1);
  });
});
