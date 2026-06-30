import { describe, it, expect } from "vitest";
import { aggregateHoodBreakdown } from "@/lib/utils/hood-breakdown";
import type { HoodOffenceRow } from "@/types/db";

describe("aggregateHoodBreakdown", () => {
  it("sums total count per hood across offence types", () => {
    const rows: HoodOffenceRow[] = [
      { hood_158: "Annex (95)", primary_offence: "THEFT UNDER", count: 5 },
      { hood_158: "Annex (95)", primary_offence: "THEFT OVER", count: 3 }
    ];

    const result = aggregateHoodBreakdown(rows, 4);

    expect(result).toHaveLength(1);
    expect(result[0].hood_158).toBe("Annex (95)");
    expect(result[0].total).toBe(8);
  });

  it("returns top 3 offence categories sorted by count descending", () => {
    const rows: HoodOffenceRow[] = [
      { hood_158: "Annex (95)", primary_offence: "THEFT UNDER", count: 5 },
      {
        hood_158: "Annex (95)",
        primary_offence: "ROBBERY - MUGGING",
        count: 3
      },
      { hood_158: "Annex (95)", primary_offence: "B&E", count: 2 },
      { hood_158: "Annex (95)", primary_offence: "ASSAULT", count: 1 }
    ];

    const result = aggregateHoodBreakdown(rows, 1);

    expect(result[0].topOffences).toEqual([
      { label: "Theft (Bicycle)", count: 5 },
      { label: "Robbery", count: 3 },
      { label: "Break & Enter", count: 2 }
    ]);
  });

  it("computes avgPerMonth as total divided by months in range", () => {
    const rows: HoodOffenceRow[] = [
      { hood_158: "Annex (95)", primary_offence: "A", count: 10 }
    ];

    const result = aggregateHoodBreakdown(rows, 5);

    expect(result[0].avgPerMonth).toBeCloseTo(2);
  });

  it("produces one entry per distinct hood", () => {
    const rows: HoodOffenceRow[] = [
      { hood_158: "Annex (95)", primary_offence: "A", count: 1 },
      { hood_158: "Yorkville (174)", primary_offence: "A", count: 1 }
    ];

    const result = aggregateHoodBreakdown(rows, 1);

    expect(result.map((r) => r.hood_158).sort()).toEqual([
      "Annex (95)",
      "Yorkville (174)"
    ]);
  });

  it("returns empty array for empty input", () => {
    expect(aggregateHoodBreakdown([], 1)).toEqual([]);
  });
});
