"use client";

import { useContext, useEffect, useRef } from "react";
import { HeatLayer } from "leaflet";
import { HeatContext } from "@/contexts";
import { useLeafletMap } from "@/hooks";
import { ZOOM_MAPPING } from "@/constants/map-config";

export function LeafletHeatLayer() {
  const map = useLeafletMap();
  const heatLayerRef = useRef<HeatLayer | null>(null);

  const heatContext = useContext(HeatContext);

  if (heatContext === undefined)
    throw new Error("LeafletHeatLayer must be used within a HeatProvider");

  const { setHeatLayer, setZoomRadius, setZoomBlur } = heatContext;

  useEffect(() => {
    // Wait for map to be ready
    if (!map) return;

    let isMounted = true;

    const handleZoom = () => {
      const { radius, blur } = ZOOM_MAPPING[map.getZoom()];
      if (heatLayerRef.current) {
        heatLayerRef.current.setOptions({ radius, blur });
      }
      setZoomRadius(radius);
      setZoomBlur(blur);
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

  return null;
}
