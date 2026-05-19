/**
 * Map-related TypeScript type definitions
 */

import type { Map as LeafletMap } from 'leaflet';

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
 * Tile provider configuration
 */
export interface TileProvider {
  id: string;
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
  category: 'default' | 'satellite' | 'dark:default' | 'fun';
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
  selectedProviderId: string;
  onProviderChange: (id: string | null) => void;
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
