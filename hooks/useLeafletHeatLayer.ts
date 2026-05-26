"use client";

import { useContext } from "react";
import { HeatContext } from "@/contexts";
import { HeatContextValue } from "@/types/map";

/**
 * Hook to access Leaflet heat layer from HeatContext
 */
export function useLeafletHeatLayer(): HeatContextValue {
  const context = useContext(HeatContext);

  if (context === undefined) {
    throw new Error("useLeafletHeatLayer must be used within a HeatProvider");
  }

  return context;
}
