/**
 * Default map configuration constants
 */

import type { MapConfig } from "@/types/map";
import { HeatMapOptions } from "leaflet";

/**
 * Default map configuration
 * Center: Toronto coordinates
 */
export const DEFAULT_MAP_CONFIG: MapConfig = {
  defaultCenter: [43.670177, -79.386741],
  defaultZoom: 12,
  minZoom: 9,
  maxZoom: 16,
  zoomControl: false, // Using custom controls in dock
  attributionControl: false
};

/**
 * Default heatmap configuration
 */
export const DEFAULT_HEATMAP_CONFIG: HeatMapOptions = {
  blur: 11,
  radius: 8,
  maxZoom: 10,
  gradient: { 0.4: "blue", 0.65: "lime", 1: "red" }
};

/**
 * Map animation duration in milliseconds
 */
export const MAP_ANIMATION_DURATION = 500;

/**
 * Default map container height
 */
export const DEFAULT_MAP_HEIGHT = "100vh";

/**
 * ArcGIS Sentinel coordinates used to identify records with no location data
 */
export const SENTINAL_COORDINATES = "5.08888749034163e-145.6843418860808e-14";

export const ZOOM_MAPPING: {
  [key: number]: { radius: number; blur: number; maxZoom: number };
} = {
  16: { radius: 65, blur: 80, maxZoom: 16 },
  15: { radius: 40, blur: 60, maxZoom: 15 },
  14: { radius: 25, blur: 39, maxZoom: 14 },
  13: { radius: 15, blur: 22, maxZoom: 13 },
  12: { radius: 8, blur: 11, maxZoom: 12 },
  11: { radius: 5, blur: 7, maxZoom: 11 },
  10: { radius: 3, blur: 3, maxZoom: 10 },
  9: { radius: 2, blur: 2, maxZoom: 9 }
};
