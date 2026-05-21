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
 *
 */
export const MapTopBar = memo(function MapTopBar() {
  return (
    <div className="absolute left-4 right-4 top-4 flex items-center gap-2 z-[1000]">
      {/* Spacer for search bar */}
      <div className="w-[360px]" />

      {/* Category Pills */}
      <div className="hidden lg:flex items-center gap-2 overflow-x-auto pointer-events-auto">
        {/* Theme Switcher */}
        <MapThemeSwitcher />

        {/* Tile Switcher */}
        <MapTileSwitcher />
      </div>
    </div>
  );
});

MapTopBar.displayName = "MapTopBar";
