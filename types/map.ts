import type {
  HeatLatLngTuple,
  HeatLayer,
  HeatMapOptions,
  LatLng,
  Map as LeafletMap
} from "leaflet";

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
  heatOptions: HeatMapOptions | null;
  heatValues: (LatLng | HeatLatLngTuple)[] | null;
  setHeatLayer: (newHeatLayer: HeatLayer | null) => void;
  setHeatOptions(options: HeatMapOptions): void;
  setHeatValues: (data: (LatLng | HeatLatLngTuple)[]) => void;
  setZoomRadius: (radius: number) => void;
  setZoomBlur: (blur: number) => void;
  setZoomMaxZoom: (maxZoom: number) => void;
  registerZoomRadiusHandler: (handler: (radius: number) => void) => void;
  registerZoomBlurHandler: (handler: (blur: number) => void) => void;
  registerZoomMaxZoomHandler: (handler: (maxZoom: number) => void) => void;
  registerGradientHandler: (
    handler: (gradient: { [key: number]: string }) => void
  ) => void;
  setGradient: (gradient: { [key: number]: string }) => void;
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

export interface MonthYear {
  month: number;
  year: number;
}

export interface StartEndDates {
  startDate: MonthYear | null;
  endDate: MonthYear | null;
}
