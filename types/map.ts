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

export interface HeatmapConfig {
  blur: number;
  radius: number;
  maxZoom: number;
  gradient: { [index: number]: string };
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

export interface MonthYear {
  month: number;
  year: number;
}

export interface RefDate {
  month: string;
  year: string;
}

export interface StartEndDates {
  startDate: MonthYear | null;
  endDate: MonthYear | null;
}

export interface BikeDateExtremes {
  startDateExtreme: MonthYear | null;
  endDateExtreme: MonthYear | null;
}

export type BikeData = {
  features: {
    geometry: {
      coordinates: number[];
    };
    properties: {
      OBJECTID: number;
      EVENT_UNIQUE_ID: string;
      PRIMARY_OFFENCE: string;
      OCC_DATE: number;
      OCC_YEAR: string;
      OCC_MONTH: string;
      OCC_DOW: string;
      OCC_DAY: string;
      OCC_DOY: string;
      OCC_HOUR: string;
      REPORT_DATE: number;
      REPORT_YEAR: string;
      REPORT_MONTH: string;
      REPORT_DOW: string;
      REPORT_DAY: string;
      REPORT_DOY: string;
      REPORT_HOUR: string;
      DIVISION: string;
      LOCATION_TYPE: string;
      PREMISES_TYPE: string;
      BIKE_MAKE: string;
      BIKE_MODEL: string;
      BIKE_TYPE: string;
      BIKE_SPEED: string;
      BIKE_COLOUR: string;
      BIKE_COST: null;
      STATUS: string;
      HOOD_158: string;
      NEIGHBOURHOOD_158: string;
      HOOD_140: string;
      NEIGHBOURHOOD_140: string;
      LONG_WGS84: number;
      LAT_WGS84: number;
    };
  }[];
}[];
