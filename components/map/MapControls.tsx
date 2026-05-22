"use client";

import { memo, useState, useEffect, Suspense, useCallback } from "react";
import { Plus, Minus, Maximize2, Minimize2 } from "lucide-react";
import { useMapControls, useGeolocation } from "@/hooks";
import { Heatmap, HeatmapSlider } from "@/components/map";
import { getBikeData } from "@/lib/bike-data";

const startThumb = 1000;
const endThumb = 500;

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
  const [sliderValues, setSliderValue] = useState([startThumb, endThumb]);

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

  // Oct, 2025 - Jan, 2014
  const min = new Date(2014, 0).getTime();
  const max = new Date(2025, 10).getTime();
  const calcDates = useCallback((values: number[]) => {
    const x = values[0] / startThumb;
    const y = values[1] / startThumb;

    const dateDelta = max - min;

    const alpha = dateDelta * x;
    const beta = dateDelta * y;

    const start = new Date(min + alpha);
    const end = new Date(min + beta);

    return {
      startDate: `${start.getMonth()}-${start.getFullYear()}`,
      endDate: `${end.getMonth()}-${end.getFullYear()}`
    };
  }, []);

  const bikeData = getBikeData();

  return (
    <div className="absolute bottom-24 sm:bottom-8 right-4 flex flex-col items-center gap-2 z-1000">
      {/* Heatmap */}
      <Suspense>
        <Heatmap bikeData={bikeData} />
      </Suspense>

      {/* Heatmap Slider */}
      <div className=" flex flex-col justify-center h-150 rounded-lg bg-white dark:bg-slate-700 shadow-lg">
        <HeatmapSlider
          updateValues={setSliderValue}
          sliderDates={calcDates(sliderValues)}
        />
      </div>
      <div id="debug" className="absolute -left-200 w-100">
        <p>Raw: {sliderValues.join(",")}</p>
        <p>
          Date: s:{calcDates(sliderValues).startDate}, e:
          {calcDates(sliderValues).endDate}
        </p>
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
  );
});

MapControls.displayName = "MapControls";
