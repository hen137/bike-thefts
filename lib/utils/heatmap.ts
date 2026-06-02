import type { HeatLatLngTuple } from "leaflet";
import { mean } from "simple-statistics";
import type { HeatRow, HoodRow } from "@/types/db";

export interface HeatDataResult {
  values: HeatLatLngTuple[];
  avgIntensity: number;
}

export function buildHeatDataFromRows(
  rows: HeatRow[],
  byHood: boolean = false
): HeatDataResult {
  if (rows.length === 0) {
    return { values: [], avgIntensity: 0 };
  }

  const values: HeatLatLngTuple[] = [];
  const avgIntensities: number[] = [];

  if (byHood) {
    // stratified sampling (Hood 158)
    const hoods: {
      [index: number]: HoodRow[];
    } = {};
    rows.forEach((row) =>
      hoods[row.hood_158]
        ? hoods[row.hood_158].push({
            lat: row.lat,
            lng: row.lng,
            count: row.count
          })
        : (hoods[row.hood_158] = [
            { lat: row.lat, lng: row.lng, count: row.count }
          ])
    );

    for (const value of Object.values(hoods)) {
      const max = Math.max(...value.map((r) => r.count));

      value.map((r) => {
        const int = r.count / max;
        avgIntensities.push(int);
        values.push([r.lat, r.lng, int]);
      });
    }
  } else {
    const max = Math.max(...rows.map((r) => r.count));

    for (const row of rows) {
      const intensity = row.count / max;
      avgIntensities.push(intensity);
      values.push([row.lat, row.lng, intensity]);
    }
  }

  return { values, avgIntensity: mean(avgIntensities) };
}
