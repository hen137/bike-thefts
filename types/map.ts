/**
 * Map-related TypeScript type definitions
 */

import type { HeatLayer, Map as LeafletMap } from "leaflet";

/**
 * Map configuration options
 */
export interface MapConfig {
  defaultCenter: [number, number];
  defaultZoom: number;
  minZoom: number;
  maxZoom: number;
  zoomControl: boolean;
  attributionControl: boolean;
}

/**
 * MapErrorBoundryState
 */
export interface MapErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Tile provider configuration
 */
export interface TileProvider {
  id: string;
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
  category: "default" | "satellite" | "dark:default" | "fun";
}

/**
 * GeoJSON styles
 */
export interface GeoJSONStyle {
  fillColor?: string;
  fillOpacity?: number;
  color?: string;
  weight?: number;
}

/**
 * Map context value type
 */
export interface MapContextValue {
  map: LeafletMap | null;
  setMap: (map: LeafletMap | null) => void;
  isReady: boolean;
  error: Error | null;
  isInitializing: boolean;
  setMapError: (error: Error | null) => void;
  startInitializing: () => void;
}

export interface TileContextValue {
  tileProvider: TileProvider;
  currentProviderId: string;
  setProviderId: (id: string | null) => void;
}

export interface HeatContextValue {
  heatLayer: HeatLayer | null;
  setHeatLayer: (newHeatLayer: HeatLayer | null) => void;
}

/**
 * Coordinate tuple type
 */
export type Coordinate = [number, number];

/**
 * Bounds type
 */
export interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}
