import type { HeatLatLngTuple } from "leaflet";
import { mean } from "simple-statistics";
import type { HeatRow, HoodRow } from "@/types/db";
import { MonthYear } from "@/types/map";

type TimeWeightingType = "none" | "lin" | "inv" | "invquad";
export interface HeatDataResult {
  values: HeatLatLngTuple[];
  avgIntensity: number;
}

export function getTimeWeight(
  type: "lin" | "inv" | "invquad",
  delta: number,
  maxDelta: number,
  k: number = 1.0
): number {
  if (maxDelta === 0) return 1;
  const t = delta / maxDelta;
  if (type === "lin") return Math.max(0, 1 - t);
  if (type === "inv") return k / (t + k);
  if (type === "invquad") return k / (t * t + k);
  return 1;
}

export function computeHistBins(
  rows: HeatRow[],
  refDate: MonthYear,
  nBins: number = 14
): number[] {
  if (rows.length === 0) return new Array(nBins).fill(0);

  let maxDelta = 0;
  const deltas: number[] = [];
  for (const r of rows) {
    const rowDate = new Date(r.occ_date);
    const delta = Math.max(
      0,
      (refDate.year - rowDate.getFullYear()) * 12 +
        (refDate.month - rowDate.getMonth())
    );
    deltas.push(delta);
    if (delta > maxDelta) maxDelta = delta;
  }

  const bins = new Array(nBins).fill(0);
  if (maxDelta === 0) {
    bins[0] = 1;
    return bins;
  }

  rows.forEach((r, i) => {
    const t = deltas[i] / maxDelta;
    const idx = Math.min(nBins - 1, Math.floor(t * nBins));
    bins[idx] += r.count;
  });

  const maxBin = Math.max(...bins);
  return maxBin === 0 ? bins : bins.map((b) => b / maxBin);
}

export function buildHeatDataFromRows(
  rows: HeatRow[],
  byHood: boolean = false,
  timeWeighting: TimeWeightingType,
  refDate: MonthYear,
  k: number = 1.0
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
    rows.forEach((row) => {
      const hoodRow = {
        lat: row.lat,
        lng: row.lng,
        count: row.count,
        occ_date: row.occ_date
      };
      if (hoods[row.hood_158]) {
        hoods[row.hood_158].push(hoodRow);
      } else {
        hoods[row.hood_158] = [hoodRow];
      }
    });

    for (const value of Object.values(hoods)) {
      const maxCount = Math.max(...value.map((r) => r.count));
      const maxDelta = Math.max(
        ...value.map((r) => {
          const rowDate = new Date(r.occ_date);
          return (
            (refDate.year - rowDate.getFullYear()) * 12 +
            (refDate.month - rowDate.getMonth())
          );
        })
      );

      value.map((r) => {
        const rowDate = new Date(r.occ_date);
        const timeWeight =
          timeWeighting === "none"
            ? 1
            : getTimeWeight(
                timeWeighting,
                (refDate.year - rowDate.getFullYear()) * 12 +
                  (refDate.month - rowDate.getMonth()),
                maxDelta,
                k
              );
        const int = (r.count / maxCount) * timeWeight;
        avgIntensities.push(int);
        values.push([r.lat, r.lng, int]);
      });
    }
  } else {
    const maxCount = Math.max(...rows.map((r) => r.count));
    const maxDelta = Math.max(
      ...rows.map((r) => {
        const rowDate = new Date(r.occ_date);
        return (
          (refDate.year - rowDate.getFullYear()) * 12 +
          (refDate.month - rowDate.getMonth())
        );
      })
    );

    rows.forEach((row) => {
      const rowDate = new Date(row.occ_date);
      const timeWeight =
        timeWeighting === "none"
          ? 1
          : getTimeWeight(
              timeWeighting,
              (refDate.year - rowDate.getFullYear()) * 12 +
                (refDate.month - rowDate.getMonth()),
              maxDelta,
              k
            );

      const int = (row.count / maxCount) * timeWeight;
      avgIntensities.push(int);
      values.push([row.lat, row.lng, int]);
    });
  }

  return { values, avgIntensity: mean(avgIntensities) };
}
