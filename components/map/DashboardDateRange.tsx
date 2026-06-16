import { useDbContext } from "@/hooks";
import { DateRangePicker } from "./DateRangePicker";
import { HeatSlider } from "./HeatSlider";
import { useEffect } from "react";
import { calcRawSliderToDates } from "@/lib/utils";
import { HeatRow, MonthYear } from "@/types";

interface DashboardDateRangeProps {
  className?: string;
  sliderValues: number[];
  setSliderValue: (values: number[]) => void;
  committedSliderValues: number[];
  commitSliderValues: (values: number[]) => void;
  setRows: (rows: HeatRow[]) => void;
  setQueryRange: (queryRange: { start: MonthYear; end: MonthYear }) => void;
}

const MAX_SLIDER_RANGE = 1000;

export function DashboardDateRange({
  className,
  sliderValues,
  setSliderValue,
  committedSliderValues,
  commitSliderValues,
  setRows,
  setQueryRange
}: DashboardDateRangeProps) {
  const { isReady, worker, initResult } = useDbContext();

  // Fetches rows for the committed date range from the worker — the only effect that
  // hits the DB. Weighting/aggregation params (byHood, timeWeighting, weightK*,
  // weightFlipped) don't change which rows are needed, so they're handled by the
  // recompute effect below using these cached rows — no DB round-trip on toggle.
  useEffect(() => {
    if (isReady && worker) {
      const { startDate, endDate } = calcRawSliderToDates(
        committedSliderValues,
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

      const startISO = `${startDate.year}-${String(startDate.month + 1).padStart(2, "0")}-01`;
      const endISO = new Date(endDate.year, endDate.month + 1, 0)
        .toISOString()
        .split("T")[0];

      worker.queryHeatmap(startISO, endISO).then((rows) => {
        // Set together so the recompute effect runs once per query, not once
        // for the range change and again when rows arrive.
        setRows(rows);
        setQueryRange({ start: startDate, end: endDate });
      });
    }
  }, [committedSliderValues, isReady, worker, initResult]);

  return (
    <div className={`${className} flex flex-col p-2`}>
      <h1 className="px-2 text-sm text-slate-600">Date Range</h1>
      <div className="flex flex-col justify-around grow px-8">
        {/* <div className="border-b" /> */}
        <DateRangePicker
          sliderValues={sliderValues}
          setSliderValue={setSliderValue}
          commitSliderValues={commitSliderValues}
        />
        <div className="w-full">
          <HeatSlider
            values={sliderValues}
            updateValues={setSliderValue}
            commitValues={commitSliderValues}
          />
        </div>
      </div>
    </div>
  );
}
