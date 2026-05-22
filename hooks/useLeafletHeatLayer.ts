"use client";

import { useContext } from "react";
import { HeatLayer } from "leaflet";
import { HeatContext } from "@/contexts";

/**
 * Hook to access Leaflet heat layer from HeatContext
 */
export function useLeafletHeatLayer(): HeatLayer | null {
  const context = useContext(HeatContext);

  if (context === undefined) {
    throw new Error("useLeafletHeatLayer must be used within a HeatProvider");
  }

  return context.heatLayer;
}
