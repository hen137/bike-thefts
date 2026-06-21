import type {
  SQLiteDB,
  BikeTheftRecord,
  HeatRow,
  CategoryColumn,
  CategoryRankingRow,
  DayOfWeekRow,
  HoodOffenceRow
} from "@/types/db";

/**
 * Returns true if the last_fetched timestamp is older than ttlDays,
 * or if last_fetched is null (never fetched).
 * Boundary is exclusive: age >= ttlDays returns true.
 */
export function isStale(lastFetched: string | null, ttlDays: number): boolean {
  if (!lastFetched) return true;
  const fetchedAt = new Date(lastFetched).getTime();
  const ageMs = Date.now() - fetchedAt;
  const ttlMs = ttlDays * 24 * 60 * 60 * 1000;
  return ageMs >= ttlMs;
}

/**
 * Returns true if the local DB record count is < 50% of the API total count,
 * indicating a corrupt or partial fetch that should be redone.
 */
export async function shouldRefetch(
  db: SQLiteDB,
  apiCount: number
): Promise<boolean> {
  if (apiCount === 0) return false;
  const row = await db
    .prepare<{ count: number }>("SELECT COUNT(*) as count FROM bike_thefts")
    .get();
  const localCount = row?.count ?? 0;
  return localCount / apiCount < 0.5;
}

const SENTINEL_LAT = 5.08888749034163e-14;
const SENTINEL_LNG = 5.6843418860808e-14;

export async function createSchema(db: SQLiteDB): Promise<void> {
  await db.exec(`
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

export async function insertRecords(
  db: SQLiteDB,
  records: BikeTheftRecord[]
): Promise<void> {
  // Sentinel check uses && (both must be sentinel) because ArcGIS always
  // sets both coords to the sentinel pair together; a partial sentinel never occurs in practice.
  const filtered = records.filter(
    (r) =>
      r.lat !== null &&
      r.lng !== null &&
      !(r.lat === SENTINEL_LAT && r.lng === SENTINEL_LNG)
  );

  const stmt = db.prepare<unknown>(`
    INSERT OR IGNORE INTO bike_thefts (
      objectid, event_unique_id, occ_date, occ_year, occ_month, occ_dow,
      occ_day, occ_doy, occ_hour, report_date, report_year, report_month,
      division, location_type, premises_type, hood_158, hood_140,
      bike_make, bike_model, bike_type, bike_speed, bike_colour,
      primary_offence, lat, lng
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?
    )
  `);

  const insertMany = db.transaction(async () => {
    for (const r of filtered) {
      await stmt.run(
        r.objectid,
        r.event_unique_id,
        r.occ_date,
        r.occ_year,
        r.occ_month,
        r.occ_dow,
        r.occ_day,
        r.occ_doy,
        r.occ_hour,
        r.report_date,
        r.report_year,
        r.report_month,
        r.division,
        r.location_type,
        r.premises_type,
        r.hood_158,
        r.hood_140,
        r.bike_make,
        r.bike_model,
        r.bike_type,
        r.bike_speed,
        r.bike_colour,
        r.primary_offence,
        r.lat,
        r.lng
      );
    }
  });

  await insertMany();

  const minRow = await db
    .prepare<{ v: string }>("SELECT MIN(occ_date) as v FROM bike_thefts")
    .get();
  const maxRow = await db
    .prepare<{ v: string }>("SELECT MAX(occ_date) as v FROM bike_thefts")
    .get();
  if (minRow?.v) await writeMeta(db, "min_date", minRow.v);
  if (maxRow?.v) await writeMeta(db, "max_date", maxRow.v);
}

export async function writeMeta(
  db: SQLiteDB,
  key: string,
  value: string
): Promise<void> {
  await db
    .prepare<unknown>("INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)")
    .run(key, value);
}

export async function readMeta(
  db: SQLiteDB,
  key: string
): Promise<string | null> {
  const row = await db
    .prepare<{ value: string }>("SELECT value FROM meta WHERE key = ?")
    .get(key);
  return row !== undefined ? row.value : null;
}

export async function queryHeatmap(
  db: SQLiteDB,
  startDate: string,
  endDate: string
): Promise<HeatRow[]> {
  return await db
    .prepare<HeatRow>(
      `SELECT hood_158, lat, lng, COUNT(*) as count, occ_date
       FROM bike_thefts
       WHERE occ_date >= ? AND occ_date <= ?
         AND lat IS NOT NULL AND lng IS NOT NULL
       GROUP BY hood_158, lat, lng`
    )
    .all(startDate, endDate);
}

// Fixed allowlist of SQL column names. `column` is interpolated into the
// query string below (SQL placeholders can't parameterize column names), so
// this mapping is what keeps that interpolation safe — it can only ever
// resolve to one of these literal strings, never an arbitrary caller value.
const CATEGORY_COLUMNS: Record<CategoryColumn, string> = {
  bike_colour: "bike_colour",
  primary_offence: "primary_offence",
  premises_type: "premises_type",
  bike_make: "bike_make"
};

export async function queryCategoryRanking(
  db: SQLiteDB,
  startDate: string,
  endDate: string,
  column: CategoryColumn
): Promise<CategoryRankingRow[]> {
  const col = CATEGORY_COLUMNS[column];
  return await db
    .prepare<CategoryRankingRow>(
      `SELECT ${col} as label, COUNT(*) as count
       FROM bike_thefts
       WHERE occ_date >= ? AND occ_date <= ?
         AND ${col} IS NOT NULL AND ${col} != ''
       GROUP BY ${col}
       ORDER BY count DESC
       LIMIT 10`
    )
    .all(startDate, endDate);
}

export async function queryDayOfWeek(
  db: SQLiteDB,
  startDate: string,
  endDate: string
): Promise<DayOfWeekRow[]> {
  return await db
    .prepare<DayOfWeekRow>(
      `SELECT occ_dow, COUNT(*) as count
       FROM bike_thefts
       WHERE occ_date >= ? AND occ_date <= ?
       GROUP BY occ_dow`
    )
    .all(startDate, endDate);
}

export async function queryHoodOffenceBreakdown(
  db: SQLiteDB,
  startDate: string,
  endDate: string
): Promise<HoodOffenceRow[]> {
  return await db
    .prepare<HoodOffenceRow>(
      `SELECT hood_158, primary_offence, COUNT(*) as count
       FROM bike_thefts
       WHERE occ_date >= ? AND occ_date <= ?
         AND hood_158 IS NOT NULL
       GROUP BY hood_158, primary_offence`
    )
    .all(startDate, endDate);
}
