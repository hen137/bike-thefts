import Database from "better-sqlite3";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  createSchema,
  insertRecords,
  isStale,
  shouldRefetch
} from "@/workers/db-core";
import type { BikeTheftRecord } from "@/types/db";

function makeMockRecord(objectid: number): BikeTheftRecord {
  return {
    objectid,
    event_unique_id: `GO-${String(objectid).padStart(8, "0")}`,
    occ_date: "2024-06-15",
    occ_year: 2024,
    occ_month: 6,
    occ_dow: "Saturday",
    occ_day: 15,
    occ_doy: 167,
    occ_hour: 14,
    report_date: "2024-06-16",
    report_year: 2024,
    report_month: 6,
    division: "D14",
    location_type: "Street",
    premises_type: "Outside",
    hood_158: "Annex (95)",
    hood_140: "Annex (95)",
    bike_make: "Trek",
    bike_model: "FX3",
    bike_type: "RG",
    bike_speed: 21,
    bike_colour: "BLK",
    primary_offence: "THEFT UNDER - BICYCLE",
    lat: 43.6748,
    lng: -79.4058
  };
}

describe("isStale", () => {
  it("returns false when last_fetched is within 7 days", () => {
    const oneDayAgo = new Date(
      Date.now() - 1 * 24 * 60 * 60 * 1000
    ).toISOString();
    expect(isStale(oneDayAgo, 7)).toBe(false);
  });

  it("returns true when last_fetched is older than 7 days", () => {
    const eightDaysAgo = new Date(
      Date.now() - 8 * 24 * 60 * 60 * 1000
    ).toISOString();
    expect(isStale(eightDaysAgo, 7)).toBe(true);
  });

  it("returns true when last_fetched is null", () => {
    expect(isStale(null, 7)).toBe(true);
  });

  it("returns true when last_fetched is exactly on the boundary (7 days ago exactly)", () => {
    const exactlySevenDaysAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();
    expect(isStale(exactlySevenDaysAgo, 7)).toBe(true);
  });
});

describe("shouldRefetch", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(":memory:");
    createSchema(db as unknown as Parameters<typeof createSchema>[0]);
  });

  afterEach(() => {
    db.close();
  });

  it("returns false when DB count is >= 50% of API total", () => {
    // Insert 100 records; apiCount = 150 → 100/150 = 66.7% >= 50%
    const records = Array.from({ length: 100 }, (_, i) =>
      makeMockRecord(i + 1)
    );
    insertRecords(
      db as unknown as Parameters<typeof insertRecords>[0],
      records
    );
    expect(
      shouldRefetch(db as unknown as Parameters<typeof shouldRefetch>[0], 150)
    ).toBe(false);
  });

  it("returns true when DB count is < 50% of API total (corrupt/partial)", () => {
    // Insert 10 records; apiCount = 100 → 10/100 = 10% < 50%
    const records = Array.from({ length: 10 }, (_, i) => makeMockRecord(i + 1));
    insertRecords(
      db as unknown as Parameters<typeof insertRecords>[0],
      records
    );
    expect(
      shouldRefetch(db as unknown as Parameters<typeof shouldRefetch>[0], 100)
    ).toBe(true);
  });

  it("returns true when DB is empty and apiCount > 0", () => {
    expect(
      shouldRefetch(db as unknown as Parameters<typeof shouldRefetch>[0], 1)
    ).toBe(true);
  });

  it("returns false when both DB count and apiCount are 0", () => {
    expect(
      shouldRefetch(db as unknown as Parameters<typeof shouldRefetch>[0], 0)
    ).toBe(false);
  });
});
