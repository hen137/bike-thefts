"use client";

import { useDataSettings } from "@/hooks/useDataSettings";
import { computeHistBins } from "@/lib/utils/heatmap";
import { useEffect } from "react";

interface DateRangeGraphProps {
  className?: string;
}

export function DateRangeGraph({ className }: DateRangeGraphProps) {
  const { queryRange, rows, weightFlipped, setHistBins } = useDataSettings();

  useEffect(() => {
    if (!queryRange) return;

    const refDate = weightFlipped ? queryRange.startDate : queryRange.endDate;
    setHistBins(computeHistBins(rows, refDate));
  }, [rows, queryRange, weightFlipped]);

  return <div className={className ?? ""}></div>;
}
