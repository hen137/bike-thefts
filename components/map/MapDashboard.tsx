import { DashboardDateRange } from "./DashboardDateRange";
import { DashboardToggle } from "./DashboardToggle";
import { DashboardVisualizationMode } from "./DashboardVisualizationMode";
import { HeatLegend } from "./HeatLegend";
// import { MapTileSwitcher } from "./MapTileSwitcher";
import { MapTools } from "./MapTools";

interface MapDashboardProps {
  sliderValues: number[];
  setSliderValue: (values: number[]) => void;
  commitSliderValues: (values: number[]) => void;
}

export function MapDashboard({
  sliderValues,
  setSliderValue,
  commitSliderValues
}: MapDashboardProps) {
  return (
    <div className="absolute w-full h-1/4 p-3 bottom-0 left-1/2 -translate-x-1/2 flex gap-2 z-1000 pointer-events-none">
      <div className="gap-2 flex flex-col basis-1/47">
        {/* Dashboard Toggle */}
        <DashboardToggle className="bg-white grow pointer-events-auto rounded" />

        {/* Zoom, Reset, Fullscreen */}
        <MapTools className="gap-2 flex flex-col pointer-events-auto" />
      </div>

      {/* Visualization Mode */}
      <DashboardVisualizationMode className="bg-white basis-3/8 pointer-events-auto rounded" />

      <div className="flex flex-col gap-2 basis-3/7 pointer-events-auto">
        <div className="flex gap-2 h-10">
          {/* Tile Menu */}
          {/* <MapTileSwitcher buttonClassName="flex h-full aspect-square items-center justify-center rounded bg-white dark:bg-slate-700 shadow-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors" /> */}

          {/* Search Bar */}
          {/* <div className="bg-white basis-1/3" /> */}

          {/* Heat Legend */}
          <HeatLegend className="grow pointer-events-auto rounded" />
        </div>
        <div className="flex gap-2 basis-4/5">
          <div className="bg-white basis-2/8" />

          {/* Date Range */}
          <DashboardDateRange
            className="bg-white rounded grow pointer-events-auto"
            sliderValues={sliderValues}
            setSliderValue={setSliderValue}
            commitSliderValues={commitSliderValues}
          />
          {/* <div className="bg-white h-full grow" /> */}
        </div>
      </div>
    </div>
  );
}
