import * as Comlink from "comlink";
import SQLiteESMFactory from "wa-sqlite/dist/wa-sqlite.mjs";
import * as SQLite from "wa-sqlite";
import { AccessHandlePoolVFS } from "wa-sqlite/src/examples/AccessHandlePoolVFS.js";
import {
  createSchema,
  insertRecords,
  writeMeta,
  readMeta,
  isStale,
  shouldRefetch,
  queryHeatmap
} from "./db-core";
import { createWaSqliteDb } from "./wa-sqlite-adapter";
import type {
  BikeTheftRecord,
  DbInitResult,
  DbProgress,
  DbWorker,
  SQLiteDB
} from "@/types/db";

const DB_NAME = "bike-thefts.db";
// Directory used by the OPFS-backed VFS; the .db file lives inside it.
const OPFS_DIR = "/bike-thefts";
const ARCGIS_URL =
  "https://services.arcgis.com/S9th0jAJ7bqgIRjw/arcgis/rest/services/Bicycle_Thefts_Open_Data/FeatureServer/0/query?";
const MAX_RECORDS = 2000;
const TTL_DAYS = 7;

// Holds the SQLiteDB adapter (initialized lazily).
let db: SQLiteDB | null = null;

async function openDatabase(): Promise<SQLiteDB> {
  if (db) return db;

  const module = await SQLiteESMFactory();
  const sqlite3 = SQLite.Factory(module);

  let vfsName: string | undefined;
  try {
    // AccessHandlePoolVFS uses synchronous OPFS access handles and works with
    // the synchronous (non-Asyncify) wa-sqlite build.
    const vfs = new AccessHandlePoolVFS(OPFS_DIR);
    // The VFS opens OPFS access handles asynchronously during construction.
    await vfs.isReady;
    // wa-sqlite's VFS typings don't exactly match the SQLiteVFS parameter
    // shape; the runtime object is a valid VFS, so cast through unknown.
    sqlite3.vfs_register(
      vfs as unknown as Parameters<typeof sqlite3.vfs_register>[0],
      true
    );
    vfsName = vfs.name;
  } catch (err) {
    // OPFS may be unavailable (e.g. private browsing, unsupported browser).
    // Fall back to the default in-memory storage so the app still works,
    // losing only cross-session persistence.
    console.warn(
      "OPFS unavailable; falling back to in-memory SQLite (no persistence).",
      err
    );
    vfsName = undefined;
  }

  const dbPointer = await sqlite3.open_v2(
    DB_NAME,
    SQLite.SQLITE_OPEN_CREATE | SQLite.SQLITE_OPEN_READWRITE,
    vfsName
  );

  db = createWaSqliteDb(sqlite3, dbPointer);
  return db;
}

async function fetchTotalCount(): Promise<number> {
  const resp = await fetch(
    `${ARCGIS_URL}outFields=*&where=1%3D1&returnCountOnly=true&f=json`
  );
  if (!resp.ok)
    throw new Error(`ArcGIS count request failed: ${resp.statusText}`);
  return (await resp.json()).count as number;
}

async function fetchPage(offset: number): Promise<BikeTheftRecord[]> {
  const resp = await fetch(
    `${ARCGIS_URL}outFields=*&where=1%3D1&resultOffset=${offset}&resultRecordCount=${MAX_RECORDS}&f=geojson`
  );
  if (!resp.ok)
    throw new Error(`ArcGIS data request failed: ${resp.statusText}`);
  const geojson = await resp.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return geojson.features.map((f: any): BikeTheftRecord => {
    const p = f.properties;
    return {
      objectid: p.OBJECTID,
      event_unique_id: p.EVENT_UNIQUE_ID ?? "",
      occ_date: p.OCC_DATE
        ? new Date(p.OCC_DATE).toISOString().split("T")[0]
        : "",
      occ_year: parseInt(p.OCC_YEAR) || 0,
      occ_month: parseInt(p.OCC_MONTH) || 0,
      occ_dow: p.OCC_DOW ?? "",
      occ_day: parseInt(p.OCC_DAY) || 0,
      occ_doy: parseInt(p.OCC_DOY) || 0,
      occ_hour: parseInt(p.OCC_HOUR) || 0,
      report_date: p.REPORT_DATE
        ? new Date(p.REPORT_DATE).toISOString().split("T")[0]
        : "",
      report_year: parseInt(p.REPORT_YEAR) || 0,
      report_month: parseInt(p.REPORT_MONTH) || 0,
      division: p.DIVISION ?? "",
      location_type: p.LOCATION_TYPE ?? "",
      premises_type: p.PREMISES_TYPE ?? "",
      hood_158: p.HOOD_158 ?? "",
      hood_140: p.HOOD_140 ?? "",
      bike_make: p.BIKE_MAKE ?? "",
      bike_model: p.BIKE_MODEL ?? "",
      bike_type: p.BIKE_TYPE ?? "",
      bike_speed: parseInt(p.BIKE_SPEED) || 0,
      bike_colour: p.BIKE_COLOUR ?? "",
      primary_offence: p.PRIMARY_OFFENCE ?? "",
      lat: p.LAT_WGS84 ?? null,
      lng: p.LONG_WGS84 ?? null
    };
  });
}

async function fetchAndStore(
  theDb: SQLiteDB,
  onProgress: (event: DbProgress) => void,
  knownTotal?: number
): Promise<void> {
  const total = knownTotal ?? (await fetchTotalCount());
  const totalPages = Math.ceil(total / MAX_RECORDS);

  let fetched = 0;
  for (let page = 0; page < totalPages; page++) {
    onProgress({ type: "fetching", fetched, total });
    const records = await fetchPage(page * MAX_RECORDS);
    onProgress({ type: "inserting", page: page + 1, totalPages });
    await insertRecords(theDb, records);
    fetched += records.length;
  }
  await writeMeta(theDb, "last_fetched", new Date().toISOString());
  await writeMeta(theDb, "total_records", String(total));
}

const worker: DbWorker = {
  async init(onProgress) {
    const theDb = await openDatabase();
    await createSchema(theDb);

    const lastFetched = await readMeta(theDb, "last_fetched");

    let stale = isStale(lastFetched, TTL_DAYS);
    // Cache the API count so we never request it twice during init.
    let apiCount: number | undefined;
    if (!stale) {
      apiCount = await fetchTotalCount();
      stale = await shouldRefetch(theDb, apiCount);
    }

    if (stale) {
      // Wipe and re-fetch.
      await theDb.exec("DELETE FROM bike_thefts");
      await theDb.exec("DELETE FROM meta");
      await fetchAndStore(theDb, onProgress, apiCount);
    }

    const countRow = await theDb
      .prepare<{ count: number }>("SELECT COUNT(*) as count FROM bike_thefts")
      .get();
    const recordCount = countRow?.count ?? 0;

    onProgress({ type: "ready" });
    return {
      status: stale ? "fresh" : "cached",
      recordCount,
      lastFetched: await readMeta(theDb, "last_fetched"),
      minDate: await readMeta(theDb, "min_date"),
      maxDate: await readMeta(theDb, "max_date")
    } satisfies DbInitResult;
  },

  async queryHeatmap(startDate, endDate) {
    if (!db) throw new Error("DB not initialized");
    return queryHeatmap(db, startDate, endDate);
  },

  async refresh(onProgress) {
    if (!db) throw new Error("DB not initialized");
    await db.exec("DELETE FROM bike_thefts");
    await db.exec("DELETE FROM meta");
    await fetchAndStore(db, onProgress);
    onProgress({ type: "ready" });
  }
};

Comlink.expose(worker);
