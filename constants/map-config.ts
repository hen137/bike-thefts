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
  defaultCenter: [43.70643, -79.39864],
  defaultZoom: 12,
  minZoom: 9,
  maxZoom: 16,
  zoomControl: false, // Using custom controls in dock
  attributionControl: true
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

export const ZOOM_MAPPING: { [key: number]: { radius: number; blur: number } } =
  {
    16: { radius: 65, blur: 80 },
    15: { radius: 40, blur: 60 },
    14: { radius: 25, blur: 39 },
    13: { radius: 15, blur: 22 },
    12: { radius: 8, blur: 11 },
    11: { radius: 5, blur: 7 },
    10: { radius: 3, blur: 3 },
    9: { radius: 2, blur: 2 }
  };
