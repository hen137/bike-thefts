"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { useDataSettings, useDbContext } from "@/hooks";
import { isoStartOfMonth, isoEndOfMonth } from "@/lib/utils/date-range";
import { Selection } from "@/components/ui/Selection";
import { bikeColour, bikeMake, bikeType } from "@/constants/TPS-mapping";
import { groupOffence } from "@/constants/offence-groups";
import type { CategoryColumn, CategoryRankingRow } from "@/types/db";

interface RankingsChartProps {
  className?: string;
}

// Some columns (bike_make, bike_colour) have dozens of distinct values —
// too many bars to render legibly in a fixed-height chart. Show only the
// top N real categories by count; the rest are dropped, not lumped into
// a synthetic "Other" bucket.
const MAX_BARS = 10;

const CATEGORY_OPTIONS: { mode: CategoryColumn; text: string }[] = [
  { mode: "primary_offence", text: "Offence Type" },
  { mode: "bike_colour", text: "Bike Colour" },
  { mode: "premises_type", text: "Premises Type" },
  { mode: "bike_make", text: "Bike Make" },
  { mode: "bike_type", text: "Bike Type" }
];

// DB stores these columns as TPS abbreviation codes; translate to full names for chart labels.
const LABEL_MAPS: Partial<Record<CategoryColumn, Record<string, string>>> = {
  bike_colour: bikeColour,
  bike_make: bikeMake,
  bike_type: bikeType
};

function capToTopN(
  rows: CategoryRankingRow[],
  maxBars: number
): CategoryRankingRow[] {
  if (rows.length <= maxBars) return rows;
  return [...rows].sort((a, b) => b.count - a.count).slice(0, maxBars);
}

export function RankingsChart({ className }: RankingsChartProps) {
  const { isReady, worker } = useDbContext();
  const { queryRange } = useDataSettings();
  const [category, setCategory] = useState<CategoryColumn>("primary_offence");
  const [data, setData] = useState<CategoryRankingRow[]>([]);

  useEffect(() => {
    if (!isReady || !worker) return;
    const startISO = isoStartOfMonth(queryRange.startDate);
    const endISO = isoEndOfMonth(queryRange.endDate);
    worker
      .queryCategoryRanking(startISO, endISO, category)
      .then((rows) => setData(rows));
  }, [queryRange, isReady, worker, category]);

  const labelMap = LABEL_MAPS[category];
  const displayData = useMemo(() => {
    let rows: CategoryRankingRow[];
    if (category === "primary_offence") {
      const totals = new Map<string, number>();
      for (const row of data) {
        const bucket = groupOffence(row.label);
        totals.set(bucket, (totals.get(bucket) ?? 0) + row.count);
      }
      rows = Array.from(totals, ([label, count]) => ({ label, count }));
    } else {
      rows = labelMap
        ? data.map((row) => ({
            ...row,
            label: labelMap[row.label] ?? row.label
          }))
        : data;
    }
    return capToTopN(rows, MAX_BARS);
  }, [data, category, labelMap]);

  return (
    <div className={`${className ?? ""} flex flex-col h-full`}>
      <p></p>
      <Selection
        mode={category}
        setMode={setCategory}
        options={CATEGORY_OPTIONS}
      />
      <div className="flex-1 min-h-0 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={displayData} layout="vertical">
            <XAxis type="number" />
            <YAxis type="category" dataKey="label" width={120} />
            <Tooltip />
            <Bar dataKey="count" fill="#475569" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
