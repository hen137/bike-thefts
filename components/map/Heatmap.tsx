"use client";

import { use, useEffect } from "react";
import { HeatmapProps } from "@/types/components";
import { useLeafletMap, useLeafletHeatLayer } from "@/hooks";
import { buildHeatData } from "@/lib/utils/heatmap";

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
    if (map) {
      const { values, seenMean, stdev, avgIntensity } = buildHeatData(
        bikeData,
        dateRanges
      );
      updateMean(seenMean);
      updateStd(stdev);
      updateAvgIntensity(avgIntensity);
      setHeatValues(values);
    }
  }, [heatLayer, dateRanges]);

  return null;
}
