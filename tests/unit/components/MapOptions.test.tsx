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

vi.mock("@base-ui/react", () => ({
  Popover: {
    Root: ({ children }: { children?: ReactNode }) => <>{children}</>,
    Trigger: ({ children }: { children?: ReactNode }) => (
      <button>{children}</button>
    ),
    Portal: ({ children }: { children?: ReactNode }) => <>{children}</>,
    Positioner: ({ children }: { children?: ReactNode }) => (
      <div>{children}</div>
    ),
    Popup: ({ children }: { children?: ReactNode }) => <div>{children}</div>
  }
}));

import { MapOptions } from "@/components/map/MapOptions";
import { DataProvider } from "@/contexts/DataContext";
import { useDbContext } from "@/hooks";

const mockUseDbContext = vi.mocked(useDbContext);

const queryHeatmap = vi.fn().mockResolvedValue([]);

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
  worker: { queryHeatmap } as unknown as ReturnType<
    typeof useDbContext
  >["worker"],
  refresh: vi.fn()
};

function renderWithProvider() {
  return render(
    <DataProvider>
      <MapOptions />
    </DataProvider>
  );
}

describe("MapOptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryHeatmap.mockResolvedValue([]);
  });

  it("shows placeholder dashes while DB is not ready", () => {
    mockUseDbContext.mockReturnValue({ ...READY_CONTEXT, isReady: false });
    renderWithProvider();
    expect(screen.getAllByText("-")).toHaveLength(2);
  });

  it("corrects the default queryRange to 6 months back from DB maxDate once ready", async () => {
    mockUseDbContext.mockReturnValue(READY_CONTEXT);
    renderWithProvider();

    // maxDate = 2026-08-15 → end picker should show 08/2026, start 02/2026
    await waitFor(() => {
      const inputs = screen.getAllByLabelText("Month and year");
      expect(inputs[1]).toHaveValue("08/2026");
    });
    const inputs = screen.getAllByLabelText("Month and year");
    expect(inputs[0]).toHaveValue("02/2026");
  });

  it("does not shift a day-1 maxDate backward a month due to UTC/local parsing", async () => {
    // Regression test: monthYearFromISODate previously parsed "YYYY-MM-DD"
    // via `new Date(iso)` (UTC midnight) and read it back with
    // `.getMonth()`/`.getFullYear()` (local time). In any negative-UTC-offset
    // timezone, a day-1 date like "2026-08-01" shifts backward to local
    // "Jul 31 2026 20:00"-ish, producing July instead of August. Day-15
    // fixture dates elsewhere in this file don't expose the bug because no
    // real-world offset is large enough to cross a month boundary from the
    // 15th.
    mockUseDbContext.mockReturnValue({
      ...READY_CONTEXT,
      initResult: {
        ...READY_CONTEXT.initResult,
        maxDate: "2026-08-01"
      }
    });
    renderWithProvider();

    await waitFor(() => {
      const inputs = screen.getAllByLabelText("Month and year");
      expect(inputs[1]).toHaveValue("08/2026");
    });
  });

  it("calls worker.queryHeatmap once the default range is set", async () => {
    mockUseDbContext.mockReturnValue(READY_CONTEXT);
    renderWithProvider();

    await waitFor(() => {
      expect(queryHeatmap).toHaveBeenCalled();
    });
    const [startISO, endISO] = queryHeatmap.mock.calls[0];
    expect(startISO).toMatch(/^\d{4}-\d{2}-01$/);
    expect(endISO).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
