"use client";

import { memo, useState, useEffect } from "react";
import { Plus, Minus, Maximize2, Minimize2 } from "lucide-react";
import {
  useMapControls,
  useGeolocation,
  useDbContext,
  useLeafletHeatLayer
} from "@/hooks";
import { DEFAULT_HEATMAP_CONFIG } from "@/constants/map-config";
import { calcRawSliderToDates } from "@/lib/utils";
import { buildHeatDataFromRows } from "@/lib/utils/heatmap";
import { MonthYear } from "@/types";
import { DebugHUD } from "@/components/debug";
import { HeatmapSlider } from "./HeatmapSlider";
import { HeatLegend } from "./HeatLegend";

const MAX_SLIDER_RANGE = 1000;
const endThumb = 1000;
const startThumb = 750;

/**
 * MapControls - Map control buttons at bottom right
 * Includes: Location, Zoom In/Out, Reset View, Fullscreen
 *
 * Uses project's useMapControls hook for map interactions
 * Memoized to prevent unnecessary re-renders
 */
export const MapControls = memo(function MapControls() {
  const { map, zoomIn, zoomOut, toggleFullscreen, resetView } =
    useMapControls();
  const { locateUser, isLocating, isAvailable } = useGeolocation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const {
    registerZoomRadiusHandler,
    registerZoomBlurHandler,
    setHeatValues,
    heatLayer,
    setHeatOptions
  } = useLeafletHeatLayer();
  const { isReady, worker, initResult } = useDbContext();

  const [sliderValues, setSliderValue] = useState<number[]>([
    startThumb,
    endThumb
  ]);
  const [commitedSliderValues, commitSliderValues] = useState(sliderValues);

  const [startDate, setStartDate] = useState<MonthYear | null>(null);
  const [endDate, setEndDate] = useState<MonthYear | null>(null);

  const [blur, setBlur] = useState<number>(DEFAULT_HEATMAP_CONFIG.blur!);
  const [radius, setRadius] = useState<number>(DEFAULT_HEATMAP_CONFIG.radius!);
  const [maxZoom, setMaxZoom] = useState<number>(
    DEFAULT_HEATMAP_CONFIG.maxZoom!
  );
  const [gradient] = useState(DEFAULT_HEATMAP_CONFIG.gradient);

  const [currentQueryCount, setCurrentQueryCount] = useState<number | null>(
    null
  );

  // debug
  const [avgIntensity, setAvgIntensity] = useState<number | null>(null);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    registerZoomRadiusHandler(setRadius);
  }, [registerZoomRadiusHandler]);

  useEffect(() => {
    registerZoomBlurHandler(setBlur);
  }, [registerZoomBlurHandler]);

  useEffect(() => {
    setHeatOptions({ blur, radius, maxZoom });
  }, [heatLayer, blur, radius, maxZoom, setHeatOptions]);

  // responsive slider tooltip re-renders
  useEffect(() => {
    if (isReady) {
      const { startDate, endDate } = calcRawSliderToDates(
        sliderValues,
        MAX_SLIDER_RANGE,
        {
          lowerBound: initResult?.minDate
            ? new Date(initResult.minDate)
            : new Date(2010, 0),
          upperBound: initResult?.maxDate
            ? new Date(initResult.maxDate)
            : new Date()
        }
      );
      setStartDate(startDate);
      setEndDate(endDate);
    }
  }, [sliderValues, isReady, initResult]);

  useEffect(() => {
    if (isReady && worker) {
      const { startDate, endDate } = calcRawSliderToDates(
        commitedSliderValues,
        MAX_SLIDER_RANGE,
        {
          lowerBound: initResult?.minDate
            ? new Date(initResult.minDate)
            : new Date(2010, 0),
          upperBound: initResult?.maxDate
            ? new Date(initResult.maxDate)
            : new Date()
        }
      );

      setStartDate(startDate);
      setEndDate(endDate);

      const startISO = `${startDate.year}-${String(startDate.month + 1).padStart(2, "0")}-01`;
      const endISO = new Date(endDate.year, endDate.month + 1, 0)
        .toISOString()
        .split("T")[0];

      worker.queryHeatmap(startISO, endISO).then((rows) => {
        const { values, avgIntensity } = buildHeatDataFromRows(rows, true);
        setHeatValues(values);
        setAvgIntensity(avgIntensity);
        setCurrentQueryCount(rows.reduce((acc, r) => acc + r.count, 0));
      });
    }
  }, [commitedSliderValues, isReady, worker, initResult, setHeatValues]);

  return (
    <div>
      <div className="absolute left-150 bottom-3 z-1000">
        <HeatLegend />
      </div>
      <div className="absolute bottom-24 sm:bottom-8 right-4 flex flex-col items-center gap-2 z-1000">
        {/* Time Range Slider */}
        <div className=" flex flex-col justify-center h-150 rounded-lg bg-white dark:bg-slate-700 shadow-lg">
          <HeatmapSlider
            initialValues={sliderValues}
            updateValues={setSliderValue}
            commitValues={commitSliderValues}
            sliderDates={{ endDate, startDate }}
          />
        </div>

        {/* Location Button */}
        <button
          onClick={locateUser}
          disabled={!isAvailable || isLocating}
          className={`flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-slate-700 shadow-lg hover:bg-gray-50 dark:hover:bg-slate-600 ${
            isLocating ? "animate-pulse" : ""
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title="Find my location"
          aria-label="Find my location"
        >
          <svg
            className={`h-5 w-5 ${
              isLocating
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-100"
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4m0 12v4m10-10h-4M6 12H2" />
          </svg>
        </button>

        {/* Zoom Controls */}
        <div className="flex flex-col overflow-hidden rounded-lg bg-white dark:bg-slate-700 shadow-lg">
          <button
            onClick={zoomIn}
            disabled={!map}
            className="flex h-9 w-9 items-center justify-center border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom in"
            aria-label="Zoom in"
          >
            <Plus className="h-5 w-5 text-gray-600 dark:text-gray-100" />
          </button>
          <button
            onClick={zoomOut}
            disabled={!map}
            className="flex h-9 w-9 items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom out"
            aria-label="Zoom out"
          >
            <Minus className="h-5 w-5 text-gray-600 dark:text-gray-100" />
          </button>
        </div>

        {/* Reset View Button */}
        <button
          onClick={resetView}
          disabled={!map}
          className="flex h-9 w-9 items-center justify-center rounded bg-white dark:bg-slate-700 shadow-lg hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Reset view"
          aria-label="Reset view to default"
        >
          <svg
            className="h-5 w-5 text-gray-600 dark:text-gray-100"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
          </svg>
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="flex h-9 w-9 items-center justify-center rounded bg-white dark:bg-slate-700 shadow-lg hover:bg-gray-50 dark:hover:bg-slate-600"
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? (
            <Minimize2 className="h-5 w-5 text-gray-600 dark:text-gray-100" />
          ) : (
            <Maximize2 className="h-5 w-5 text-gray-600 dark:text-gray-100" />
          )}
        </button>
      </div>

      <DebugHUD
        sliderValues={sliderValues}
        startDate={startDate}
        endDate={endDate}
        avgIntensity={avgIntensity}
        blur={blur}
        setBlur={setBlur}
        radius={radius}
        setRadius={setRadius}
        maxZoom={maxZoom}
        setMaxZoom={setMaxZoom}
        gradient={gradient}
        totalRecords={initResult?.recordCount ?? null}
        currentQueryCount={currentQueryCount}
        dbMinDate={initResult?.minDate ?? null}
        dbMaxDate={initResult?.maxDate ?? null}
      />
    </div>
  );
});

MapControls.displayName = "MapControls";
