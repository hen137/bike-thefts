"use client";

import { useState, useCallback, useMemo } from "react";
import { LeafletMap } from "./LeafletMap";
import { LeafletTileLayer } from "./LeafletTileLayer";
import { LeafletGeoJSON } from "./LeafletGeoJSON";
import { MapSearchBar } from "./MapSearchBar";
import { MapTopBar } from "./MapTopBar";
import { MapControls } from "./MapControls";
import { MapDetailsPanel } from "./MapDetailsPanel";
import { MapMeasurementPanel } from "./MapMeasurementPanel";
import { MapContextMenu } from "./MapContextMenu";
import { useMapTileProvider } from "@/hooks/useMapTileProvider";
import { useMapContextMenu } from "@/hooks/useMapContextMenu";
import { TileProvider } from "@/contexts/TileContext";
import { MapInfo } from "./MapInfo";
import { HeatLatLngTuple, LatLng, Map } from "leaflet";
import { DEFAULT_MAP_CONFIG } from "@/constants/map-config";

// Memoized style object to prevent unnecessary re-renders
const GEOJSON_STYLE = {
  fillColor: "#3b82f6",
  fillOpacity: 0.2,
  color: "#2563eb",
  weight: 2,
} as const;

/**
 * MapMain - Main map component with theme-aware tile provider
 *
 * Optimizations:
 * - Memoized callbacks to prevent unnecessary re-renders
 * - Static style object for GeoJSON
 * - Stable function references
 */
export function MapMain() {
  const [selectedCountry, setSelectedCountry] =
    useState<GeoJSON.Feature | null>(null);
  const [isMeasurementOpen, setIsMeasurementOpen] = useState(false);

  // Use custom hook for theme-aware tile provider management
  const { tileProvider, currentProviderId, setProviderId } =
    useMapTileProvider();

  // Context menu hook
  const {
    isOpen: isContextMenuOpen,
    position: contextMenuPosition,
    close: closeContextMenu,
  } = useMapContextMenu();

  // Memoized callbacks to prevent unnecessary re-renders
  const handleCountrySelect = useCallback(async (countryId: string) => {
    try {
      const response = await fetch(
        `/api/countries/${encodeURIComponent(countryId)}`,
      );
      const feature = await response.json();
      setSelectedCountry(feature);
    } catch (error) {
      console.error("Error loading country GeoJSON:", error);
    }
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedCountry(null);
  }, []);

  const handleMeasurementOpen = useCallback(() => {
    setIsMeasurementOpen(true);
  }, []);

  const handleMeasurementClose = useCallback(() => {
    setIsMeasurementOpen(false);
  }, []);

  const handleContextMenuMeasurement = useCallback(() => {
    setIsMeasurementOpen(true);
  }, []);

  // Handle map click
  const handleMapClick = useCallback((lat: number, lng: number) => {
    // do something
  }, []);

  // Handle map mouse move for cursor tracking
  const handleMapMouseMove = useCallback((lat: number, lng: number) => {
    // do something
  }, []);

  const handleDrawHeatmap = useCallback(
    async (map: Map, values: (LatLng | HeatLatLngTuple)[]) => {
      const leaflet = await import("leaflet");
      const L = leaflet.default ?? leaflet;
      (window as Window & { L?: typeof L }).L = L;
      await import("leaflet.heat");

      const heatmap = L.heatLayer(values, { radius: 25 }).addTo(map);
    },
    [],
  );

  // Memoize tile layer props to prevent unnecessary updates
  const tileLayerProps = useMemo(
    () => ({
      url: tileProvider.url,
      attribution: tileProvider.attribution,
      maxZoom: tileProvider.maxZoom,
    }),
    [tileProvider.url, tileProvider.attribution, tileProvider.maxZoom],
  );

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Map */}
      <LeafletMap
        className="w-full h-full"
        onClick={handleMapClick}
        onMouseMove={handleMapMouseMove}
        // cursorStyle={isSelectingPOILocation ? "crosshair" : "grab"}
      >
        <LeafletTileLayer
          url={tileLayerProps.url}
          attribution={tileLayerProps.attribution}
          maxZoom={tileLayerProps.maxZoom}
        />
        <LeafletGeoJSON data={selectedCountry} style={GEOJSON_STYLE} />
      </LeafletMap>

      {/* Search Bar */}
      <MapSearchBar
        onCountrySelect={handleCountrySelect}
        selectedCountry={selectedCountry}
        onClearSelection={handleClearSelection}
        onMeasurementClick={handleMeasurementOpen}
      />

      {/* Top Bar */}
      <TileProvider
        selectedProviderId={currentProviderId}
        onProviderChange={setProviderId}
      >
        {/* <MapTopBar onCategoryClick={handleCategoryClick} /> */}
        <MapTopBar />
      </TileProvider>

      {/* Map Controls */}
      <MapControls onSliderChange={handleDrawHeatmap} />

      {/* Country Details Panel */}
      <MapDetailsPanel
        country={selectedCountry}
        onClose={handleClearSelection}
      />

      {/* Measurement Panel */}
      <MapMeasurementPanel
        isOpen={isMeasurementOpen}
        onClose={handleMeasurementClose}
      />

      {/* Context Menu */}
      <MapContextMenu
        isOpen={isContextMenuOpen}
        position={contextMenuPosition}
        onClose={closeContextMenu}
        onStartMeasurement={handleContextMenuMeasurement}
      />

      {/* Info Menu */}
      <MapInfo />
    </div>
  );
}
