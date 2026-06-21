"use client";

import { useDataSettings } from "@/hooks/useDataSettings";
import { computeHistBins, HistBin } from "@/lib/utils/heatmap";
import { useEffect } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

interface DateRangeGraphProps {
  className?: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short"
  });
}
interface HistTooltipProps {
  active?: boolean;
  payload?: { payload: HistBin & { bin: number } }[];
}

function HistTooltip({ active, payload }: HistTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const bin = payload[0].payload;
  return (
    <div className="rounded border border-slate-600 bg-slate-800 px-2 py-1 text-xs text-slate-100 items-center flex flex-col">
      <div>
        {bin.count} record{bin.count === 1 ? "" : "s"}
      </div>
      <div>
        {formatDate(bin.binStart)} – {formatDate(bin.binEnd)}
      </div>
    </div>
  );
}

export function DateRangeGraph({ className }: DateRangeGraphProps) {
  const { queryRange, rows, histBins, setHistBins } = useDataSettings();

  useEffect(() => {
    setHistBins(
      computeHistBins(rows, queryRange.startDate, queryRange.endDate)
    );
  }, [rows, queryRange]);

  const data = histBins.map((bin, i) => ({ bin: i, ...bin }));
  const lastBin = data.length - 1;

  function EdgeTick(props: unknown) {
    const { x, y, payload } = props as {
      x: number;
      y: number;
      payload: { value: number };
    };
    const isFirst = payload.value === 0;
    const isLast = payload.value === lastBin;
    if (!isFirst && !isLast) return <></>;
    return (
      <text
        x={x}
        y={y + 10}
        textAnchor={isFirst ? "start" : "end"}
        fill="currentColor"
        fontSize={12}
      >
        {isFirst
          ? formatDate(data[0]?.binStart ?? "")
          : formatDate(data[lastBin]?.binEnd ?? "")}
      </text>
    );
  }

  return (
    <div className={className ?? ""}>
      <p>Records Histogram</p>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 4, bottom: 5, left: 4 }}>
          <XAxis
            dataKey="bin"
            type="category"
            interval={0}
            tickLine={false}
            tick={EdgeTick as never}
          />
          <Tooltip content={<HistTooltip />} />
          <Bar dataKey="count" fill="#475569" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
