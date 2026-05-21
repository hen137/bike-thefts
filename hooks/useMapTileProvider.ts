import { useState, useMemo } from "react";
import type { TileProvider } from "@/types/map";
import { useTheme } from "@/hooks";
import {
  getTileProviderById,
  getDefaultTileProvider,
} from "@/constants/tile-providers";
import type { TileProvider } from "@/types/map";

/**
 * Custom hook to manage map tile provider with theme-aware auto-switching
 *
 * Logic:
 * - When theme changes, automatically switch to matching basemap (dark theme → dark basemap)
 * - User can manually override by selecting a different basemap
 * - Manual selection persists until theme changes again
 *
 * @returns Object with current tile provider and setter function
 */
export function useMapTileProvider() {
  const { theme } = useTheme();
  const [manualProviderId, setManualProviderId] = useState<string | null>(null);

  // Determine which tile provider to use
  const tileProvider = useMemo<TileProvider>(() => {
    // If user manually selected a provider, use that
    if (manualProviderId) {
      return getTileProviderById(manualProviderId) || getDefaultTileProvider();
    }

    // Otherwise, auto-switch based on theme
    return (
      getTileProviderById(theme === "light" ? "osm" : "dark") ||
      getDefaultTileProvider()
    );
  }, [manualProviderId, theme]);

  // Get the current provider ID for UI state
  const currentProviderId =
    manualProviderId || (theme === "dark" ? "dark" : "osm");

  // Handler that resets manual selection when theme changes
  const setProviderId = (id: string | null) => {
    setManualProviderId(id);
  };

  return {
    tileProvider,
    currentProviderId,
    setProviderId,
  };
}
