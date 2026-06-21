"use client";

import { useEffect, useRef } from "react";
import { SegmentedToggle } from "./SegmentedToggle";
import { DateRangePicker, DateRangePlaceholder } from "../ui/DateRangePicker";
import { useDbContext, useDataSettings } from "@/hooks";
import type { MonthYear } from "@/types";

interface MapOptionsProps {
  className?: string;
}

// default time delta in months for initial date range
const monthsDelta = 6;

function monthYearFromISODate(iso: string): MonthYear {
  // Parse the "YYYY-MM-DD" components directly rather than going through
  // `new Date(iso)`. A date-only ISO string is parsed as UTC midnight, but
  // `.getMonth()`/`.getFullYear()` read it back in local time — in any
  // negative-UTC-offset timezone that can shift the date backward across a
  // month (or year) boundary.
  const [year, month] = iso.split("-").map(Number);
  return { month: month - 1, year };
}

function dateFromOffset(refDate: MonthYear, offsetMonths: number): MonthYear {
  const totalMonths = refDate.year * 12 + refDate.month - offsetMonths;
  return {
    month: ((totalMonths % 12) + 12) % 12,
    year: Math.floor(totalMonths / 12)
  };
}

function isoStartOfMonth(my: MonthYear): string {
  return `${my.year}-${String(my.month + 1).padStart(2, "0")}-01`;
}

function isoEndOfMonth(my: MonthYear): string {
  return new Date(my.year, my.month + 1, 0).toISOString().split("T")[0];
}

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
