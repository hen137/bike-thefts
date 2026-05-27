import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { createSchema } from "@/workers/db-core";

describe("createSchema", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(":memory:");
  });

  afterEach(() => {
    db.close();
  });

  it("creates the bike_thefts table with correct columns", () => {
    createSchema(db);

    const columns = db
      .prepare("PRAGMA table_info(bike_thefts)")
      .all() as Array<{ name: string; type: string; pk: number }>;

    const columnNames = columns.map((c) => c.name);

    expect(columnNames).toContain("objectid");
    expect(columnNames).toContain("lat");
    expect(columnNames).toContain("lng");
    expect(columnNames).toContain("occ_date");
    expect(columnNames).toContain("event_unique_id");
    expect(columnNames).toContain("occ_year");
    expect(columnNames).toContain("occ_month");
    expect(columnNames).toContain("occ_dow");
    expect(columnNames).toContain("occ_day");
    expect(columnNames).toContain("occ_doy");
    expect(columnNames).toContain("occ_hour");
    expect(columnNames).toContain("report_date");
    expect(columnNames).toContain("report_year");
    expect(columnNames).toContain("report_month");
    expect(columnNames).toContain("division");
    expect(columnNames).toContain("location_type");
    expect(columnNames).toContain("premises_type");
    expect(columnNames).toContain("hood_158");
    expect(columnNames).toContain("hood_140");
    expect(columnNames).toContain("bike_make");
    expect(columnNames).toContain("bike_model");
    expect(columnNames).toContain("bike_type");
    expect(columnNames).toContain("bike_speed");
    expect(columnNames).toContain("bike_colour");
    expect(columnNames).toContain("primary_offence");

    // objectid should be PRIMARY KEY
    const pk = columns.find((c) => c.name === "objectid");
    expect(pk?.pk).toBe(1);
  });

  it("creates the meta table with key and value columns", () => {
    createSchema(db);

    const columns = db.prepare("PRAGMA table_info(meta)").all() as Array<{
      name: string;
      type: string;
      pk: number;
    }>;

    const columnNames = columns.map((c) => c.name);

    expect(columnNames).toContain("key");
    expect(columnNames).toContain("value");

    // key should be PRIMARY KEY
    const pk = columns.find((c) => c.name === "key");
    expect(pk?.pk).toBe(1);
  });

  it("creates index idx_occ_date on bike_thefts(occ_date)", () => {
    createSchema(db);

    const indexes = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='bike_thefts'"
      )
      .all() as Array<{ name: string }>;

    const indexNames = indexes.map((r) => r.name);
    expect(indexNames).toContain("idx_occ_date");
  });

  it("creates index idx_lat_lng on bike_thefts(lat, lng)", () => {
    createSchema(db);

    const indexes = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='bike_thefts'"
      )
      .all() as Array<{ name: string }>;

    const indexNames = indexes.map((r) => r.name);
    expect(indexNames).toContain("idx_lat_lng");
  });

  it("is idempotent — calling createSchema twice does not throw", () => {
    expect(() => {
      createSchema(db);
      createSchema(db);
    }).not.toThrow();
  });
});
