import { describe, it, expect } from "vitest";
import {
  isValidZoom,
  isValidBounds,
  isValidCoordinate,
  validateMapConfig,
  isValidTileUrl,
  clampZoom
} from "@/lib/utils/validation";

describe("isValidZoom", () => {
  it("accepts zoom within default range", () => {
    expect(isValidZoom(10)).toBe(true);
  });
  it("accepts boundary values", () => {
    expect(isValidZoom(0)).toBe(true);
    expect(isValidZoom(18)).toBe(true);
  });
  it("rejects below min", () => {
    expect(isValidZoom(-1)).toBe(false);
  });
  it("rejects above max", () => {
    expect(isValidZoom(19)).toBe(false);
  });
  it("rejects NaN", () => {
    expect(isValidZoom(NaN)).toBe(false);
  });
  it("rejects non-number", () => {
    expect(isValidZoom("10" as unknown as number)).toBe(false);
  });
  it("respects custom min/max", () => {
    expect(isValidZoom(5, 6, 18)).toBe(false);
    expect(isValidZoom(5, 4, 6)).toBe(true);
  });
});

describe("isValidBounds", () => {
  it("accepts valid bounds", () => {
    expect(
      isValidBounds([
        [43.6, -79.6],
        [43.9, -79.1]
      ])
    ).toBe(true);
  });
  it("rejects inverted lat (min > max)", () => {
    expect(
      isValidBounds([
        [43.9, -79.6],
        [43.6, -79.1]
      ])
    ).toBe(false);
  });
  it("rejects lat out of global range", () => {
    expect(
      isValidBounds([
        [-91, -79.6],
        [43.9, -79.1]
      ])
    ).toBe(false);
    expect(
      isValidBounds([
        [43.6, -79.6],
        [91, -79.1]
      ])
    ).toBe(false);
  });
  it("rejects lng out of global range", () => {
    expect(
      isValidBounds([
        [43.6, -181],
        [43.9, -79.1]
      ])
    ).toBe(false);
    expect(
      isValidBounds([
        [43.6, -79.6],
        [43.9, 181]
      ])
    ).toBe(false);
  });
  it("rejects NaN values", () => {
    expect(
      isValidBounds([
        [NaN, -79.6],
        [43.9, -79.1]
      ])
    ).toBe(false);
  });
});

describe("isValidCoordinate (validation module)", () => {
  it("accepts valid coordinate", () => {
    expect(isValidCoordinate([43.7, -79.4])).toBe(true);
  });
  it("rejects NaN lat", () => {
    expect(isValidCoordinate([NaN, -79.4])).toBe(false);
  });
  it("rejects non-number", () => {
    expect(isValidCoordinate(["43" as unknown as number, -79.4])).toBe(false);
  });
  it("rejects out of range", () => {
    expect(isValidCoordinate([91, 0])).toBe(false);
  });
});

describe("validateMapConfig", () => {
  it("accepts valid config", () => {
    const result = validateMapConfig({
      defaultCenter: [43.7, -79.4],
      defaultZoom: 12,
      minZoom: 9,
      maxZoom: 16
    });
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
  it("errors on minZoom > maxZoom", () => {
    const result = validateMapConfig({ minZoom: 16, maxZoom: 9 });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("less than"))).toBe(true);
  });
  it("errors on defaultZoom below minZoom", () => {
    const result = validateMapConfig({ defaultZoom: 5, minZoom: 9 });
    expect(result.isValid).toBe(false);
  });
  it("errors on defaultZoom above maxZoom", () => {
    const result = validateMapConfig({ defaultZoom: 20, maxZoom: 16 });
    expect(result.isValid).toBe(false);
  });
  it("accepts empty config", () => {
    const result = validateMapConfig({});
    expect(result.isValid).toBe(true);
  });
  it("errors on invalid center", () => {
    const result = validateMapConfig({ defaultCenter: [200, 0] });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("center"))).toBe(true);
  });
});

describe("isValidTileUrl", () => {
  it("accepts valid tile template", () => {
    expect(isValidTileUrl("https://tile.example.com/{z}/{x}/{y}.png")).toBe(
      true
    );
  });
  it("rejects missing {z}", () => {
    expect(isValidTileUrl("https://tile.example.com/{x}/{y}.png")).toBe(false);
  });
  it("rejects missing {x}", () => {
    expect(isValidTileUrl("https://tile.example.com/{z}/{y}.png")).toBe(false);
  });
  it("rejects missing {y}", () => {
    expect(isValidTileUrl("https://tile.example.com/{z}/{x}.png")).toBe(false);
  });
  it("rejects empty string", () => {
    expect(isValidTileUrl("")).toBe(false);
  });
  it("rejects non-string", () => {
    expect(isValidTileUrl(null as unknown as string)).toBe(false);
  });
});

describe("clampZoom", () => {
  it("returns value within range unchanged", () => {
    expect(clampZoom(10)).toBe(10);
  });
  it("clamps below min to min", () => {
    expect(clampZoom(-5)).toBe(0);
  });
  it("clamps above max to max", () => {
    expect(clampZoom(25)).toBe(18);
  });
  it("respects custom bounds", () => {
    expect(clampZoom(20, 9, 16)).toBe(16);
    expect(clampZoom(5, 9, 16)).toBe(9);
  });
});
