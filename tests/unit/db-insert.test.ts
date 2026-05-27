import Database from "better-sqlite3";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  createSchema,
  insertRecords,
  writeMeta,
  readMeta
} from "@/workers/db-core";
import type { BikeTheftRecord } from "@/types/db";

// Test helper: cast better-sqlite3 DB to SQLiteDB interface
// better-sqlite3's Database is structurally compatible with SQLiteDB

function makeRecord(overrides: Partial<BikeTheftRecord> = {}): BikeTheftRecord {
  return {
    objectid: 1,
    event_unique_id: "GO-20240001",
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
    lng: -79.4058,
    ...overrides
  };
}

describe("insertRecords", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(":memory:");
    createSchema(db as unknown as Parameters<typeof createSchema>[0]);
  });

  afterEach(() => {
    db.close();
  });

  it("inserts all fields from a BikeTheftRecord", () => {
    const record = makeRecord();
    insertRecords(db as unknown as Parameters<typeof insertRecords>[0], [
      record
    ]);

    const row = db
      .prepare("SELECT * FROM bike_thefts WHERE objectid = ?")
      .get(1) as BikeTheftRecord | undefined;

    expect(row).toBeDefined();
    expect(row!.objectid).toBe(record.objectid);
    expect(row!.event_unique_id).toBe(record.event_unique_id);
    expect(row!.occ_date).toBe(record.occ_date);
    expect(row!.occ_year).toBe(record.occ_year);
    expect(row!.occ_month).toBe(record.occ_month);
    expect(row!.occ_dow).toBe(record.occ_dow);
    expect(row!.occ_day).toBe(record.occ_day);
    expect(row!.occ_doy).toBe(record.occ_doy);
    expect(row!.occ_hour).toBe(record.occ_hour);
    expect(row!.report_date).toBe(record.report_date);
    expect(row!.report_year).toBe(record.report_year);
    expect(row!.report_month).toBe(record.report_month);
    expect(row!.division).toBe(record.division);
    expect(row!.location_type).toBe(record.location_type);
    expect(row!.premises_type).toBe(record.premises_type);
    expect(row!.hood_158).toBe(record.hood_158);
    expect(row!.hood_140).toBe(record.hood_140);
    expect(row!.bike_make).toBe(record.bike_make);
    expect(row!.bike_model).toBe(record.bike_model);
    expect(row!.bike_type).toBe(record.bike_type);
    expect(row!.bike_speed).toBe(record.bike_speed);
    expect(row!.bike_colour).toBe(record.bike_colour);
    expect(row!.primary_offence).toBe(record.primary_offence);
    expect(row!.lat).toBeCloseTo(record.lat as number);
    expect(row!.lng).toBeCloseTo(record.lng as number);
  });

  it("INSERT OR IGNORE: duplicate objectid does not throw or overwrite", () => {
    const original = makeRecord({
      objectid: 1,
      event_unique_id: "ORIGINAL-001"
    });
    const duplicate = makeRecord({
      objectid: 1,
      event_unique_id: "DUPLICATE-002"
    });

    insertRecords(db as unknown as Parameters<typeof insertRecords>[0], [
      original
    ]);
    // Should not throw
    expect(() =>
      insertRecords(db as unknown as Parameters<typeof insertRecords>[0], [
        duplicate
      ])
    ).not.toThrow();

    const count = (
      db
        .prepare("SELECT COUNT(*) as cnt FROM bike_thefts WHERE objectid = 1")
        .get() as { cnt: number }
    ).cnt;
    expect(count).toBe(1);

    const row = db
      .prepare("SELECT event_unique_id FROM bike_thefts WHERE objectid = 1")
      .get() as { event_unique_id: string };
    expect(row.event_unique_id).toBe("ORIGINAL-001");
  });

  it("filters out sentinel coordinates before insert", () => {
    // Sentinel: lat = 5.08888749034163e-14, lng = 5.6843418860808e-14
    const sentinel = makeRecord({
      objectid: 42,
      lat: 5.08888749034163e-14,
      lng: 5.6843418860808e-14
    });

    insertRecords(db as unknown as Parameters<typeof insertRecords>[0], [
      sentinel
    ]);

    const count = (
      db.prepare("SELECT COUNT(*) as cnt FROM bike_thefts").get() as {
        cnt: number;
      }
    ).cnt;
    expect(count).toBe(0);
  });

  it("wraps batch in single transaction (atomicity): inserts all 3 records", () => {
    const records = [
      makeRecord({ objectid: 10 }),
      makeRecord({ objectid: 20 }),
      makeRecord({ objectid: 30 })
    ];

    insertRecords(
      db as unknown as Parameters<typeof insertRecords>[0],
      records
    );

    const count = (
      db.prepare("SELECT COUNT(*) as cnt FROM bike_thefts").get() as {
        cnt: number;
      }
    ).cnt;
    expect(count).toBe(3);
  });
});

describe("writeMeta / readMeta", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(":memory:");
    createSchema(db as unknown as Parameters<typeof createSchema>[0]);
  });

  afterEach(() => {
    db.close();
  });

  it("writeMeta stores key-value; readMeta retrieves it", () => {
    writeMeta(
      db as unknown as Parameters<typeof writeMeta>[0],
      "last_fetched",
      "2026-05-27T00:00:00.000Z"
    );

    const result = readMeta(
      db as unknown as Parameters<typeof readMeta>[0],
      "last_fetched"
    );
    expect(result).toBe("2026-05-27T00:00:00.000Z");
  });

  it("readMeta returns null for missing key", () => {
    const result = readMeta(
      db as unknown as Parameters<typeof readMeta>[0],
      "nonexistent"
    );
    expect(result).toBeNull();
  });
});
