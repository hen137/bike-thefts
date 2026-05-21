"use client";

import { createContext, useMemo } from "react";
import { TileProviderProps } from "@/types/contexts";
import { TileContextValue } from "@/types/map";
import { useMapTileProvider } from "@/hooks";

/**
 * Map context for managing Leaflet map instance
 */
export const TileContext = createContext<TileContextValue | undefined>(
  undefined,
);

interface TileProviderProps {
  selectedProviderId: string;
  onProviderChange: (id: string | null) => void;
  children: ReactNode;
}

/**
 * TileProvider component that manages tile provider instance state
 *
 * @example
 * ```tsx
 * <TileProvider>
 *   <MapTopBar />
 * </TileProvider>
 * ```
 */
export function TileProvider({
  selectedProviderId,
  onProviderChange,
  children,
}: TileProviderProps) {
  // Memoize context value to prevent unnecessary re-renders of consumers
  const value: TileContextValue = useMemo(
    () => ({
      selectedProviderId,
      onProviderChange,
    }),
    [selectedProviderId, onProviderChange],
  );

  return <TileContext.Provider value={value}>{children}</TileContext.Provider>;
}
