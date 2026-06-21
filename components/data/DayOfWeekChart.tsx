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
import type { DayOfWeekRow } from "@/types/db";

interface DayOfWeekChartProps {
  className?: string;
}

const DAY_ORDER = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

export function DayOfWeekChart({ className }: DayOfWeekChartProps) {
  const { isReady, worker } = useDbContext();
  const { queryRange } = useDataSettings();
  const [rows, setRows] = useState<DayOfWeekRow[]>([]);

  useEffect(() => {
    if (!isReady || !worker) return;
    const startISO = isoStartOfMonth(queryRange.startDate);
    const endISO = isoEndOfMonth(queryRange.endDate);
    worker.queryDayOfWeek(startISO, endISO).then((result) => setRows(result));
  }, [queryRange, isReady, worker]);

  const data = DAY_ORDER.map((occ_dow) => ({
    occ_dow,
    count: rows.find((r) => r.occ_dow === occ_dow)?.count ?? 0
  }));

  return (
    <div className={className ?? ""}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="occ_dow" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#475569" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
