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
  minZoom: 6,
  maxZoom: 18,
  zoomControl: false, // Using custom controls in dock
  attributionControl: true
};

/**
 * Default heatmap configuration
 */
export const DEFAULT_HEATMAP_CONFIG: HeatMapOptions = {
  blur: 30,
  radius: 60,
  maxZoom: 13,
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
