# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Next.js 16 (App Router) app visualizing Toronto bike theft hotspots on a Leaflet heatmap. Single route (`/`) renders a dashboard layout: map + date-range histogram + rankings + time charts + neighbourhood breakdown table + footer. Some sections are placeholders pending implementation.

## Commands

```bash
pnpm dev             # dev server at http://localhost:3000 (--webpack)
pnpm build           # production build
pnpm start           # serve production build
pnpm test            # vitest unit tests (single pass)
pnpm test:coverage   # coverage report
pnpm test:related <file>  # vitest related --run
pnpm lint            # ESLint
pnpm lint:fix        # ESLint with auto-fix
pnpm type-check      # tsc --noEmit
npx playwright test  # E2E tests (requires running dev server)
```

Husky + lint-staged run on commit. Commitlint enforces conventional commits.

## Architecture

### Provider hierarchy

```
ThemeProviderWrapper          (next-themes)
  DbProvider                  (contexts/DbContext — Comlink worker + db init/progress)
    MapErrorBoundary
      MapProvider              (contexts/MapContext — Leaflet map instance)
        TileProvider           (contexts/TileContext — active tile layer)
          DataProvider         (contexts/DataContext — query date range, heat rows, time weighting)
            MapMain, DateRangeGraph, dashboard sections
```

`Toaster` (sonner) and `DbLoadingBar` mount in `app/layout.tsx` outside the page tree and read `DbContext` directly.

### Data pipeline

Bike theft data comes from the Toronto Police ArcGIS REST API. All DB work runs off the main thread:

1. `lib/db-client.ts` — singleton `getDbWorker()` spawns `workers/db.worker.ts` via `new Worker(new URL(...))` and wraps it with **Comlink**. Must be called inside `useEffect` (no `Worker` in SSR).
2. `workers/db.worker.ts` — fetches GeoJSON pages from ArcGIS (2000 rec/page), stores them in **wa-sqlite** (WASM SQLite) backed by OPFS (`AccessHandlePoolVFS`, falls back to in-memory if unavailable). TTL 7 days; re-fetches when stale or local record count < 50% of API total (corruption guard).
3. `workers/db-core.ts` — pure async SQL helpers: `createSchema`, `insertRecords`, `writeMeta`, `readMeta`, `isStale`, `shouldRefetch`, `queryHeatmap`.
4. `workers/wa-sqlite-adapter.ts` — wraps wa-sqlite's pointer API (`open_v2`, `prepare_v2`, `step`, ...) into the async `SQLiteDB` interface used elsewhere.
5. `DbContext` holds `Remote<DbWorker>` in a **ref**, not state — React would otherwise call the Comlink proxy's functions as state-updater callbacks.

### Heatmap rendering

`MapOptions` owns date-range + municipal/neighbourhood toggle state. On change it calls `worker.queryHeatmap(startISO, endISO)`, results land in `DataContext` (`rows: HeatRow[]`). `LeafletHeatLayer` converts rows via `lib/utils/heatmap.ts:buildHeatDataFromRows` — intensity = `(count / maxCount) * timeWeight`, where time weighting is one of none / linear / inverse (`k/(t+k)`) / inverse-quad (`k/(t²+k)`), `t` = months-from-edge / max-months. When `byHood` is set, weighting is stratified and normalized per `hood_158`.

### Database schema

```sql
CREATE TABLE bike_thefts (
  objectid INTEGER PRIMARY KEY,
  occ_date TEXT,   -- ISO YYYY-MM-DD, indexed
  lat REAL,        -- null allowed; filtered at insert
  lng REAL,
  hood_158 ...     -- + other fields, see workers/db-core.ts
);
CREATE INDEX idx_occ_date ON bike_thefts(occ_date);
CREATE INDEX idx_lat_lng  ON bike_thefts(lat, lng);

CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT);
-- keys: last_fetched, total_records, min_date, max_date
```

## Key Patterns & Gotchas

**Comlink proxy in React state:** `Remote<DbWorker>` is a `Proxy`. Never store it in `useState`. Use `useRef` + a separate boolean state to trigger re-renders.

**Comlink callbacks must use `Comlink.proxy()`:** functions can't cross the worker boundary via `postMessage` un-wrapped, e.g. `worker.init(Comlink.proxy(onProgress))`.

**COEP header must be `credentialless`** (`next.config.ts`): `require-corp` blocks cross-origin tile images (OSM, CARTO, ESRI CDNs); `credentialless` still enables `SharedArrayBuffer` in Chrome/Edge 91+.

**Worker creation is client-side only:** `getDbWorker()` must run inside `useEffect`.

**`OPFSCoopSyncVFS` does not exist** — use `AccessHandlePoolVFS`.

**ArcGIS null coordinates:** sentinel pair `5.08888749034163e-14` / `5.6843418860808e-14` marks missing coords; filtered at insert in `db-core.ts` (also referenced, with a typo, as `SENTINAL_COORDINATES` in `constants/map-config.ts`).

**`occ_date` format:** ArcGIS returns `OCC_DATE` as epoch ms; converted via `new Date(p.OCC_DATE).toISOString().split('T')[0]`.

**Leaflet is client-side only:** all map components are `"use client"`. The map instance lives in `MapContext` — never create a second instance.

## Conventions

- `types/` holds shared TypeScript interfaces by domain (`map.ts`, `contexts.ts`, `components.ts`, `hooks.ts`, `theme.ts`, `db.ts`, `data.ts`).
- Consume context only through custom hooks in `hooks/` — never directly from components.
- `@/` alias resolves to the worktree root (`tsconfig.json`).
- Tests use `better-sqlite3` + a sync SQL adapter for `db-core` logic (no real OPFS/browser needed).
- Tile providers in `constants/tile-providers.ts`; "Heavy Metal" (Thunderforest) needs an API key, not yet wired up.
