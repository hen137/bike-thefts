"use client";

import { memo } from "react";
import {
  MapSearchBar,
  MapThemeSwitcher,
  MapTileSwitcher
} from "@/components/map";

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
      {/* <MapSearchBar /> */}

      {/* <div className="hidden lg:flex items-center gap-2  pointer-events-auto"> */}
      {/* Theme Switcher */}
      {/* <MapThemeSwitcher /> */}

      {/* Tile Switcher */}
      {/* <MapTileSwitcher /> */}
      {/* </div> */}
      <MapThemeSwitcher />
      <MapSearchBar />
      <MapTileSwitcher />
    </div>
  );
});

MapTopBar.displayName = "MapTopBar";
