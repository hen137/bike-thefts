import Database from "better-sqlite3";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  createSchema,
  insertRecords,
  queryCategoryRanking,
  queryDayOfWeek,
  queryHoodOffenceBreakdown
} from "@/workers/db-core";
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

describe("queryCategoryRanking", () => {
  let db: Database.Database;

  beforeEach(async () => {
    db = new Database(":memory:");
    await createSchema(adaptDb(db));
  });

  afterEach(() => {
    db.close();
  });

  it("groups by the requested category column and counts", async () => {
    await insertRecords(adaptDb(db), [
      makeMockRecord(1, { bike_colour: "BLK", occ_date: "2021-06-01" }),
      makeMockRecord(2, { bike_colour: "BLK", occ_date: "2021-06-02" }),
      makeMockRecord(3, { bike_colour: "RED", occ_date: "2021-06-03" })
    ]);

    const result = await queryCategoryRanking(
      adaptDb(db),
      "2021-01-01",
      "2021-12-31",
      "bike_colour"
    );

    expect(result).toEqual([
      { label: "BLK", count: 2 },
      { label: "RED", count: 1 }
    ]);
  });

  it("orders results by count descending and limits to 10", async () => {
    const records = Array.from({ length: 12 }, (_, i) =>
      makeMockRecord(i + 1, {
        primary_offence: `OFFENCE_${i}`,
        occ_date: "2021-06-01"
      })
    );
    // Make OFFENCE_0 appear 3 times so it ranks first.
    records.push(
      makeMockRecord(100, {
        primary_offence: "OFFENCE_0",
        occ_date: "2021-06-01"
      })
    );
    records.push(
      makeMockRecord(101, {
        primary_offence: "OFFENCE_0",
        occ_date: "2021-06-01"
      })
    );
    await insertRecords(adaptDb(db), records);

    const result = await queryCategoryRanking(
      adaptDb(db),
      "2021-01-01",
      "2021-12-31",
      "primary_offence"
    );

    expect(result).toHaveLength(10);
    expect(result[0]).toEqual({ label: "OFFENCE_0", count: 3 });
  });

  it("excludes records outside the date range", async () => {
    await insertRecords(adaptDb(db), [
      makeMockRecord(1, { bike_colour: "BLK", occ_date: "2020-01-01" }),
      makeMockRecord(2, { bike_colour: "RED", occ_date: "2021-06-01" })
    ]);

    const result = await queryCategoryRanking(
      adaptDb(db),
      "2021-01-01",
      "2021-12-31",
      "bike_colour"
    );

    expect(result).toEqual([{ label: "RED", count: 1 }]);
  });

  it("excludes null and empty-string category values", async () => {
    await insertRecords(adaptDb(db), [
      makeMockRecord(1, { bike_make: "", occ_date: "2021-06-01" }),
      makeMockRecord(2, { bike_make: "Trek", occ_date: "2021-06-01" })
    ]);

    const result = await queryCategoryRanking(
      adaptDb(db),
      "2021-01-01",
      "2021-12-31",
      "bike_make"
    );

    expect(result).toEqual([{ label: "Trek", count: 1 }]);
  });
});

describe("queryDayOfWeek", () => {
  let db: Database.Database;

  beforeEach(async () => {
    db = new Database(":memory:");
    await createSchema(adaptDb(db));
  });

  afterEach(() => {
    db.close();
  });

  it("groups by occ_dow and counts within date range", async () => {
    await insertRecords(adaptDb(db), [
      makeMockRecord(1, { occ_dow: "Monday", occ_date: "2021-06-01" }),
      makeMockRecord(2, { occ_dow: "Monday", occ_date: "2021-06-08" }),
      makeMockRecord(3, { occ_dow: "Friday", occ_date: "2021-06-05" }),
      makeMockRecord(4, { occ_dow: "Friday", occ_date: "2019-06-05" })
    ]);

    const result = await queryDayOfWeek(
      adaptDb(db),
      "2021-01-01",
      "2021-12-31"
    );

    expect(result).toEqual(
      expect.arrayContaining([
        { occ_dow: "Monday", count: 2 },
        { occ_dow: "Friday", count: 1 }
      ])
    );
    expect(result).toHaveLength(2);
  });
});

describe("queryHoodOffenceBreakdown", () => {
  let db: Database.Database;

  beforeEach(async () => {
    db = new Database(":memory:");
    await createSchema(adaptDb(db));
  });

  afterEach(() => {
    db.close();
  });

  it("groups by hood and offence within date range", async () => {
    await insertRecords(adaptDb(db), [
      makeMockRecord(1, {
        hood_158: "Annex (95)",
        primary_offence: "THEFT UNDER",
        occ_date: "2021-06-01"
      }),
      makeMockRecord(2, {
        hood_158: "Annex (95)",
        primary_offence: "THEFT UNDER",
        occ_date: "2021-06-02"
      }),
      makeMockRecord(3, {
        hood_158: "Annex (95)",
        primary_offence: "THEFT OVER",
        occ_date: "2021-06-03"
      }),
      makeMockRecord(4, {
        hood_158: "Yorkville (174)",
        primary_offence: "THEFT UNDER",
        occ_date: "2021-06-04"
      })
    ]);

    const result = await queryHoodOffenceBreakdown(
      adaptDb(db),
      "2021-01-01",
      "2021-12-31"
    );

    expect(result).toEqual(
      expect.arrayContaining([
        { hood_158: "Annex (95)", primary_offence: "THEFT UNDER", count: 2 },
        { hood_158: "Annex (95)", primary_offence: "THEFT OVER", count: 1 },
        {
          hood_158: "Yorkville (174)",
          primary_offence: "THEFT UNDER",
          count: 1
        }
      ])
    );
    expect(result).toHaveLength(3);
  });

  it("excludes records with null hood_158", async () => {
    await insertRecords(adaptDb(db), [
      makeMockRecord(1, { hood_158: "Annex (95)", occ_date: "2021-06-01" })
    ]);
    db.prepare(
      "INSERT INTO bike_thefts (objectid, occ_date, hood_158, primary_offence) VALUES (?, ?, NULL, ?)"
    ).run(999, "2021-06-01", "THEFT UNDER");

    const result = await queryHoodOffenceBreakdown(
      adaptDb(db),
      "2021-01-01",
      "2021-12-31"
    );

    expect(result).toHaveLength(1);
    expect(result[0].hood_158).toBe("Annex (95)");
  });
});
