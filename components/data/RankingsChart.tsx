"use client";

import { useEffect, useState } from "react";
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
import type { CategoryColumn, CategoryRankingRow } from "@/types/db";

interface RankingsChartProps {
  className?: string;
}

const CATEGORY_OPTIONS: { mode: CategoryColumn; text: string }[] = [
  { mode: "primary_offence", text: "Offence Type" },
  { mode: "bike_colour", text: "Bike Colour" },
  { mode: "premises_type", text: "Premises Type" },
  { mode: "bike_make", text: "Bike Make" }
];

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

  return (
    <div className={className ?? ""}>
      <Selection
        mode={category}
        setMode={setCategory}
        options={CATEGORY_OPTIONS}
      />
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <XAxis type="number" />
          <YAxis type="category" dataKey="label" width={120} />
          <Tooltip />
          <Bar dataKey="count" fill="#475569" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
