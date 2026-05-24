import { DEFAULT_MAP_CONFIG } from "@/constants/map-config";
import { Suspense, use } from "react";
import { DebugSlider } from "./DebugSlider";
import { BikeData, BikeDateExtremes, MonthYear } from "@/types/map";

interface DebugHUDProps {
  className?: string;
  sliderValues: number[];
  startDate: MonthYear | null;
  endDate: MonthYear | null;
  mean: number | null;
  std: number | null;
  blur: [number];
  setBlur: (value: [number]) => void;
  radius: [number];
  setRadius: (value: [number]) => void;
  maxZoom: [number];
  setMaxZoom: (value: [number]) => void;
  bikeData: Promise<BikeData> | null;
  bikeDateExtremes: Promise<BikeDateExtremes> | null;
}

function BikeRecords({
  bikeDataPromise,
  bikeDateExtremesPromise
}: {
  bikeDataPromise: Promise<BikeData>;
  bikeDateExtremesPromise: Promise<BikeDateExtremes>;
}) {
  const bikeData = use(bikeDataPromise);
  const numFetches = bikeData.length;
  let totalRecords = 0;
  bikeData.forEach((batch) => (totalRecords += batch.features.length));

  const { startDateExtreme, endDateExtreme } = use(bikeDateExtremesPromise);

  return (
    <div>
      <p>Fetches: {numFetches}</p>
      <p>Records: {totalRecords}</p>
      <p>Start Date: {`${startDateExtreme.month}-${startDateExtreme.year}`}</p>
      <p>End Date: {`${endDateExtreme.month}-${endDateExtreme.year}`}</p>
    </div>
  );
}

export function DebugHUD({
  //   className = "",
  sliderValues,
  startDate,
  endDate,
  mean,
  std,
  blur,
  setBlur,
  radius,
  setRadius,
  maxZoom,
  setMaxZoom,
  bikeData,
  bikeDateExtremes
}: DebugHUDProps) {
  return (
    <div id="debug" className="absolute -left-200 w-100">
      <h4 className="font-bold">Slider</h4>
      <div className="ml-4">
        <p>Raw: {sliderValues.join(",")}</p>
        <p>
          Date: s:{`${startDate?.month}-${startDate?.year}`}, e:
          {`${endDate?.month}-${endDate?.year}`}
        </p>
      </div>
      <h4 className="font-bold">Stats</h4>
      <div className="ml-4">
        <p>Mean: {mean}</p>
        <p>Std: {std}</p>
      </div>
      <h4 className="font-bold">Heatmap Settings</h4>
      <div className="ml-4">
        <div className="relative flex items-center flex-row">
          <p>Blur: {blur}</p>
          <DebugSlider updateValue={setBlur} defaultVal={blur} />
        </div>
        <div className="relative flex items-center flex-row">
          <p>Radius: {radius}</p>
          <DebugSlider updateValue={setRadius} defaultVal={radius} />
        </div>
        <div className="relative flex items-center flex-row">
          <p>Max Zoom: {maxZoom}</p>
          <DebugSlider
            updateValue={setMaxZoom}
            defaultVal={maxZoom}
            max={DEFAULT_MAP_CONFIG.maxZoom}
            increment={1}
          />
        </div>
      </div>
      <h4 className="font-bold">Data</h4>
      <div className="ml-4">
        <Suspense fallback={<>Fetching...</>}>
          {bikeData && bikeDateExtremes && (
            <BikeRecords
              bikeDataPromise={bikeData}
              bikeDateExtremesPromise={bikeDateExtremes}
            />
          )}
        </Suspense>
      </div>
    </div>
  );
}
