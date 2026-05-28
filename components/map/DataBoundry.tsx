"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MonthYear } from "@/types/map";
import { HeatmapSlider } from "@/components/map";
import { DebugHUD } from "@/components/debug";
import { DEFAULT_HEATMAP_CONFIG } from "@/constants/map-config";
import { useLeafletHeatLayer } from "@/hooks";
import { useDbContext } from "@/contexts/DbContext";
import { buildHeatDataFromRows } from "@/lib/utils/heatmap";

const MAX_SLIDER_RANGE = 1000;
const endThumb = 1000;
const startThumb = 750;

export function DataBoundry() {
  const {
    registerZoomRadiusHandler,
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

  const startDateExtreme = useMemo<MonthYear>(
    () => ({ month: 0, year: 2014 }),
    []
  );

  const endDateExtreme = useMemo<MonthYear>(
    () => ({ month: 11, year: 2026 }),
    []
  );

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
  const [mean, setMean] = useState<number | null>(null);
  const [std, setStd] = useState<number | null>(null);
  const [avgIntensity, setAvgIntensity] = useState<number | null>(null);

  useEffect(() => {
    registerZoomRadiusHandler(setRadius);
  }, [registerZoomRadiusHandler]);

  useEffect(() => {
    setHeatOptions({ blur, radius, maxZoom });
  }, [heatLayer, blur, radius, maxZoom, setHeatOptions]);

  const calcDateRange = useCallback(
    (sliderVals: number[]) => {
      const yearDelta = endDateExtreme.year - startDateExtreme.year;
      const monthDelta =
        endDateExtreme.month - startDateExtreme.month + 12 * yearDelta;

      const startMonths = Math.floor(
        (sliderVals[0] * monthDelta) / MAX_SLIDER_RANGE
      );
      const endMonths = Math.floor(
        (sliderVals[1] * monthDelta) / MAX_SLIDER_RANGE
      );

      const startMonth = startDateExtreme.month + (startMonths % 12);
      const startYear = startDateExtreme.year + Math.floor(startMonths / 12);

      const endMonth = startDateExtreme.month + (endMonths % 12);
      const endYear = startDateExtreme.year + Math.floor(endMonths / 12);

      return {
        startDate: { month: startMonth, year: startYear },
        endDate: { month: endMonth, year: endYear }
      };
    },
    [startDateExtreme, endDateExtreme]
  );

  useEffect(() => {
    const { startDate, endDate } = calcDateRange(sliderValues);
    setStartDate(startDate);
    setEndDate(endDate);
  }, [sliderValues, calcDateRange]);

  useEffect(() => {
    const { startDate, endDate } = calcDateRange(commitedSliderValues);
    setStartDate(startDate);
    setEndDate(endDate);

    if (isReady && worker) {
      const startISO = `${startDate.year}-${String(startDate.month + 1).padStart(2, "0")}-01`;
      const endISO = new Date(endDate.year, endDate.month + 1, 0)
        .toISOString()
        .split("T")[0];
      worker.queryHeatmap(startISO, endISO).then((rows) => {
        const { values, seenMean, stdev, avgIntensity } =
          buildHeatDataFromRows(rows);
        setHeatValues(values);
        setMean(seenMean);
        setStd(stdev);
        setAvgIntensity(avgIntensity);
        setCurrentQueryCount(rows.reduce((acc, r) => acc + r.count, 0));
      });
    }
  }, [commitedSliderValues, isReady, worker, calcDateRange, setHeatValues]);

  return (
    <>
      {/* Heatmap Slider */}
      <div className=" flex flex-col justify-center h-150 rounded-lg bg-white dark:bg-slate-700 shadow-lg">
        <HeatmapSlider
          initialValues={sliderValues}
          updateValues={setSliderValue}
          commitValues={commitSliderValues}
          sliderDates={{ endDate, startDate }}
        />
      </div>

      {/* Debug */}
      <DebugHUD
        sliderValues={sliderValues}
        startDate={startDate}
        endDate={endDate}
        mean={mean}
        std={std}
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
    </>
  );
}
