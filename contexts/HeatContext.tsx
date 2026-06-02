"use client";

import { createContext, useRef, useState, useCallback, useMemo } from "react";
import type {
  HeatLatLngTuple,
  HeatLayer,
  HeatMapOptions,
  LatLng
} from "leaflet";
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
  const [heatOptions, setHeatOptionsState] = useState<HeatMapOptions | null>(
    null
  );
  const [heatValues, setHeatValuesState] = useState<
    (LatLng | HeatLatLngTuple)[] | null
  >(null);

  // Ref-based callback — avoids putting zoom radius in context state (prevents re-render loops)
  const zoomRadiusHandlerRef = useRef<((r: number) => void) | null>(null);
  const zoomBlurHandlerRef = useRef<((b: number) => void) | null>(null);

  const registerZoomRadiusHandler = useCallback(
    (handler: (radius: number) => void) => {
      zoomRadiusHandlerRef.current = handler;
    },
    []
  );

  const registerZoomBlurHandler = useCallback(
    (handler: (blur: number) => void) => {
      zoomBlurHandlerRef.current = handler;
    },
    []
  );

  const setZoomRadius = useCallback((radius: number) => {
    zoomRadiusHandlerRef.current?.(radius);
  }, []);

  const setZoomBlur = useCallback((blur: number) => {
    zoomBlurHandlerRef.current?.(blur);
  }, []);

  // Memoized setHeat to prevent unnecessary re-renders
  const setHeatLayer = useCallback((newHeatLayer: HeatLayer | null) => {
    setHeatLayerState(newHeatLayer);
  }, []);

  const setHeatOptions = useCallback(
    (options: HeatMapOptions) => {
      if (heatLayer) {
        setHeatOptionsState(options);
        heatLayer.setOptions(options);
      }
    },
    [heatLayer]
  );

  const setHeatValues = useCallback(
    (data: (LatLng | HeatLatLngTuple)[]) => {
      if (heatLayer) {
        setHeatValuesState(data);
        heatLayer.setLatLngs(data);
      }
    },
    [heatLayer]
  );

  // Memoize context value to prevent unnecessary re-renders of consumers
  const value: HeatContextValue = useMemo(
    () => ({
      heatLayer,
      heatOptions,
      heatValues,
      setHeatLayer,
      setHeatOptions,
      setHeatValues,
      setZoomRadius,
      setZoomBlur,
      registerZoomRadiusHandler,
      registerZoomBlurHandler
    }),
    [
      heatLayer,
      heatOptions,
      heatValues,
      setHeatLayer,
      setHeatOptions,
      setHeatValues,
      setZoomRadius,
      setZoomBlur,
      registerZoomRadiusHandler,
      registerZoomBlurHandler
    ]
  );

  return <HeatContext.Provider value={value}>{children}</HeatContext.Provider>;
}
