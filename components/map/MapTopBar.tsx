"use client";

import { memo } from "react";
import { MapSearchBar } from "@/components/map";

/**
 * MapTopBar - Top navigation bar with category pills and user menu
 * Memoized to prevent unnecessary re-renders
 */
export const MapTopBar = memo(function MapTopBar() {
  return (
    <div
      id="map-top-bar"
      className="w-screen flex justify-center absolute top-3 z-1000 px-4 sm:px-0 gap-2"
    >
      {/* Search Bar */}
      <MapSearchBar />
    </div>
  );
});

MapTopBar.displayName = "MapTopBar";
