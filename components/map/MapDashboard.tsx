import { useState } from "react";
import { DashboardDateRange } from "./DashboardDateRange";
import { DashboardTileSwitcher } from "./DashboardTileSwitcher";
import { DashboardToggle } from "./DashboardToggle";
import { DashboardVisualizationMode } from "./DashboardVisualizationMode";
import { HeatLegend } from "./HeatLegend";
import { MapTools } from "./MapTools";
import { HeatRow, MonthYear } from "@/types";

interface MapDashboardProps {
  byHood: boolean;
  setByHood: (val: boolean) => void;
  timeWeighting: string;
  setTimeWeighting: (val: string) => void;
  weightKInv: number;
  setWeightKInv: (k: number) => void;
  weightKInvQuad: number;
  setWeightKInvQuad: (k: number) => void;
  weightFlipped: boolean;
  onWeightFlipToggle: () => void;
  poissonIndex: number;
  setPoissonIndex: (i: number) => void;
}

const initialSliderValues = [750, 1000];

export function MapDashboard({
  byHood,
  setByHood,
  timeWeighting,
  setTimeWeighting,
  weightKInv,
  setWeightKInv,
  weightKInvQuad,
  setWeightKInvQuad,
  weightFlipped,
  onWeightFlipToggle,
  poissonIndex,
  setPoissonIndex
}: MapDashboardProps) {
  // Date Range variables
  const [sliderValues, setSliderValue] =
    useState<number[]>(initialSliderValues);
  const [committedSliderValues, commitSliderValues] =
    useState<number[]>(initialSliderValues);

  // Visualization Mode variables
  const [rows, setRows] = useState<HeatRow[]>([]);
  const [queryRange, setQueryRange] = useState<{
    start: MonthYear;
    end: MonthYear;
  } | null>(null);

  return (
    <div className="absolute sm:w-full sm:min-h-45 p-2 bottom-0 left-1/2 -translate-x-1/2 flex gap-2 z-1000 pointer-events-none">
      {/* Map Controls */}
      <div className="gap-2 flex flex-col sm:min-w-8 sm:h-45 sm:self-end">
        {/* Dashboard Toggle */}
        <DashboardToggle className="bg-white grow pointer-events-auto rounded" />

        {/* Zoom, Reset, Fullscreen */}
        <MapTools className="gap-2 flex flex-col pointer-events-auto" />
      </div>

      {/* Widgets */}
      <div className="sm:overflow-x-scroll flex gap-2">
        {/* Visualization Mode */}
        <DashboardVisualizationMode
          className="bg-white sm:min-w-130 pointer-events-auto rounded"
          byHood={byHood}
          setByHood={setByHood}
          rows={rows}
          queryRange={queryRange}
          timeWeighting={timeWeighting}
          setTimeWeighting={setTimeWeighting}
          weightKInv={weightKInv}
          setWeightKInv={setWeightKInv}
          weightKInvQuad={weightKInvQuad}
          setWeightKInvQuad={setWeightKInvQuad}
          weightFlipped={weightFlipped}
          onWeightFlipToggle={onWeightFlipToggle}
          poissonIndex={poissonIndex}
          setPoissonIndex={setPoissonIndex}
        />

        <div className="flex flex-col gap-2 sm:w-fit pointer-events-auto sm:h-45 sm:self-end">
          {/* Top Row */}
          <div className="flex gap-2 sm:h-8">
            {/* Heat Legend */}
            <HeatLegend className="sm:h-full pointer-events-auto rounded bg-white" />
          </div>

          {/* Bottom Row */}
          <div className="flex gap-2 sm:w-fit sm:h-35">
            {/* Tile Menu */}
            <DashboardTileSwitcher className="bg-white sm:min-w-30 rounded" />

            {/* Date Range */}
            <DashboardDateRange
              className="bg-white rounded sm:min-w-90 pointer-events-auto"
              sliderValues={sliderValues}
              setSliderValue={setSliderValue}
              committedSliderValues={committedSliderValues}
              commitSliderValues={commitSliderValues}
              setRows={setRows}
              setQueryRange={setQueryRange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
