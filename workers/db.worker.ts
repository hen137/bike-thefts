import * as Comlink from "comlink";
import SQLiteESMFactory from "wa-sqlite/dist/wa-sqlite.mjs";
import * as SQLite from "wa-sqlite";
import { OPFSCoopSyncVFS } from "wa-sqlite/src/examples/OPFSCoopSyncVFS.js";
import {
  createSchema,
  insertRecords,
  writeMeta,
  readMeta,
  isStale,
  shouldRefetch,
  queryHeatmap
} from "./db-core";
import type {
  BikeTheftRecord,
  DbInitResult,
  DbProgress,
  DbWorker,
  SQLiteDB
} from "@/types/db";

const DB_NAME = "bike-thefts.db";
const ARCGIS_URL =
  "https://services.arcgis.com/S9th0jAJ7bqgIRjw/arcgis/rest/services/Bicycle_Thefts_Open_Data/FeatureServer/0/query?";
const MAX_RECORDS = 2000;
const TTL_DAYS = 7;

// Holds the wa-sqlite DB handle (initialized lazily)
let db: SQLite.Database | null = null;

async function openDatabase(): Promise<SQLite.Database> {
  if (db) return db;
  const module = await SQLiteESMFactory();
  const vfs = await OPFSCoopSyncVFS.create(DB_NAME, module);
  SQLite.installVFS(module, vfs);
  db = await SQLite.open(module, DB_NAME);
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
    `${ARCGIS_URL}outFields=*&where=1%3D1&resultOffset=${offset}&f=geojson`
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
  theDb: SQLite.Database,
  onProgress: (event: DbProgress) => void
): Promise<void> {
  const total = await fetchTotalCount();
  const totalPages = Math.ceil(total / MAX_RECORDS);

  let fetched = 0;
  for (let page = 0; page < totalPages; page++) {
    onProgress({ type: "fetching", fetched, total });
    const records = await fetchPage(page * MAX_RECORDS);
    onProgress({ type: "inserting", page: page + 1, totalPages });
    insertRecords(theDb as unknown as SQLiteDB, records);
    fetched += records.length;
  }
  writeMeta(
    theDb as unknown as SQLiteDB,
    "last_fetched",
    new Date().toISOString()
  );
  writeMeta(theDb as unknown as SQLiteDB, "total_records", String(total));
}

const worker: DbWorker = {
  async init(onProgress) {
    const theDb = await openDatabase();
    const dbInterface = theDb as unknown as SQLiteDB;
    createSchema(dbInterface);

    const lastFetched = readMeta(dbInterface, "last_fetched");

    let stale = isStale(lastFetched, TTL_DAYS);
    if (!stale) {
      const apiCount = await fetchTotalCount();
      stale = shouldRefetch(dbInterface, apiCount);
    }

    if (stale) {
      // Wipe and re-fetch
      (theDb as unknown as SQLiteDB).exec("DELETE FROM bike_thefts");
      (theDb as unknown as SQLiteDB).exec("DELETE FROM meta");
      await fetchAndStore(theDb, onProgress);
    }

    const countRow = dbInterface
      .prepare<{ count: number }>("SELECT COUNT(*) as count FROM bike_thefts")
      .get();
    const recordCount = countRow?.count ?? 0;

    onProgress({ type: "ready" });
    return {
      status: stale ? "fresh" : "cached",
      recordCount,
      lastFetched: readMeta(dbInterface, "last_fetched")
    } satisfies DbInitResult;
  },

  async queryHeatmap(startDate, endDate) {
    if (!db) throw new Error("DB not initialized");
    return queryHeatmap(db as unknown as SQLiteDB, startDate, endDate);
  },

  async refresh(onProgress) {
    if (!db) throw new Error("DB not initialized");
    const dbInterface = db as unknown as SQLiteDB;
    dbInterface.exec("DELETE FROM bike_thefts");
    dbInterface.exec("DELETE FROM meta");
    await fetchAndStore(db, onProgress);
    onProgress({ type: "ready" });
  }
};

Comlink.expose(worker);
