import Database from "better-sqlite3";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createSchema, insertRecords, queryHeatmap } from "@/workers/db-core";
import { adaptDb } from "../helpers/sync-db-adapter";
import type { BikeTheftRecord } from "@/types/db";

function makeMockRecord(
  objectid: number,
  overrides: Partial<BikeTheftRecord> = {}
): BikeTheftRecord {
  return {
    objectid,
    event_unique_id: `GO-${objectid}`,
    occ_date: "2021-06-01",
    occ_year: 2021,
    occ_month: 6,
    occ_dow: "Tuesday",
    occ_day: 1,
    occ_doy: 152,
    occ_hour: 10,
    report_date: "2021-06-02",
    report_year: 2021,
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
    lat: 43.7,
    lng: -79.4,
    ...overrides
  };
}

describe("queryHeatmap", () => {
  let db: Database.Database;

  beforeEach(async () => {
    db = new Database(":memory:");
    await createSchema(adaptDb(db));
  });

  afterEach(() => {
    db.close();
  });

  it("returns only records in date range", async () => {
    await insertRecords(adaptDb(db), [
      makeMockRecord(1, { occ_date: "2020-01-15", lat: 43.65, lng: -79.38 }),
      makeMockRecord(2, { occ_date: "2021-06-01", lat: 43.66, lng: -79.39 }),
      makeMockRecord(3, { occ_date: "2022-12-31", lat: 43.67, lng: -79.4 })
    ]);

    const result = await queryHeatmap(adaptDb(db), "2020-01-01", "2021-12-31");

    expect(result).toHaveLength(2);
    const dates = result.map((r) => r);
    // Both the 2020 and 2021 records should appear; 2022 should not
    expect(result.some((r) => r.lat === 43.65 && r.lng === -79.38)).toBe(true);
    expect(result.some((r) => r.lat === 43.66 && r.lng === -79.39)).toBe(true);
    expect(dates).not.toContainEqual(expect.objectContaining({ lat: 43.67 }));
  });

  it("groups records at same coordinate into single HeatRow with correct count", async () => {
    await insertRecords(adaptDb(db), [
      makeMockRecord(1, { lat: 43.7, lng: -79.4, occ_date: "2021-06-01" }),
      makeMockRecord(2, { lat: 43.7, lng: -79.4, occ_date: "2021-06-01" }),
      makeMockRecord(3, { lat: 43.7, lng: -79.4, occ_date: "2021-06-01" })
    ]);

    const result = await queryHeatmap(adaptDb(db), "2021-01-01", "2021-12-31");

    expect(result).toHaveLength(1);
    expect(result[0].lat).toBeCloseTo(43.7);
    expect(result[0].lng).toBeCloseTo(-79.4);
    expect(result[0].count).toBe(3);
  });

  it("excludes records with null lat or lng", async () => {
    await insertRecords(adaptDb(db), [
      makeMockRecord(1, { lat: 43.7, lng: -79.4, occ_date: "2021-06-01" })
    ]);
    // Insert directly, bypassing insertRecords null filtering
    db.prepare(
      "INSERT INTO bike_thefts (objectid, occ_date, lat, lng) VALUES (?, ?, NULL, NULL)"
    ).run(999, "2021-06-01");

    const result = await queryHeatmap(adaptDb(db), "2021-01-01", "2021-12-31");

    expect(result).toHaveLength(1);
    expect(result[0].lat).toBeCloseTo(43.7);
    expect(result[0].lng).toBeCloseTo(-79.4);
  });

  it("returns empty array when no records match date range", async () => {
    await insertRecords(adaptDb(db), [
      makeMockRecord(1, { occ_date: "2020-01-15", lat: 43.7, lng: -79.4 })
    ]);

    const result = await queryHeatmap(adaptDb(db), "2023-01-01", "2023-12-31");

    expect(result).toEqual([]);
  });

  it("handles single record correctly", async () => {
    await insertRecords(adaptDb(db), [
      makeMockRecord(1, {
        occ_date: "2021-03-10",
        lat: 43.65,
        lng: -79.38,
        hood_158: "123"
      })
    ]);

    const result = await queryHeatmap(adaptDb(db), "2021-01-01", "2021-12-31");

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      hood_158: "123",
      lat: 43.65,
      lng: -79.38,
      count: 1
    });
  });

  it("multiple distinct coordinates return separate HeatRows", async () => {
    await insertRecords(adaptDb(db), [
      makeMockRecord(1, { lat: 43.65, lng: -79.38, occ_date: "2021-06-01" }),
      makeMockRecord(2, { lat: 43.7, lng: -79.42, occ_date: "2021-07-15" })
    ]);

    const result = await queryHeatmap(adaptDb(db), "2021-01-01", "2021-12-31");

    expect(result).toHaveLength(2);
    expect(result.some((r) => r.lat === 43.65 && r.lng === -79.38)).toBe(true);
    expect(result.some((r) => r.lat === 43.7 && r.lng === -79.42)).toBe(true);
  });
});
