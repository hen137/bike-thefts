import { Suspense, useCallback, useEffect, useState } from "react";
import { BikeData, MonthYear } from "@/types/map";
import { Heatmap, HeatmapSlider } from "@/components/map";
import { DebugHUD } from "@/components/debug";
import { getBikeData } from "@/lib/bike-data";
import { DEFAULT_HEATMAP_CONFIG } from "@/constants/map-config";

const MAX_SLIDER_RANGE = 1000;
const endThumb = 1000;
const startThumb = 750;

export function DataBoundry() {
  const [sliderValues, setSliderValue] = useState<number[]>([
    startThumb,
    endThumb
  ]);
  const [commitedSliderValues, commitSliderValues] = useState(sliderValues);

  const [startDateExtreme] = useState<MonthYear>({
    month: 0,
    year: 2014
  });
  const [endDateExtreme] = useState<MonthYear>({
    month: 11,
    year: 2026
  });

  const [startDate, setStartDate] = useState<MonthYear | null>(null);
  const [endDate, setEndDate] = useState<MonthYear | null>(null);
  const [committedStartDate, commitStartDate] = useState<MonthYear | null>(
    null
  );
  const [committedEndDate, commitEndDate] = useState<MonthYear | null>(null);

  const [blur, setBlur] = useState<number>(DEFAULT_HEATMAP_CONFIG.blur!);
  const [radius, setRadius] = useState<number>(DEFAULT_HEATMAP_CONFIG.radius!);
  const [maxZoom, setMaxZoom] = useState<number>(
    DEFAULT_HEATMAP_CONFIG.maxZoom!
  );
  const [gradient] = useState(DEFAULT_HEATMAP_CONFIG.gradient);

  const [bikeData, setBikeData] = useState<Promise<BikeData> | null>(null);

  // debug
  const [mean, setMean] = useState<number | null>(null);
  const [std, setStd] = useState<number | null>(null);
  const [avgIntensity, setAvgIntensity] = useState<number | null>(null);

  // convert raw slider values to date values
  const calcDateRange = useCallback((sliderVals: number[]) => {
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

    const startDate = { month: startMonth, year: startYear };
    const endDate = { month: endMonth, year: endYear };

    return { startDate, endDate };
  }, []);

  useEffect(() => {
    const { startDate, endDate } = calcDateRange(sliderValues);
    setStartDate(startDate);
    setEndDate(endDate);
  }, [sliderValues, startDateExtreme, endDateExtreme]);

  // listen for changes in range
  useEffect(() => {
    const { startDate, endDate } = calcDateRange(commitedSliderValues);

    setStartDate(startDate);
    setEndDate(endDate);

    commitStartDate(startDate);
    commitEndDate(endDate);

    setBikeData(getBikeData({ startDate, endDate }));
  }, [commitedSliderValues, startDateExtreme, endDateExtreme]);

  return (
    <>
      {/* Heatmap */}
      <Suspense>
        {bikeData && (
          <Heatmap
            bikeDataPromise={bikeData}
            dateRanges={{
              endDate: committedEndDate,
              startDate: committedStartDate
            }}
            blur={blur}
            radius={radius}
            maxZoom={maxZoom}
            gradient={gradient}
            // debug
            updateMean={setMean}
            updateStd={setStd}
            updateAvgIntensity={setAvgIntensity}
          />
        )}
      </Suspense>

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
        bikeData={bikeData}
        bikeDateExtremes={{ startDateExtreme, endDateExtreme }}
      />
    </>
  );
}
