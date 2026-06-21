import type { HoodOffenceRow } from "@/types/db";

export type HoodBreakdownRow = {
  hood_158: string;
  total: number;
  topOffences: { label: string; count: number }[];
  avgPerMonth: number;
};

export function aggregateHoodBreakdown(
  rows: HoodOffenceRow[],
  months: number
): HoodBreakdownRow[] {
  const byHood = new Map<string, { label: string; count: number }[]>();

  for (const row of rows) {
    const offences = byHood.get(row.hood_158) ?? [];
    offences.push({ label: row.primary_offence, count: row.count });
    byHood.set(row.hood_158, offences);
  }

  return Array.from(byHood.entries()).map(([hood_158, offences]) => {
    const total = offences.reduce((sum, o) => sum + o.count, 0);
    const topOffences = [...offences]
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
    return {
      hood_158,
      total,
      topOffences,
      avgPerMonth: total / months
    };
  });
}
