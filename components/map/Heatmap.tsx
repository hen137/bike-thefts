"use client";

import { use, useCallback, useEffect } from "react";
import type { HeatLatLngTuple } from "leaflet";
import { mean, standardDeviation } from "simple-statistics";
import { RefDate } from "@/types/map";
import { HeatmapProps } from "@/types/components";
import { useLeafletMap, useLeafletHeatLayer } from "@/hooks";
import { calcNormalDistribution } from "@/lib/utils";
import { SENTINAL_COORDINATES } from "@/constants/map-config";

export function Heatmap({
  bikeDataPromise,
  dateRanges,
  blur,
  radius,
  maxZoom,
  // gradient,
  updateMean,
  updateStd,
  updateAvgIntensity
}: HeatmapProps) {
  const map = useLeafletMap();
  const { heatLayer, setHeatValues, setHeatOptions } = useLeafletHeatLayer();
  const bikeData = use(bikeDataPromise);

  const isInRange = useCallback(
    ({ month, year }: RefDate): boolean => {
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
    },
    [dateRanges]
  );

  // update heatmap settings
  useEffect(() => {
    setHeatOptions({
      blur,
      radius,
      maxZoom
      // gradient
    });
  }, [heatLayer, blur, radius, maxZoom]);

  // draw heatmap
  useEffect(() => {
    // query database w/ ranges
    // build values from query

    if (map) {
      // let totalRecords = 0;
      const seen: {
        [index: string]: { value: number; coords: [number, number] };
      } = {};
      bikeData.forEach((batch) => {
        batch.features.forEach((record) => {
          if (
            isInRange({
              month: record.properties.OCC_MONTH,
              year: record.properties.OCC_YEAR
            })
          ) {
            const coords = record.geometry.coordinates;
            if (!coords || coords.length < 2) return;

            // if (!inToronto(coords)) return

            const coordsIndex = coords[1].toString() + coords[0].toString();

            // skips records with no location
            if (coordsIndex === SENTINAL_COORDINATES) return;

            if (seen[coordsIndex])
              seen[coordsIndex].value = seen[coordsIndex].value + 1;
            else
              seen[coordsIndex] = { value: 1, coords: [coords[0], coords[1]] };

            // totalRecords++;
          }
        });
      });

      let occ: number[] = [];
      for (const value of Object.values(seen)) {
        occ = occ.concat([value.value]);
      }

      const seenMean = mean(occ);
      const stdev = standardDeviation(occ);

      updateMean(seenMean);
      updateStd(stdev);

      let values: HeatLatLngTuple[] = [];
      let avgIntesities: number[] = [];
      for (const key of Object.keys(seen)) {
        const intensity = calcNormalDistribution(
          seen[key].value,
          seenMean,
          stdev
        );
        avgIntesities = avgIntesities.concat([intensity]);
        values = values.concat([
          [seen[key].coords[1], seen[key].coords[0], intensity]
        ]);
      }

      updateAvgIntensity(mean(avgIntesities));
      setHeatValues(values);
    }
  }, [heatLayer, dateRanges]);

  return null;
}
