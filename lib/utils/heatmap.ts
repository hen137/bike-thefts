import type { HeatLatLngTuple } from "leaflet";
import { mean, standardDeviation } from "simple-statistics";
import { calcNormalDistribution } from "@/lib/utils";
import { SENTINAL_COORDINATES } from "@/constants/map-config";
import type { BikeData, RefDate, StartEndDates } from "@/types/map";

export function isInRange(
  dateRanges: StartEndDates,
  { month, year }: RefDate
): boolean {
  if (!dateRanges.endDate || !dateRanges.startDate) return false;

  const m = new Date(Date.parse(month + " 1, 2012")).getMonth();
  const y = parseInt(year);

  const gtStart =
    y == dateRanges.startDate.year
      ? m >= dateRanges.startDate.month
      : y >= dateRanges.startDate.year;
  const ltEnd =
    y == dateRanges.endDate.year
      ? m <= dateRanges.endDate.month
      : y <= dateRanges.endDate.year;

  return gtStart && ltEnd;
}

export interface HeatDataResult {
  values: HeatLatLngTuple[];
  seenMean: number;
  stdev: number;
  avgIntensity: number;
}

export function buildHeatData(
  bikeData: BikeData,
  dateRanges: StartEndDates
): HeatDataResult {
  const seen: { [index: string]: { value: number; coords: [number, number] } } =
    {};

  bikeData.forEach((batch) => {
    batch.features.forEach((record) => {
      if (
        isInRange(dateRanges, {
          month: record.properties.OCC_MONTH,
          year: record.properties.OCC_YEAR
        })
      ) {
        const coords = record.geometry.coordinates;
        if (!coords || coords.length < 2) return;

        const coordsIndex = coords[1].toString() + coords[0].toString();
        if (coordsIndex === SENTINAL_COORDINATES) return;

        if (seen[coordsIndex])
          seen[coordsIndex].value = seen[coordsIndex].value + 1;
        else seen[coordsIndex] = { value: 1, coords: [coords[0], coords[1]] };
      }
    });
  });

  const occ = Object.values(seen).map((v) => v.value);
  const seenMean = mean(occ);
  const stdev = standardDeviation(occ);

  const values: HeatLatLngTuple[] = [];
  const avgIntensities: number[] = [];

  for (const key of Object.keys(seen)) {
    const intensity = calcNormalDistribution(seen[key].value, seenMean, stdev);
    avgIntensities.push(intensity);
    values.push([seen[key].coords[1], seen[key].coords[0], intensity]);
  }

  return { values, seenMean, stdev, avgIntensity: mean(avgIntensities) };
}
