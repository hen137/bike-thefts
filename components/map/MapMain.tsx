"use client";

import { useState, useCallback, useMemo, useContext } from "react";
import { useMapContextMenu } from "@/hooks";
import { TileContext, HeatProvider } from "@/contexts";
import {
  LeafletHeatLayer,
  LeafletMap,
  LeafletTileLayer,
  MapContextMenu,
  MapMeasurementPanel
} from "@/components/map";
import { MapDashboard } from "./MapDashboard";

/**
 * MapMain - Main map component with theme-aware tile provider
 *
 * Optimizations:
 * - Memoized callbacks to prevent unnecessary re-renders
 * - Static style object for GeoJSON
 * - Stable function references
 */
export function MapMain() {
  const [isMeasurementOpen, setIsMeasurementOpen] = useState(false);
  const [byHood, setByHood] = useState(true);
  const [timeWeighting, setTimeWeighting] = useState("None");
  const [weightKInv, setWeightKInv] = useState(0.5);
  const [weightKInvQuad, setWeightKInvQuad] = useState(0.25);
  const [weightFlipped, setWeightFlipped] = useState(false);
  const [poissonIndex, setPoissonIndex] = useState(0);

  const tileContext = useContext(TileContext);

  if (tileContext === undefined) {
    throw new Error("MapMain must be used within a TileProvider");
  }

  const { tileProvider } = tileContext;

  // Context menu hook
  const {
    isOpen: isContextMenuOpen,
    position: contextMenuPosition,
    close: closeContextMenu
  } = useMapContextMenu();

  // Memoized callbacks to prevent unnecessary re-renders
  const handleMeasurementClose = useCallback(() => {
    setIsMeasurementOpen(false);
  }, []);

  const handleContextMenuMeasurement = useCallback(() => {
    setIsMeasurementOpen(true);
  }, []);

  // Handle map click
  // const handleMapClick = useCallback((lat: number, lng: number) => {
  // do something
  // }, []);

  // Handle map mouse move for cursor tracking
  // const handleMapMouseMove = useCallback((lat: number, lng: number) => {
  // do something
  // }, []);

  // Memoize tile layer props to prevent unnecessary updates
  const tileLayerProps = useMemo(
    () => ({
      url: tileProvider.url,
      attribution: tileProvider.attribution,
      maxZoom: tileProvider.maxZoom
    }),
    [tileProvider.url, tileProvider.attribution, tileProvider.maxZoom]
  );

  return (
    <div className="relative sm:rounded-md h-full w-full overflow-hidden">
      <HeatProvider>
        {/* Map */}
        <LeafletMap
          className="w-full h-full"
          // onClick={handleMapClick}
          // onMouseMove={handleMapMouseMove}
          // cursorStyle={isSelectingPOILocation ? "crosshair" : "grab"}
        >
          <LeafletTileLayer
            url={tileLayerProps.url}
            attribution={tileLayerProps.attribution}
            maxZoom={tileLayerProps.maxZoom}
          />
          <LeafletHeatLayer />
          {/* <LeafletGeoJSON data={selectedCountry} style={GEOJSON_STYLE} /> */}
        </LeafletMap>

        {/* Map Controls */}
        <MapDashboard
          byHood={byHood}
          setByHood={setByHood}
          timeWeighting={timeWeighting}
          setTimeWeighting={setTimeWeighting}
          weightKInv={weightKInv}
          setWeightKInv={setWeightKInv}
          weightKInvQuad={weightKInvQuad}
          setWeightKInvQuad={setWeightKInvQuad}
          weightFlipped={weightFlipped}
          onWeightFlipToggle={() => setWeightFlipped((prev) => !prev)}
          poissonIndex={poissonIndex}
          setPoissonIndex={setPoissonIndex}
        />
      </HeatProvider>

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
    </div>
  );
}
