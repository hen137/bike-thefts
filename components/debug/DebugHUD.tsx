import { DEFAULT_MAP_CONFIG } from "@/constants/map-config";
import { DebugSlider } from "@/components/debug";
import { DebugHUDProps } from "@/types/components";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const [year, month] = iso.split("-");
  return `${month}-${year}`;
}

export function DebugHUD({
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
  totalRecords,
  currentQueryCount,
  dbMinDate,
  dbMaxDate
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
      </div>

      <h4 className="font-bold">Database</h4>
      <div className="ml-4">
        <p>Total records: {totalRecords ?? "—"}</p>
        <p>Current query: {currentQueryCount ?? "—"} records</p>
        <p>
          Date range: {formatDate(dbMinDate)} → {formatDate(dbMaxDate)}
        </p>
      </div>
    </div>
  );
}
