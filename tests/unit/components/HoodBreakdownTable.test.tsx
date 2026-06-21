import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

vi.mock("@/hooks", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/hooks")>();
  return {
    ...actual,
    useDbContext: vi.fn()
  };
});

import { HoodBreakdownTable } from "@/components/data/HoodBreakdownTable";
import { DataContext } from "@/contexts/DataContext";
import { useDbContext } from "@/hooks";
import type { DataContextValue } from "@/types/data";
import type { HeatRow } from "@/types/db";

const mockUseDbContext = vi.mocked(useDbContext);

const queryHoodOffenceBreakdown = vi.fn().mockResolvedValue([]);

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
  worker: { queryHoodOffenceBreakdown } as unknown as ReturnType<
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
      startDate: { month: 0, year: 2023 }, // Jan 2023
      endDate: { month: 1, year: 2023 } // Feb 2023 -> 2 months
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
      <HoodBreakdownTable />
    </DataContext.Provider>
  );
}

describe("HoodBreakdownTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryHoodOffenceBreakdown.mockResolvedValue([]);
    mockUseDbContext.mockReturnValue(READY_CONTEXT);
  });

  it("queries worker.queryHoodOffenceBreakdown with the query range on mount", async () => {
    renderWithContext();

    await waitFor(() => {
      expect(queryHoodOffenceBreakdown).toHaveBeenCalledWith(
        "2023-01-01",
        "2023-02-28"
      );
    });
  });

  it("renders one row per hood with total, top offences, and avg/month", async () => {
    queryHoodOffenceBreakdown.mockResolvedValue([
      { hood_158: "Annex (95)", primary_offence: "THEFT UNDER", count: 6 },
      { hood_158: "Annex (95)", primary_offence: "THEFT OVER", count: 2 }
    ]);
    renderWithContext();

    await waitFor(() => {
      expect(screen.getByText("Annex (95)")).toBeInTheDocument();
    });
    expect(screen.getByText("8")).toBeInTheDocument(); // total
    expect(screen.getByText("4.0")).toBeInTheDocument(); // avgPerMonth (8/2)
    expect(screen.getByText(/THEFT UNDER/)).toBeInTheDocument();
    expect(screen.getByText(/THEFT OVER/)).toBeInTheDocument();
  });

  it("sorts by total count when the total column header is clicked", async () => {
    queryHoodOffenceBreakdown.mockResolvedValue([
      { hood_158: "Low Hood", primary_offence: "A", count: 1 },
      { hood_158: "High Hood", primary_offence: "A", count: 10 }
    ]);
    renderWithContext();

    await waitFor(() => {
      expect(screen.getByText("Low Hood")).toBeInTheDocument();
    });

    const getRowOrder = () =>
      screen
        .getAllByRole("row")
        .slice(1)
        .map((r) => r.textContent ?? "");

    fireEvent.click(screen.getByText("Total"));
    let order = getRowOrder();
    const ascFirst = order[0];

    fireEvent.click(screen.getByText("Total"));
    order = getRowOrder();
    expect(order[0]).not.toBe(ascFirst);
  });
});
