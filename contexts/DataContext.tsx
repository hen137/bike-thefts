"use client";

import { HeatRow, MonthYear } from "@/types";
import { DataProviderProps } from "@/types/contexts";
import { DataContextValue } from "@/types/data";
import { createContext, useMemo, useState } from "react";

export const DataContext = createContext<DataContextValue | undefined>(
  undefined
);

export function DataProvider({ children }: DataProviderProps) {
  //
  const [byHood, setByHood] = useState(true);

  // dateMode: MapOptions (display active selection),
  // setDateMode: MapOptions (user selection)
  // const [dateMode, setDateMode] = useState<DateMode>("30days");

  // queryRange: LeafletHeatLayer (compute heatmap values), DateRangeGraph (compute hist bins)
  // setQueryRange: MapOptions (seeds the real default once DB bounds are known,
  // then updates on user date range changes)
  //
  // Initial value is a placeholder relative to today's date, not the DB's max
  // date (which isn't known synchronously here). MapOptions corrects this to
  // the real "90 days back from DB max date" default exactly once, before the
  // picker is ever interactive, so this placeholder is never user-visible.
  const today = new Date();
  const ninetyDaysAgo = new Date(today);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const [queryRange, setQueryRange] = useState<{
    startDate: MonthYear;
    endDate: MonthYear;
  }>({
    startDate: {
      month: ninetyDaysAgo.getMonth(),
      year: ninetyDaysAgo.getFullYear()
    },
    endDate: { month: today.getMonth(), year: today.getFullYear() }
  });

  // rows: LeafletHeatLayer (compute heatmap values), DateRangeGraph (compute hist bins)
  // setRows: MapOptions (update on date range change)
  const [rows, setRows] = useState<HeatRow[]>([]);

  // weightFlipped: LeafletHeatLayer (compute heatmap values), DateRangeGraph (compute hist bins)
  // setWeightFlipped: DateRangeGraph (user flip)
  const [weightFlipped, setWeightFlipped] = useState(false);

  // histBins:
  // setHistBins: DateRangeGraph (update on weight flip)
  const [histBins, setHistBins] = useState<number[]>([]);

  //
  const [timeWeighting, setTimeWeighting] = useState("None");

  //
  const [weightKInv, setWeightKInv] = useState(0.5);

  //
  const [weightKInvQuad, setWeightKInvQuad] = useState(0.25);

  const value: DataContextValue = useMemo(
    () => ({
      byHood,
      setByHood,
      // dateMode,
      // setDateMode,
      queryRange,
      setQueryRange,
      rows,
      setRows,
      weightFlipped,
      setWeightFlipped,
      histBins,
      setHistBins,
      timeWeighting,
      setTimeWeighting,
      weightKInv,
      setWeightKInv,
      weightKInvQuad,
      setWeightKInvQuad
    }),
    [
      byHood,
      setByHood,
      // dateMode,
      // setDateMode,
      queryRange,
      setQueryRange,
      rows,
      setRows,
      weightFlipped,
      setWeightFlipped,
      histBins,
      setHistBins,
      timeWeighting,
      setTimeWeighting,
      weightKInv,
      setWeightKInv,
      weightKInvQuad,
      setWeightKInvQuad
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
