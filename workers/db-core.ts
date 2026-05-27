import type { SQLiteDB } from "@/types/db";

export function createSchema(db: SQLiteDB): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS bike_thefts (
      objectid          INTEGER PRIMARY KEY,
      event_unique_id   TEXT,
      occ_date          TEXT,
      occ_year          INTEGER,
      occ_month         INTEGER,
      occ_dow           TEXT,
      occ_day           INTEGER,
      occ_doy           INTEGER,
      occ_hour          INTEGER,
      report_date       TEXT,
      report_year       INTEGER,
      report_month      INTEGER,
      division          TEXT,
      location_type     TEXT,
      premises_type     TEXT,
      hood_158          TEXT,
      hood_140          TEXT,
      bike_make         TEXT,
      bike_model        TEXT,
      bike_type         TEXT,
      bike_speed        INTEGER,
      bike_colour       TEXT,
      primary_offence   TEXT,
      -- lat/lng intentionally allow NULL in schema; sentinel filtering in insertRecords() prevents NULL coords from being stored
      lat               REAL,
      lng               REAL
    );
    CREATE TABLE IF NOT EXISTS meta (
      key   TEXT PRIMARY KEY,
      value TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_occ_date ON bike_thefts(occ_date);
    CREATE INDEX IF NOT EXISTS idx_lat_lng  ON bike_thefts(lat, lng);
  `);
}
