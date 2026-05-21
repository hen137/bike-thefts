"use client";

import { createContext, useMemo } from "react";
import { TileProviderProps } from "@/types/contexts";
import { TileContextValue } from "@/types/map";
import { useMapTileProvider } from "@/hooks";

/**
 * Map context for managing Leaflet map instance
 */
export const TileContext = createContext<TileContextValue | undefined>(
  undefined
);

/**
 * TileProvider component that manages tile provider instance state
 *
 * @example
 * ```tsx
 * <TileProvider>
 *   <MapTopBar />
 * < />
 * </TileProvider>
 * ```
 */
export function TileProvider({ children }: TileProviderProps) {
  // Use custom hook for theme-aware tile provider management
  const { tileProvider, currentProviderId, setProviderId } =
    useMapTileProvider();

  // Memoize context value to prevent unnecessary re-renders of consumers
  const value: TileContextValue = useMemo(
    () => ({
      tileProvider,
      currentProviderId,
      setProviderId
    }),
    [tileProvider, currentProviderId, setProviderId]
  );

  return <TileContext.Provider value={value}>{children}</TileContext.Provider>;
}
