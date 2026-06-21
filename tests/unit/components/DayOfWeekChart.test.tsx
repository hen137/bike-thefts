import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

vi.mock("@/hooks", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/hooks")>();
  return {
    ...actual,
    useDbContext: vi.fn()
  };
});

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children?: ReactNode }) => (
    <div data-testid="dow-bar-chart">{children}</div>
  ),
  BarChart: ({
    data,
    children
  }: {
    data: { occ_dow: string; count: number }[];
    children?: ReactNode;
  }) => (
    <div>
      {data.map((d) => (
        <div key={d.occ_dow} data-testid="dow-bar">
          {d.occ_dow}: {d.count}
        </div>
      ))}
      {children}
    </div>
  ),
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null
}));

import { DayOfWeekChart } from "@/components/data/DayOfWeekChart";
import { DataContext } from "@/contexts/DataContext";
import { useDbContext } from "@/hooks";
import type { DataContextValue } from "@/types/data";
import type { HeatRow } from "@/types/db";

const mockUseDbContext = vi.mocked(useDbContext);

const queryDayOfWeek = vi.fn().mockResolvedValue([]);

const READY_CONTEXT = {
  isReady: true,
  initResult: {
    status: "cached" as const,
    recordCount: 5000,
    lastFetched: null,
    minDate: "2020-04-15",
    maxDate: "2026-08-15"
  },
  progress: null,
  error: null,
  worker: { queryDayOfWeek } as unknown as ReturnType<
    typeof useDbContext
  >["worker"],
  refresh: vi.fn()
};

function makeContextValue(
  overrides: Partial<DataContextValue> = {}
): DataContextValue {
  return {
    byHood: true,
    setByHood: vi.fn(),
    queryRange: {
      startDate: { month: 0, year: 2023 },
      endDate: { month: 5, year: 2023 }
    },
    setQueryRange: vi.fn(),
    rows: [] as HeatRow[],
    setRows: vi.fn(),
    weightFlipped: false,
    setWeightFlipped: vi.fn(),
    histBins: [],
    setHistBins: vi.fn(),
    timeWeighting: "None",
    setTimeWeighting: vi.fn(),
    weightKInv: 0.5,
    setWeightKInv: vi.fn(),
    weightKInvQuad: 0.25,
    setWeightKInvQuad: vi.fn(),
    ...overrides
  };
}

function renderWithContext() {
  return render(
    <DataContext.Provider value={makeContextValue()}>
      <DayOfWeekChart />
    </DataContext.Provider>
  );
}

describe("DayOfWeekChart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryDayOfWeek.mockResolvedValue([]);
    mockUseDbContext.mockReturnValue(READY_CONTEXT);
  });

  it("queries worker.queryDayOfWeek with the query range on mount", async () => {
    renderWithContext();

    await waitFor(() => {
      expect(queryDayOfWeek).toHaveBeenCalledWith("2023-01-01", "2023-06-30");
    });
  });

  it("orders all seven days Sunday through Saturday, filling missing days with 0", async () => {
    queryDayOfWeek.mockResolvedValue([
      { occ_dow: "Wednesday", count: 5 },
      { occ_dow: "Sunday", count: 2 },
      { occ_dow: "Friday", count: 3 }
    ]);
    renderWithContext();

    await waitFor(() => {
      expect(screen.getAllByTestId("dow-bar")).toHaveLength(7);
    });
    const bars = screen.getAllByTestId("dow-bar").map((el) => el.textContent);
    expect(bars).toEqual([
      "Sunday: 2",
      "Monday: 0",
      "Tuesday: 0",
      "Wednesday: 5",
      "Thursday: 0",
      "Friday: 3",
      "Saturday: 0"
    ]);
  });
});
