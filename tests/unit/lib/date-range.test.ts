import { describe, it, expect } from "vitest";
import {
  monthYearFromISODate,
  isoStartOfMonth,
  isoEndOfMonth,
  dateFromOffset,
  monthsInRange
} from "@/lib/utils/date-range";

describe("monthYearFromISODate", () => {
  it("parses YYYY-MM-DD into month (0-indexed) and year", () => {
    expect(monthYearFromISODate("2026-08-15")).toEqual({
      month: 7,
      year: 2026
    });
  });

  it("does not shift a day-1 date backward a month due to UTC/local parsing", () => {
    expect(monthYearFromISODate("2026-08-01")).toEqual({
      month: 7,
      year: 2026
    });
  });
});

describe("isoStartOfMonth", () => {
  it("returns first day of month as ISO string", () => {
    expect(isoStartOfMonth({ month: 7, year: 2026 })).toBe("2026-08-01");
  });
});

describe("isoEndOfMonth", () => {
  it("returns last day of month as ISO string", () => {
    expect(isoEndOfMonth({ month: 1, year: 2024 })).toBe("2024-02-29"); // leap year
    expect(isoEndOfMonth({ month: 0, year: 2023 })).toBe("2023-01-31");
  });
});

describe("dateFromOffset", () => {
  it("subtracts months, wrapping year boundary", () => {
    expect(dateFromOffset({ month: 1, year: 2026 }, 6)).toEqual({
      month: 7,
      year: 2025
    });
  });

  it("subtracts months within same year", () => {
    expect(dateFromOffset({ month: 7, year: 2026 }, 3)).toEqual({
      month: 4,
      year: 2026
    });
  });
});

describe("monthsInRange", () => {
  it("counts inclusive months between start and end", () => {
    expect(
      monthsInRange(
        { month: 0, year: 2026 }, // Jan 2026
        { month: 5, year: 2026 } // Jun 2026
      )
    ).toBe(6);
  });

  it("returns 1 for same month", () => {
    expect(
      monthsInRange({ month: 3, year: 2026 }, { month: 3, year: 2026 })
    ).toBe(1);
  });

  it("handles year boundary", () => {
    expect(
      monthsInRange({ month: 10, year: 2025 }, { month: 1, year: 2026 })
    ).toBe(4); // Nov, Dec, Jan, Feb
  });
});
