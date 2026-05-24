"use client";

import { memo, useState, useEffect } from "react";
import { Plus, Minus, Maximize2, Minimize2 } from "lucide-react";
import { useMapControls, useGeolocation } from "@/hooks";
import { DataBoundry } from "@/components/map";

// const MAX_SLIDER_RANGE = 1000;
// const endThumb = 1000;
// const startThumb = 750;

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
  // const [sliderValues, setSliderValue] = useState<number[]>([
  //   startThumb,
  //   endThumb
  // ]);
  // const [endDateExtreme, setEndDateExtreme] = useState<MonthYear | null>(null);
  // const [startDateExtreme, setStartDateExtreme] = useState<MonthYear | null>(
  //   null
  // );
  // const [endDate, setEndDate] = useState<MonthYear | null>(null);
  // const [startDate, setStartDate] = useState<MonthYear | null>(null);

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

  // useEffect(() => {
  //   console.log(use(getBikeDataDateExtremes()));
  //   // setStartDateExtreme({ month, year });
  //   // setEndDateExtreme({ month, year });
  // }, []);

  // // listen for changes in range
  // useEffect(() => {
  //   if (startDateExtreme && endDateExtreme) {
  //     const yearDelta = endDateExtreme.year - startDateExtreme.year;
  //     const monthDelta =
  //       endDateExtreme.month - startDateExtreme.month + 12 * yearDelta;

  //     const startMonths = Math.floor(
  //       (sliderValues[0] * monthDelta) / MAX_SLIDER_RANGE
  //     );
  //     const endMonths = Math.floor(
  //       (sliderValues[1] * monthDelta) / MAX_SLIDER_RANGE
  //     );

  //     const startMonth = startDateExtreme.month + (startMonths % 12);
  //     const startYear = startDateExtreme.year + Math.floor(startMonths / 12);

  //     const endMonth = startDateExtreme.month + (endMonths % 12);
  //     const endYear = startDateExtreme.year + Math.floor(endMonths / 12);

  //     setStartDate({ month: startMonth, year: startYear });
  //     setEndDate({ month: endMonth, year: endYear });
  //     console.log({ endDate, startDate });
  //   }
  // }, [sliderValues, startDateExtreme, endDateExtreme]);

  return (
    <div className="absolute bottom-24 sm:bottom-8 right-4 flex flex-col items-center gap-2 z-1000">
      {/* Heatmap */}
      <DataBoundry
      // startDate={startDate}
      // endDate={endDate}
      // sliderValues={sliderValues}
      // setSliderValue={setSliderValue}
      />
      {/* Heatmap */}
      {/* <Suspense>
          <Heatmap
            bikeDataPromise={bikeDataPromise}
            dateRanges={{ endDate, startDate }}
          />
        </Suspense> */}

      {/* Heatmap Slider */}
      {/* <div className=" flex flex-col justify-center h-150 rounded-lg bg-white dark:bg-slate-700 shadow-lg">
          <HeatmapSlider
            initialValues={sliderValues}
            updateValues={setSliderValue}
            // updateValues={handleSliderUpdate}
            sliderDates={{ endDate, startDate }}
          />
        </div>
        <div id="debug" className="absolute -left-200 w-100">
          <h4 className="font-bold">Slider</h4>
          <div className="ml-4">
            <p>Raw: {sliderValues.join(",")}</p>
            <p>
              Date: s:{`${startDate?.month}-${startDate?.year}`}, e:
              {`${endDate?.month}-${endDate?.year}`}
            </p>
          </div>
          <h4 className="font-bold">Data</h4>
          <div className="ml-4">
            <Suspense fallback={<>Fetching...</>}>
              <BikeRecords bikeDataPromise={bikeDataPromise} />
            </Suspense>
          </div>
        </div> */}

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
