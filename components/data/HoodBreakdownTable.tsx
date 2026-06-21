"use client";

import { useEffect, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState
} from "@tanstack/react-table";
import { useDataSettings, useDbContext } from "@/hooks";
import {
  isoStartOfMonth,
  isoEndOfMonth,
  monthsInRange
} from "@/lib/utils/date-range";
import {
  aggregateHoodBreakdown,
  type HoodBreakdownRow
} from "@/lib/utils/hood-breakdown";
import type { HoodOffenceRow } from "@/types/db";

interface HoodBreakdownTableProps {
  className?: string;
}

const columns: ColumnDef<HoodBreakdownRow>[] = [
  { accessorKey: "hood_158", header: "Neighbourhood" },
  { accessorKey: "total", header: "Total" },
  {
    id: "topOffences",
    header: "Top Offences",
    cell: ({ row }) =>
      row.original.topOffences.map((o) => `${o.label} (${o.count})`).join(", ")
  },
  {
    accessorKey: "avgPerMonth",
    header: "Avg / Month",
    cell: ({ getValue }) => (getValue() as number).toFixed(1)
  }
];

export function HoodBreakdownTable({ className }: HoodBreakdownTableProps) {
  const { isReady, worker } = useDbContext();
  const { queryRange } = useDataSettings();
  const [rawRows, setRawRows] = useState<HoodOffenceRow[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    if (!isReady || !worker) return;
    const startISO = isoStartOfMonth(queryRange.startDate);
    const endISO = isoEndOfMonth(queryRange.endDate);
    worker
      .queryHoodOffenceBreakdown(startISO, endISO)
      .then((result) => setRawRows(result));
  }, [queryRange, isReady, worker]);

  const data = useMemo(
    () =>
      aggregateHoodBreakdown(
        rawRows,
        monthsInRange(queryRange.startDate, queryRange.endDate)
      ),
    [rawRows, queryRange]
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  return (
    <div className={className ?? ""}>
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className="cursor-pointer"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
