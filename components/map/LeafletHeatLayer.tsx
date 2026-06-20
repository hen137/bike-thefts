"use client";

import { useEffect, useRef, useState } from "react";
import { HeatLayer } from "leaflet";
import { useLeafletHeatLayer, useLeafletMap } from "@/hooks";
import { DEFAULT_HEATMAP_CONFIG, ZOOM_MAPPING } from "@/constants/map-config";
import { useDataSettings } from "@/hooks/useDataSettings";
import { buildHeatDataFromRows } from "@/lib/utils/heatmap";

export function LeafletHeatLayer() {
  const map = useLeafletMap();
  const heatLayerRef = useRef<HeatLayer | null>(null);
  const [blur, setBlur] = useState<number>(DEFAULT_HEATMAP_CONFIG.blur!);
  const [radius, setRadius] = useState<number>(DEFAULT_HEATMAP_CONFIG.radius!);
  const [maxZoom, setMaxZoom] = useState<number>(
    DEFAULT_HEATMAP_CONFIG.maxZoom!
  );
  // const [gradient] = useState(DEFAULT_HEATMAP_CONFIG.gradient);

  const {
    heatLayer,
    setHeatLayer,
    setZoomRadius,
    setZoomBlur,
    setZoomMaxZoom,
    registerZoomRadiusHandler,
    registerZoomBlurHandler,
    registerZoomMaxZoomHandler,
    setHeatOptions,
    setHeatValues
  } = useLeafletHeatLayer();

  const {
    byHood,
    queryRange,
    rows,
    weightFlipped,
    timeWeighting,
    weightKInv,
    weightKInvQuad
  } = useDataSettings();

  useEffect(() => {
    // Wait for map to be ready
    if (!map) return;

    let isMounted = true;

    const handleZoom = () => {
      const { radius, blur, maxZoom } = ZOOM_MAPPING[map.getZoom()];
      if (heatLayerRef.current) {
        heatLayerRef.current.setOptions({ radius, blur, maxZoom });
      }
      setZoomRadius(radius);
      setZoomBlur(blur);
      setZoomMaxZoom(maxZoom);
    };

    const setupHeatLayer = async () => {
      try {
        // Dynamically import Leaflet & Leaflet.heat
        const leaflet = await import("leaflet");
        const L = leaflet.default ?? leaflet;
        (window as Window & { L?: typeof L }).L = L;
        await import("leaflet.heat");

        if (!isMounted || !map) return;

        // Remove existing heat layer if it exists
        if (heatLayerRef.current) {
          try {
            heatLayerRef.current.remove();
          } catch {
            // Ignore removal errors
          }
          heatLayerRef.current = null;
        }

        // Create and add new heat layer
        const heatLayer = L.heatLayer([], {});

        // erroError handling for heat loading
        heatLayer.on("error", (error) => {
          console.error("Heat loading error:", error);
        });

        map.on("zoom", handleZoom);

        heatLayer.addTo(map);
        heatLayerRef.current = heatLayer;
        handleZoom();

        setHeatLayer(heatLayer);
      } catch (error) {
        if (isMounted) {
          console.error("Failed to add heat layer:", error);
        }
      }
    };

    setupHeatLayer();

    // Cleanup function
    return () => {
      isMounted = false;

      if (heatLayerRef.current) {
        try {
          map.off("zoom", handleZoom);
          heatLayerRef.current.remove();
          heatLayerRef.current = null;
        } catch (error) {
          console.error("Error removing heat layer:", error);
        }
      }
    };
  }, [map]);

  useEffect(() => {
    registerZoomRadiusHandler(setRadius);
  }, [registerZoomRadiusHandler]);

  useEffect(() => {
    registerZoomBlurHandler(setBlur);
  }, [registerZoomBlurHandler]);

  useEffect(() => {
    registerZoomMaxZoomHandler(setMaxZoom);
  }, [registerZoomMaxZoomHandler]);

  useEffect(() => {
    setHeatOptions({ blur, radius, maxZoom });
  }, [heatLayer, blur, radius, maxZoom, setHeatOptions]);

  useEffect(() => {
    if (!queryRange) return;

    const activeK = timeWeighting === "InvQuad" ? weightKInvQuad : weightKInv;
    const refDate = weightFlipped ? queryRange.startDate : queryRange.endDate;
    const { values } = buildHeatDataFromRows(
      rows,
      byHood,
      timeWeighting.toLocaleLowerCase() as "none" | "lin" | "inv" | "invquad",
      refDate,
      activeK
    );
    setHeatValues(values);
  }, [
    rows,
    queryRange,
    byHood,
    timeWeighting,
    weightKInv,
    weightKInvQuad,
    weightFlipped,
    setHeatValues
  ]);

  return null;
}
