import type { MonthYear } from "@/types/map";

// Parse the "YYYY-MM-DD" components directly rather than going through
// `new Date(iso)`. A date-only ISO string is parsed as UTC midnight, but
// `.getMonth()`/`.getFullYear()` read it back in local time — in any
// negative-UTC-offset timezone that can shift the date backward across a
// month (or year) boundary.
export function monthYearFromISODate(iso: string): MonthYear {
  const [year, month] = iso.split("-").map(Number);
  return { month: month - 1, year };
}

export function isoStartOfMonth(my: MonthYear): string {
  return `${my.year}-${String(my.month + 1).padStart(2, "0")}-01`;
}

export function isoEndOfMonth(my: MonthYear): string {
  return new Date(my.year, my.month + 1, 0).toISOString().split("T")[0];
}

export function dateFromOffset(
  refDate: MonthYear,
  offsetMonths: number
): MonthYear {
  const totalMonths = refDate.year * 12 + refDate.month - offsetMonths;
  return {
    month: ((totalMonths % 12) + 12) % 12,
    year: Math.floor(totalMonths / 12)
  };
}

export function monthsInRange(start: MonthYear, end: MonthYear): number {
  return end.year * 12 + end.month - (start.year * 12 + start.month) + 1;
}
