import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import type { HeatRow } from "@/types/db";

vi.mock("@/hooks", () => ({
  useDbContext: vi.fn()
}));

vi.mock("@/components/map/DateRangePicker", () => ({
  DateRangePicker: (props: {
    sliderValues: number[];
    setSliderValue: (values: number[]) => void;
    commitSliderValues: (values: number[]) => void;
  }) => (
    <div
      data-testid="date-range-picker"
      data-slider-values={props.sliderValues.join(",")}
    />
  )
}));

vi.mock("@/components/map/HeatSlider", () => ({
  HeatSlider: (props: {
    values: number[];
    updateValues: (values: number[]) => void;
    commitValues: (values: number[]) => void;
  }) => <div data-testid="heat-slider" data-values={props.values.join(",")} />
}));

import { DashboardDateRange } from "@/components/map/DashboardDateRange";
import { useDbContext } from "@/hooks";

const mockUseDbContext = vi.mocked(useDbContext);

const sampleRows: HeatRow[] = [
  { hood_158: 77, lat: 43.7, lng: -79.4, count: 3, occ_date: "2024-01-01" },
  { hood_158: 77, lat: 43.71, lng: -79.41, count: 6, occ_date: "2025-06-01" }
];

function makeDefaultProps(overrides = {}) {
  return {
    sliderValues: [250, 750],
    setSliderValue: vi.fn(),
    committedSliderValues: [250, 750],
    commitSliderValues: vi.fn(),
    setRows: vi.fn(),
    setQueryRange: vi.fn(),
    ...overrides
  };
}

describe("DashboardDateRange — rendering", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDbContext.mockReturnValue({
      isReady: false,
      worker: null,
      progress: null,
      initResult: null,
      error: null,
      refresh: vi.fn()
    } as unknown as ReturnType<typeof useDbContext>);
  });

  it("applies the given className to the root", () => {
    const { container } = render(
      <DashboardDateRange {...makeDefaultProps()} className="my-class" />
    );
    expect(container.firstElementChild).toHaveClass("my-class");
  });

  it("renders the section heading", () => {
    render(<DashboardDateRange {...makeDefaultProps()} />);
    expect(screen.getByText("Date Range")).toBeInTheDocument();
  });

  it("passes sliderValues through to DateRangePicker and HeatSlider", () => {
    render(<DashboardDateRange {...makeDefaultProps()} />);
    expect(screen.getByTestId("date-range-picker")).toHaveAttribute(
      "data-slider-values",
      "250,750"
    );
    expect(screen.getByTestId("heat-slider")).toHaveAttribute(
      "data-values",
      "250,750"
    );
  });
});

describe("DashboardDateRange — DB query", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls queryHeatmap when isReady=true and worker present", async () => {
    const mockQueryHeatmap = vi.fn().mockResolvedValue(sampleRows);
    mockUseDbContext.mockReturnValue({
      isReady: true,
      worker: { queryHeatmap: mockQueryHeatmap } as unknown as ReturnType<
        typeof useDbContext
      >["worker"],
      progress: null,
      initResult: {
        status: "cached",
        recordCount: 1000,
        lastFetched: "2026-05-27T00:00:00.000Z",
        minDate: "2014-01-01",
        maxDate: "2026-11-30"
      },
      error: null,
      refresh: vi.fn()
    } as unknown as ReturnType<typeof useDbContext>);

    render(<DashboardDateRange {...makeDefaultProps()} />);

    await waitFor(() => expect(mockQueryHeatmap).toHaveBeenCalled());
    const [startISO, endISO] = mockQueryHeatmap.mock.calls[0];
    expect(startISO).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(endISO).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("calls setRows and setQueryRange together after query resolves", async () => {
    const mockQueryHeatmap = vi.fn().mockResolvedValue(sampleRows);
    mockUseDbContext.mockReturnValue({
      isReady: true,
      worker: { queryHeatmap: mockQueryHeatmap } as unknown as ReturnType<
        typeof useDbContext
      >["worker"],
      progress: null,
      initResult: {
        status: "cached",
        recordCount: 1000,
        lastFetched: null,
        minDate: "2014-01-01",
        maxDate: "2026-11-30"
      },
      error: null,
      refresh: vi.fn()
    } as unknown as ReturnType<typeof useDbContext>);

    const setRows = vi.fn();
    const setQueryRange = vi.fn();
    render(
      <DashboardDateRange {...makeDefaultProps({ setRows, setQueryRange })} />
    );

    await waitFor(() => expect(setRows).toHaveBeenCalledWith(sampleRows));
    expect(setQueryRange).toHaveBeenCalledTimes(1);
  });

  it("does not call queryHeatmap when isReady=false", async () => {
    const mockQueryHeatmap = vi.fn();
    mockUseDbContext.mockReturnValue({
      isReady: false,
      worker: null,
      progress: null,
      initResult: null,
      error: null,
      refresh: vi.fn()
    } as unknown as ReturnType<typeof useDbContext>);

    render(<DashboardDateRange {...makeDefaultProps()} />);
    await new Promise((r) => setTimeout(r, 50));
    expect(mockQueryHeatmap).not.toHaveBeenCalled();
  });

  it("does not throw when worker is null", () => {
    mockUseDbContext.mockReturnValue({
      isReady: true,
      worker: null,
      progress: null,
      initResult: null,
      error: null,
      refresh: vi.fn()
    } as unknown as ReturnType<typeof useDbContext>);

    expect(() =>
      render(<DashboardDateRange {...makeDefaultProps()} />)
    ).not.toThrow();
  });
});
