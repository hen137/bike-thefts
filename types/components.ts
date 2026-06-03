import type { ReactNode } from "react";
import type {
  ColorGradientConfig,
  HeatLatLngTuple,
  LatLng,
  Icon as LeafletIcon,
  Map as LeafletMap
} from "leaflet";
import { MonthYear, StartEndDates, GeoJSONStyle } from "@/types/map";
import { ContextMenuPosition } from "@/types/hooks";

/**
 * DebugHUD component props
 */
export interface DebugHUDProps {
  className?: string;
  sliderValues: number[];
  startDate: MonthYear | null;
  endDate: MonthYear | null;
  avgIntensity: number | null;
  blur: number;
  setBlur: (value: number) => void;
  radius: number;
  setRadius: (value: number) => void;
  maxZoom: number;
  setMaxZoom: (value: number) => void;
  gradient: ColorGradientConfig | undefined;
  totalRecords: number | null;
  currentQueryCount: number | null;
  dbMinDate: string | null;
  dbMaxDate: string | null;
  onRefreshDb: () => void;
}

/**
 * DebugSlider component props
 */
export interface DebugSliderProps {
  updateValue: (value: number) => void;
  defaultVal: number;
  max?: number;
  increment?: number;
}

/**
 * MapErrorBoundry component props
 */
export interface MapErrorBoundaryProps {
  children: ReactNode;
}

/**
 * LeafletMap component props
 */
export interface LeafletMapProps {
  center?: [number, number];
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  className?: string;
  children?: ReactNode;
  onClick?: (lat: number, lng: number) => void;
  onMouseMove?: (lat: number, lng: number) => void;
  cursorStyle?: string;
}

/**
 * LeafletTileLayer component props
 */
export interface LeafletTileLayerProps {
  url: string;
  attribution?: string;
  maxZoom?: number;
  subdomains?: string[];
}

/**
 * LeafletMarker component props
 */
export interface LeafletMarkerProps {
  position: [number, number];
  icon?: LeafletIcon;
  popup?: string | ReactNode;
  draggable?: boolean;
  onDragEnd?: (position: [number, number]) => void;
}

/**
 * LeafletGeoJSON component props
 */
export interface LeafletGeoJSONProps {
  data: GeoJSON.Feature | null;
  style?: GeoJSONStyle;
}

/**
 * MapControls component props
 */
export interface MapControlsProps {
  onSliderChange: (
    map: LeafletMap,
    values: (LatLng | HeatLatLngTuple)[]
  ) => Promise<void>;
}

/**
 * MapContextMenu component props
 */
export interface MapContextMenuProps {
  isOpen: boolean;
  position: ContextMenuPosition | null;
  onClose: () => void;
  onStartMeasurement: () => void;
}

/**
 * MapMeasurementPanel component props
 */
export interface MapMeasurementPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * MenuItem component props
 */
export interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  onClick: () => void;
  showCopied?: boolean;
}

/**
 * HeatmapSlider component props
 */
export interface HeatmapSliderProps {
  initialValues: number[];
  updateValues: (values: number[]) => void;
  commitValues: (values: number[]) => void;
  sliderDates: StartEndDates;
}
