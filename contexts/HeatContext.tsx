"use client";

import { createContext, useState, useCallback, useMemo } from "react";
import type { HeatLayer } from "leaflet";
import { HeatProviderProps } from "@/types/contexts";
import { HeatContextValue } from "@/types/map";

/**
 * Heat context for managing Leaflet heat layer instance
 */
export const HeatContext = createContext<HeatContextValue | undefined>(
  undefined
);

/**
 * HeatProvider component that manages heat layer instance state
 *
 * @example
 * ```tsx
 * <HeatProvider>
 *   <LeafletHeatLayer />
 *   <Heatmap />
 * </HeatProvider>
 * ```
 */
export function HeatProvider({ children }: HeatProviderProps) {
  const [heatLayer, setHeatLayerState] = useState<HeatLayer | null>(null);

  // Memoized setHeat to prevent unnecessary re-renders
  const setHeatLayer = useCallback((newHeatLayer: HeatLayer | null) => {
    setHeatLayerState(newHeatLayer);
  }, []);

  // Memoize context value to prevent unnecessary re-renders of consumers
  const value: HeatContextValue = useMemo(
    () => ({
      heatLayer,
      setHeatLayer
    }),
    [heatLayer, setHeatLayer]
  );

  return <HeatContext.Provider value={value}>{children}</HeatContext.Provider>;
}
