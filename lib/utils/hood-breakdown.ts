import { groupOffence } from "@/constants/offence-groups";
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
  const byHood = new Map<string, Map<string, number>>();

  for (const row of rows) {
    const category = groupOffence(row.primary_offence);
    const categories = byHood.get(row.hood_158) ?? new Map<string, number>();
    categories.set(category, (categories.get(category) ?? 0) + row.count);
    byHood.set(row.hood_158, categories);
  }

  return Array.from(byHood.entries()).map(([hood_158, categories]) => {
    const offences = Array.from(categories.entries()).map(([label, count]) => ({
      label,
      count
    }));
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
