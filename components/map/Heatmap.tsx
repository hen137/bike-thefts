"use client";

import { use, useCallback, useEffect } from "react";
import type { HeatLatLngTuple, LatLng } from "leaflet";
import { useLeafletMap, useLeafletHeatLayer } from "@/hooks";

interface HeatmapProps {
  bikeData: Promise<{ features: { geometry: { coordinates: number[] } }[] }>;
  //   onSliderChange: (
  //     map: Map,
  //     values: (LatLng | HeatLatLngTuple)[]
  //   ) => Promise<void>;
}

export function Heatmap({ bikeData }: HeatmapProps) {
  const map = useLeafletMap();
  const heatLayer = useLeafletHeatLayer();

  const bikeThefts = use(bikeData);

  const drawHeatmap = useCallback(
    async (values: (LatLng | HeatLatLngTuple)[]) => {
      if (heatLayer) heatLayer.setLatLngs(values);
    },
    [heatLayer]
  );

  useEffect(() => {
    console.log(bikeThefts);
    const values: HeatLatLngTuple[] = [
      [
        bikeThefts.features[0].geometry.coordinates[1],
        bikeThefts.features[0].geometry.coordinates[0],
        2
      ]
    ];
    console.log(values);
    if (map) drawHeatmap(values);
  }, []);

  return null;
}
