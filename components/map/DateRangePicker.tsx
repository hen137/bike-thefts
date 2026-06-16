"use client";

import { Popover } from "@base-ui/react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useDbContext } from "@/hooks";
import { calcRawSliderToDates, calcDatesToRawSlider } from "@/lib/utils";
import type { MonthYear } from "@/types";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];

const MONTH_NAME_INDEX = Object.fromEntries(
  MONTH_LABELS.map((m, i) => [m.toLowerCase(), i])
);

const MAX_RANGE = 1000;

function compareMonthYear(a: MonthYear, b: MonthYear): number {
  if (a.year !== b.year) return a.year - b.year;
  return a.month - b.month;
}

function format(my: MonthYear): string {
  return `${String(my.month + 1).padStart(2, "0")}/${my.year}`;
}

function parse(raw: string): MonthYear | null {
  const numeric = raw.match(/^(\d{1,2})\/(\d{4})$/);
  if (numeric) {
    const month = parseInt(numeric[1], 10) - 1;
    const year = parseInt(numeric[2], 10);
    if (month >= 0 && month <= 11 && year > 0) return { month, year };
  }
  const named = raw.toLowerCase().match(/^([a-z]+)\s+(\d{4})$/);
  if (named) {
    const idx = MONTH_NAME_INDEX[named[1].slice(0, 3)];
    const year = parseInt(named[2], 10);
    if (idx !== undefined && year > 0) return { month: idx, year };
  }
  return null;
}

interface MonthPickerProps {
  value: MonthYear;
  onChange: (val: MonthYear) => void;
  min: MonthYear;
  max: MonthYear;
}

function MonthPicker({ value, onChange, min, max }: MonthPickerProps) {
  const [open, setOpen] = useState(false);
  const [navYear, setNavYear] = useState(value.year);
  const [inputValue, setInputValue] = useState(format(value));

  useEffect(() => {
    setNavYear(value.year);
    setInputValue(format(value));
  }, [value.year, value.month]);

  function isDisabled(month: number): boolean {
    const candidate = { month, year: navYear };
    return (
      compareMonthYear(candidate, min) < 0 ||
      compareMonthYear(candidate, max) > 0
    );
  }

  function commitInput() {
    const parsed = parse(inputValue);
    if (!parsed) {
      setInputValue(format(value));
      return;
    }
    if (compareMonthYear(parsed, min) < 0) {
      onChange(min);
    } else if (compareMonthYear(parsed, max) > 0) {
      onChange(max);
    } else {
      onChange(parsed);
    }
  }

  return (
    <div className="flex items-center rounded border border-gray-300 bg-white">
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={commitInput}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            commitInput();
          }
        }}
        className="w-[72px] bg-transparent px-2 py-1 text-center text-sm text-gray-700 outline-none"
        placeholder="MM/YYYY"
        aria-label="Month and year"
      />
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger className="flex items-center justify-center border-l border-gray-300 px-1.5 py-1 hover:bg-gray-50">
          <CalendarDays className="h-3.5 w-3.5 text-gray-500" />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner
            side="bottom"
            align="start"
            sideOffset={4}
            className="z-[3000]"
          >
            <Popover.Popup className="w-52 rounded-lg border border-gray-200 bg-white p-3 shadow-xl">
              {/* Year nav */}
              <div className="mb-3 flex items-center justify-between">
                <button
                  onClick={() => setNavYear((y) => y - 1)}
                  disabled={navYear <= min.year}
                  className="rounded p-1 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600 " />
                </button>
                <span className="text-sm font-semibold text-gray-700">
                  {navYear}
                </span>
                <button
                  onClick={() => setNavYear((y) => y + 1)}
                  disabled={navYear >= max.year}
                  className="rounded p-1 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4 text-gray-600 " />
                </button>
              </div>
              {/* Month grid */}
              <div className="grid grid-cols-4 gap-1">
                {MONTH_LABELS.map((name, i) => {
                  const disabled = isDisabled(i);
                  const selected = value.year === navYear && value.month === i;
                  return (
                    <button
                      key={name}
                      disabled={disabled}
                      onClick={() => {
                        const next = { month: i, year: navYear };
                        onChange(next);
                        setOpen(false);
                      }}
                      className={`rounded py-1 text-xs transition-colors ${
                        selected
                          ? "bg-blue-600 text-white"
                          : disabled
                            ? "cursor-not-allowed text-gray-300"
                            : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}

interface DateRangePickerProps {
  sliderValues: number[];
  setSliderValue: (values: number[]) => void;
  commitSliderValues: (values: number[]) => void;
}

export function DateRangePicker({
  sliderValues,
  setSliderValue,
  commitSliderValues
}: DateRangePickerProps) {
  const { isReady, initResult } = useDbContext();

  if (!isReady || !initResult?.minDate || !initResult?.maxDate) {
    return (
      <div className="flex items-center justify-center gap-2">
        <div className="rounded border border-gray-200 px-3 py-1 text-xs text-gray-400">
          —
        </div>
        <span className="select-none text-gray-400">–</span>
        <div className="rounded border border-gray-200 px-3 py-1 text-xs text-gray-400">
          —
        </div>
      </div>
    );
  }

  const lowerBound = new Date(initResult.minDate);
  const upperBound = new Date(initResult.maxDate);
  const dateBounds = { lowerBound, upperBound };

  const min: MonthYear = {
    month: lowerBound.getMonth(),
    year: lowerBound.getFullYear()
  };
  const max: MonthYear = {
    month: upperBound.getMonth(),
    year: upperBound.getFullYear()
  };

  const { startDate, endDate } = calcRawSliderToDates(
    sliderValues,
    MAX_RANGE,
    dateBounds
  );

  function handleStartChange(val: MonthYear) {
    const newStart = calcDatesToRawSlider(val, MAX_RANGE, dateBounds);
    const next = [newStart, sliderValues[1]];
    setSliderValue(next);
    commitSliderValues(next);
  }

  function handleEndChange(val: MonthYear) {
    const newEnd = calcDatesToRawSlider(val, MAX_RANGE, dateBounds);
    const next = [sliderValues[0], newEnd];
    setSliderValue(next);
    commitSliderValues(next);
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <div className="flex flex-col items-center gap-1">
        <p className="text-xs font-semibold text-slate-500  uppercase tracking-wide">
          Start
        </p>
        <MonthPicker
          value={startDate}
          onChange={handleStartChange}
          min={min}
          max={endDate}
        />
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="invisible text-xs leading-none">X</div>
        <span className="select-none text-xs text-gray-400">–</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          End
        </p>
        <MonthPicker
          value={endDate}
          onChange={handleEndChange}
          min={startDate}
          max={max}
        />
      </div>
    </div>
  );
}
