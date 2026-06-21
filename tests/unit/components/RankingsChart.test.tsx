import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
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
    <div data-testid="rankings-bar-chart">{children}</div>
  ),
  BarChart: ({
    data,
    children
  }: {
    data: { label: string; count: number }[];
    children?: ReactNode;
  }) => (
    <div>
      {data.map((d) => (
        <div key={d.label} data-testid="rankings-bar">
          {d.label}: {d.count}
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

import { RankingsChart } from "@/components/data/RankingsChart";
import { DataContext } from "@/contexts/DataContext";
import { useDbContext } from "@/hooks";
import type { DataContextValue } from "@/types/data";
import type { HeatRow } from "@/types/db";

const mockUseDbContext = vi.mocked(useDbContext);

const queryCategoryRanking = vi.fn().mockResolvedValue([]);

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
  worker: { queryCategoryRanking } as unknown as ReturnType<
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
      <RankingsChart />
    </DataContext.Provider>
  );
}

describe("RankingsChart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryCategoryRanking.mockResolvedValue([]);
    mockUseDbContext.mockReturnValue(READY_CONTEXT);
  });

  it("queries worker.queryCategoryRanking with the query range and default category on mount", async () => {
    renderWithContext();

    await waitFor(() => {
      expect(queryCategoryRanking).toHaveBeenCalledWith(
        "2023-01-01",
        "2023-06-30",
        "primary_offence"
      );
    });
  });

  it("renders a bar for each returned ranking row", async () => {
    queryCategoryRanking.mockResolvedValue([
      { label: "THEFT UNDER", count: 5 },
      { label: "THEFT OVER", count: 2 }
    ]);
    renderWithContext();

    await waitFor(() => {
      expect(screen.getAllByTestId("rankings-bar")).toHaveLength(2);
    });
  });

  it("re-queries with the newly selected category", async () => {
    renderWithContext();
    await waitFor(() => expect(queryCategoryRanking).toHaveBeenCalled());
    queryCategoryRanking.mockClear();

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("Bike Colour"));

    await waitFor(() => {
      expect(queryCategoryRanking).toHaveBeenCalledWith(
        "2023-01-01",
        "2023-06-30",
        "bike_colour"
      );
    });
  });
});
