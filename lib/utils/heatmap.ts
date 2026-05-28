import type { HeatLatLngTuple } from "leaflet";
import { mean, standardDeviation } from "simple-statistics";
import { calcNormalDistribution } from "@/lib/utils";
import type { HeatRow } from "@/types/db";

export interface HeatDataResult {
  values: HeatLatLngTuple[];
  seenMean: number;
  stdev: number;
  avgIntensity: number;
}

export function buildHeatDataFromRows(rows: HeatRow[]): HeatDataResult {
  if (rows.length === 0) {
    return { values: [], seenMean: 0, stdev: 0, avgIntensity: 0 };
  }

  const counts = rows.map((r) => r.count);
  const seenMean = mean(counts);
  const stdev = standardDeviation(counts);

  const values: HeatLatLngTuple[] = [];
  const avgIntensities: number[] = [];

  for (const row of rows) {
    const intensity =
      stdev === 0 ? 1 : calcNormalDistribution(row.count, seenMean, stdev);
    avgIntensities.push(intensity);
    values.push([row.lat, row.lng, intensity]);
  }

  return { values, seenMean, stdev, avgIntensity: mean(avgIntensities) };
}
