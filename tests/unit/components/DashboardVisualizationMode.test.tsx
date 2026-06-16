import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { HeatRow } from "@/types/db";

vi.mock("@/hooks", () => ({
  useLeafletHeatLayer: vi.fn()
}));

import { DashboardVisualizationMode } from "@/components/map/DashboardVisualizationMode";
import { useLeafletHeatLayer } from "@/hooks";

const mockUseLeafletHeatLayer = vi.mocked(useLeafletHeatLayer);

const sampleRows: HeatRow[] = [
  { hood_158: 77, lat: 43.7, lng: -79.4, count: 3, occ_date: "2024-01-01" },
  { hood_158: 77, lat: 43.71, lng: -79.41, count: 6, occ_date: "2025-06-01" }
];

const sampleQueryRange = {
  start: { month: 0, year: 2024 },
  end: { month: 5, year: 2025 }
};

function makeDefaultProps(overrides = {}) {
  return {
    byHood: true,
    setByHood: vi.fn(),
    rows: [],
    queryRange: null,
    timeWeighting: "None",
    setTimeWeighting: vi.fn(),
    weightKInv: 0.5,
    setWeightKInv: vi.fn(),
    weightKInvQuad: 0.25,
    setWeightKInvQuad: vi.fn(),
    weightFlipped: false,
    onWeightFlipToggle: vi.fn(),
    poissonIndex: 0,
    setPoissonIndex: vi.fn(),
    ...overrides
  };
}

describe("DashboardVisualizationMode — rendering", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLeafletHeatLayer.mockReturnValue({
      setHeatValues: vi.fn()
    } as unknown as ReturnType<typeof useLeafletHeatLayer>);
  });

  it("applies the given className to the root", () => {
    const { container } = render(
      <DashboardVisualizationMode
        className="my-class"
        {...makeDefaultProps()}
      />
    );
    expect(container.firstElementChild).toHaveClass("my-class");
  });

  it("defaults to showing Reported Thefts as the selected mode", () => {
    render(<DashboardVisualizationMode {...makeDefaultProps()} />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Reported Thefts");
  });

  it("defaults to Reported Thefts controls", () => {
    render(<DashboardVisualizationMode {...makeDefaultProps()} />);
    expect(screen.getByText("Reported Thefts")).toBeInTheDocument();
    expect(screen.getByText("Local Scaling")).toBeInTheDocument();
    expect(screen.getByText("Time Weighting")).toBeInTheDocument();
  });

  it("switches to Predict Thefts controls when selected", async () => {
    render(<DashboardVisualizationMode {...makeDefaultProps()} />);

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(
      await screen.findByRole("option", { name: "Predict Thefts" })
    );

    expect(screen.getByText("Poisson")).toBeInTheDocument();
    expect(screen.queryByText("Local Scaling")).not.toBeInTheDocument();
  });
});

describe("DashboardVisualizationMode — recompute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls setHeatValues when rows and queryRange are provided", async () => {
    const setHeatValues = vi.fn();
    mockUseLeafletHeatLayer.mockReturnValue({
      setHeatValues
    } as unknown as ReturnType<typeof useLeafletHeatLayer>);

    render(
      <DashboardVisualizationMode
        {...makeDefaultProps({
          rows: sampleRows,
          queryRange: sampleQueryRange
        })}
      />
    );

    await waitFor(() => expect(setHeatValues).toHaveBeenCalled());
    const values = setHeatValues.mock.calls[0][0];
    expect(values).toHaveLength(sampleRows.length);
    values.forEach((tuple: number[]) => expect(tuple).toHaveLength(3));
  });

  it("does not call setHeatValues when queryRange is null", async () => {
    const setHeatValues = vi.fn();
    mockUseLeafletHeatLayer.mockReturnValue({
      setHeatValues
    } as unknown as ReturnType<typeof useLeafletHeatLayer>);

    render(
      <DashboardVisualizationMode
        {...makeDefaultProps({ rows: sampleRows, queryRange: null })}
      />
    );

    await new Promise((r) => setTimeout(r, 50));
    expect(setHeatValues).not.toHaveBeenCalled();
  });

  it("recomputes without re-querying when byHood changes", async () => {
    const setHeatValues = vi.fn();
    mockUseLeafletHeatLayer.mockReturnValue({
      setHeatValues
    } as unknown as ReturnType<typeof useLeafletHeatLayer>);

    const { rerender } = render(
      <DashboardVisualizationMode
        {...makeDefaultProps({
          rows: sampleRows,
          queryRange: sampleQueryRange,
          byHood: false
        })}
      />
    );

    await waitFor(() => expect(setHeatValues).toHaveBeenCalledTimes(1));

    rerender(
      <DashboardVisualizationMode
        {...makeDefaultProps({
          rows: sampleRows,
          queryRange: sampleQueryRange,
          byHood: true
        })}
      />
    );

    await waitFor(() => expect(setHeatValues).toHaveBeenCalledTimes(2));
  });
});
