"use client";

import { useEffect, useRef } from "react";
import { SegmentedToggle } from "./SegmentedToggle";
import { DateRangePicker, DateRangePlaceholder } from "../ui/DateRangePicker";
import { useDbContext, useDataSettings } from "@/hooks";
import {
  monthYearFromISODate,
  isoStartOfMonth,
  isoEndOfMonth,
  dateFromOffset
} from "@/lib/utils/date-range";
import type { MonthYear } from "@/types";

interface MapOptionsProps {
  className?: string;
}

// default time delta in months for initial date range
const monthsDelta = 6;

export function MapOptions({ className }: MapOptionsProps) {
  const { isReady, worker, initResult } = useDbContext();
  const { byHood, setByHood, queryRange, setQueryRange, setRows } =
    useDataSettings();
  const hasSetDefaultRef = useRef(false);

  // One-time correction: replace the today-relative placeholder default with
  // "monthsDelta months back from the DB's max date" as soon as the DB is
  // ready. Runs
  // exactly once — DateRangePicker isn't rendered until isReady, so there's
  // no window where a user edit could be clobbered by this.
  useEffect(() => {
    if (!isReady || !initResult?.maxDate || hasSetDefaultRef.current) return;
    const endDate = monthYearFromISODate(initResult.maxDate);
    const startDate = dateFromOffset(endDate, monthsDelta);
    setQueryRange({ startDate, endDate });
    hasSetDefaultRef.current = true;
  }, [isReady, initResult, setQueryRange]);

  useEffect(() => {
    if (!isReady || !worker) return;
    const startISO = isoStartOfMonth(queryRange.startDate);
    const endISO = isoEndOfMonth(queryRange.endDate);
    worker.queryHeatmap(startISO, endISO).then((rows) => {
      setRows(rows);
    });
  }, [queryRange, isReady, worker, setRows]);

  const minDate: MonthYear = initResult?.minDate
    ? monthYearFromISODate(initResult.minDate)
    : { month: 0, year: 2010 };
  const maxDate: MonthYear = initResult?.maxDate
    ? monthYearFromISODate(initResult.maxDate)
    : { month: new Date().getMonth(), year: new Date().getFullYear() };

  return (
    <div
      className={
        className ??
        "sm:absolute sm:top-4 sm:left-4 flex flex-col justify-start gap-2 z-1000"
      }
    >
      {/* Local Scaling */}
      <div className="flex items-center w-full gap-3 bg-white px-3 py-2 rounded">
        <p className="text-xs text-nowrap font-semibold text-slate-500 uppercase tracking-wide">
          Local Scaling
        </p>
        <SegmentedToggle
          options={["Municipal", "Neighbourhood"]}
          activeIndex={byHood ? 1 : 0}
          onChange={(_, i) => setByHood(i === 1)}
        />
      </div>

      {/* Date Range */}
      <div className="flex items-center gap-3 bg-white px-3 py-2 rounded">
        <p className="text-xs text-nowrap font-semibold text-slate-500 uppercase tracking-wide">
          Date Range
        </p>
        <div>
          {isReady ? (
            <DateRangePicker
              startDate={queryRange.startDate}
              endDate={queryRange.endDate}
              onStartChange={(val) =>
                setQueryRange({ startDate: val, endDate: queryRange.endDate })
              }
              onEndChange={(val) =>
                setQueryRange({
                  startDate: queryRange.startDate,
                  endDate: val
                })
              }
              minDate={minDate}
              maxDate={maxDate}
            />
          ) : (
            <DateRangePlaceholder />
          )}
        </div>
      </div>
    </div>
  );
}
