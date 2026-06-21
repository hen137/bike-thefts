"use client";

import { useDataSettings } from "@/hooks/useDataSettings";
import { computeHistBins } from "@/lib/utils/heatmap";
import { useEffect } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

interface DateRangeGraphProps {
  className?: string;
}

export function DateRangeGraph({ className }: DateRangeGraphProps) {
  const { queryRange, rows, weightFlipped, histBins, setHistBins } =
    useDataSettings();

  useEffect(() => {
    const refDate = weightFlipped ? queryRange.startDate : queryRange.endDate;
    setHistBins(computeHistBins(rows, refDate));
  }, [rows, queryRange, weightFlipped]);

  const data = histBins.map((value, i) => ({ bin: i, value }));

  return (
    <div className={className ?? ""}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="bin" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#475569" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
