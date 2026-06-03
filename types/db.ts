export interface SQLiteStatement<T = unknown> {
  run(...params: unknown[]): Promise<{
    changes: number;
    lastInsertRowid: number | bigint;
  }>;
  get(...params: unknown[]): Promise<T | undefined>;
  all(...params: unknown[]): Promise<T[]>;
}

export interface SQLiteDB {
  exec(sql: string): Promise<void>;
  prepare<T = unknown>(sql: string): SQLiteStatement<T>;
  transaction<T>(
    fn: (...args: unknown[]) => Promise<T>
  ): (...args: unknown[]) => Promise<T>;
}

// Matches each row returned by the heatmap SQL query
export type HeatRow = {
  hood_158: number;
  lat: number;
  lng: number;
  count: number;
};

//
export type HoodRow = {
  lat: number;
  lng: number;
  count: number;
};

// Progress events emitted from worker → main thread via Comlink callback
export type DbProgress =
  | { type: "fetching"; fetched: number; total: number }
  | { type: "inserting"; page: number; totalPages: number }
  | { type: "ready" }
  | { type: "error"; message: string };

// Result returned from worker.init()
export type DbInitResult = {
  status: "fresh" | "cached"; // 'fresh' = just fetched, 'cached' = loaded from OPFS
  recordCount: number;
  lastFetched: string | null; // ISO timestamp or null if never fetched
  minDate: string | null; // YYYY-MM-DD format or null if no records
  maxDate: string | null; // YYYY-MM-DD format or null if no records
};

// Comlink-exposed worker interface
export interface DbWorker {
  init(onProgress: (event: DbProgress) => void): Promise<DbInitResult>;
  queryHeatmap(startDate: string, endDate: string): Promise<HeatRow[]>;
  refresh(onProgress: (event: DbProgress) => void): Promise<DbInitResult>;
}

// Represents one raw ArcGIS bike theft record (matches BikeData properties shape)
export interface BikeTheftRecord {
  objectid: number;
  event_unique_id: string;
  occ_date: string; // ISO date string e.g. "2020-06-15"
  occ_year: number;
  occ_month: number;
  occ_dow: string;
  occ_day: number;
  occ_doy: number;
  occ_hour: number;
  report_date: string;
  report_year: number;
  report_month: number;
  division: string;
  location_type: string;
  premises_type: string;
  hood_158: string;
  hood_140: string;
  bike_make: string;
  bike_model: string;
  bike_type: string;
  bike_speed: number;
  bike_colour: string;
  primary_offence: string;
  lat: number | null;
  lng: number | null;
}
