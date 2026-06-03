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
  maxDelta: number = 1
): number {
  // console.log(type, delta, maxDelta);
  if (type !== "lin" && type !== "inv" && type !== "invquad") {
    throw new Error(`Invalid time weighting type: ${type}`);
  }

  if (maxDelta === 0) {
    return 1;
  }

  if (type === "lin") {
    return Math.max(0, -(delta / maxDelta) + 1);
  }
  if (type === "inv") {
    return 1 / (delta / maxDelta + 1);
  }
  if (type === "invquad") {
    return 1 / (delta ** 2 / maxDelta + 1);
  } else {
    return 1;
  }
}

export function buildHeatDataFromRows(
  rows: HeatRow[],
  byHood: boolean = false,
  timeWeighting: TimeWeightingType,
  refDate: MonthYear
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
                maxDelta
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
              maxDelta
            );

      const int = (row.count / maxCount) * timeWeight;
      avgIntensities.push(int);
      values.push([row.lat, row.lng, int]);
    });
  }

  return { values, avgIntensity: mean(avgIntensities) };
}
