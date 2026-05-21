import { LatLng } from "leaflet";

export interface ContextMenuPosition {
  x: number;
  y: number;
  latlng: {
    lat: number;
    lng: number;
  };
}

export interface UseMapContextMenuReturn {
  isOpen: boolean;
  position: ContextMenuPosition | null;
  close: () => void;
}

export type MeasurementMode = "distance" | "area" | null;

export interface MeasurementPoint {
  latlng: LatLng;
  marker?: L.CircleMarker;
}

export type L = typeof import("leaflet");