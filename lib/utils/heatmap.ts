import type { HeatLatLngTuple } from "leaflet";
import type { HeatRow, HoodRow } from "@/types/db";
import { MonthYear } from "@/types/map";
import {
  isoStartOfMonth,
  isoEndOfMonth,
  monthsInRange,
  dateFromOffset
} from "@/lib/utils/date-range";

export interface HistBin {
  binStart: string;
  binEnd: string;
  count: number;
}

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

function monthsDelta(refDate: MonthYear, rowDate: Date): number {
  return Math.abs(
    (refDate.year - rowDate.getFullYear()) * 12 +
      (refDate.month - rowDate.getMonth())
  );
}

export function computeHistBins(
  rows: HeatRow[],
  startDate: MonthYear,
  endDate: MonthYear,
  maxBins: number = 12
): HistBin[] {
  const totalMonths = monthsInRange(startDate, endDate);

  let binWidthMonths: number;
  let nBins: number;
  if (totalMonths <= maxBins) {
    binWidthMonths = 1;
    nBins = totalMonths;
  } else {
    binWidthMonths = Math.ceil(totalMonths / maxBins);
    nBins = Math.floor(totalMonths / binWidthMonths);
  }

  const leftover = totalMonths - nBins * binWidthMonths;
  const frontExtra = Math.floor(leftover / 2);
  const backExtra = leftover - frontExtra;

  const widths = Array.from({ length: nBins }, (_, i) => {
    let w = binWidthMonths;
    if (i === 0) w += frontExtra;
    if (i === nBins - 1) w += backExtra;
    return w;
  });

  const offsetStarts: number[] = [];
  const offsetEnds: number[] = [];
  let cursor = 0;
  for (const w of widths) {
    offsetStarts.push(cursor);
    cursor += w;
    offsetEnds.push(cursor);
  }

  const bins: HistBin[] = widths.map((_, i) => {
    const binStartMY = dateFromOffset(startDate, -offsetStarts[i]);
    const binEndMY = dateFromOffset(startDate, -(offsetEnds[i] - 1));
    return {
      binStart: new Date(isoStartOfMonth(binStartMY)).toISOString(),
      binEnd: new Date(isoEndOfMonth(binEndMY)).toISOString(),
      count: 0
    };
  });

  const startOffset = startDate.year * 12 + startDate.month;
  for (const r of rows) {
    const rowDate = new Date(r.occ_date);
    const rowOffset =
      rowDate.getFullYear() * 12 + rowDate.getMonth() - startOffset;
    let idx = nBins - 1;
    for (let i = 0; i < nBins; i++) {
      if (rowOffset >= offsetStarts[i] && rowOffset < offsetEnds[i]) {
        idx = i;
        break;
      }
    }
    idx = Math.min(nBins - 1, Math.max(0, idx));
    bins[idx].count += r.count;
  }

  return bins;
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
      const deltas = value.map((r) =>
        monthsDelta(refDate, new Date(r.occ_date))
      );
      const maxDelta = Math.max(...deltas);

      value.forEach((r, i) => {
        const timeWeight =
          timeWeighting === "none"
            ? 1
            : getTimeWeight(timeWeighting, deltas[i], maxDelta, k);
        const int = (r.count / maxCount) * timeWeight;
        avgIntensities.push(int);
        values.push([r.lat, r.lng, int]);
      });
    }
  } else {
    const maxCount = Math.max(...rows.map((r) => r.count));
    const deltas = rows.map((r) => monthsDelta(refDate, new Date(r.occ_date)));
    const maxDelta = Math.max(...deltas);

    rows.forEach((row, i) => {
      const timeWeight =
        timeWeighting === "none"
          ? 1
          : getTimeWeight(timeWeighting, deltas[i], maxDelta, k);

      const int = (row.count / maxCount) * timeWeight;
      avgIntensities.push(int);
      values.push([row.lat, row.lng, int]);
    });
  }

  const avgIntensity =
    avgIntensities.reduce((sum, v) => sum + v, 0) / avgIntensities.length;

  return { values, avgIntensity };
}
