import { DEFAULT_MAP_CONFIG } from "@/constants/map-config";
import { Suspense, use } from "react";
import { DebugSlider } from "@/components/debug";
import { BikeData, BikeDateExtremes } from "@/types/map";
import { DebugHUDProps } from "@/types/components";

function BikeRecords({
  bikeDataPromise,
  bikeDateExtremes
}: {
  bikeDataPromise: Promise<BikeData>;
  bikeDateExtremes: BikeDateExtremes;
}) {
  const bikeData = use(bikeDataPromise);
  const numFetches = bikeData.length;
  let totalRecords = 0;
  bikeData.forEach((batch) => (totalRecords += batch.features.length));

  const { startDateExtreme, endDateExtreme } = bikeDateExtremes;

  return (
    <div>
      <p>Fetches: {numFetches}</p>
      <p>Records: {totalRecords}</p>
      {startDateExtreme && (
        <p>
          Start Date: {`${startDateExtreme.month}-${startDateExtreme.year}`}
        </p>
      )}
      {endDateExtreme && (
        <p>End Date: {`${endDateExtreme.month}-${endDateExtreme.year}`}</p>
      )}
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
  avgIntensity,
  blur,
  setBlur,
  radius,
  setRadius,
  maxZoom,
  setMaxZoom,
  // gradient,
  // setGradient,
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
        <p>Avg Intensity: {avgIntensity}</p>
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
        {/* <p>Gradient: {JSON.stringify(gradient)}</p> */}
      </div>

      <h4 className="font-bold">Data</h4>
      <div className="ml-4">
        <Suspense fallback={<>Fetching...</>}>
          {bikeData && bikeDateExtremes && (
            <BikeRecords
              bikeDataPromise={bikeData}
              bikeDateExtremes={bikeDateExtremes}
            />
          )}
        </Suspense>
      </div>
    </div>
  );
}
