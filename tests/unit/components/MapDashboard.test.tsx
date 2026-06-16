import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/components/map/DashboardDateRange", () => ({
  DashboardDateRange: (props: { sliderValues: number[] }) => (
    <div
      data-testid="dashboard-date-range"
      data-slider-values={props.sliderValues.join(",")}
    />
  )
}));
vi.mock("@/components/map/DashboardToggle", () => ({
  DashboardToggle: () => <div data-testid="dashboard-toggle" />
}));
vi.mock("@/components/map/DashboardVisualizationMode", () => ({
  DashboardVisualizationMode: () => (
    <div data-testid="dashboard-visualization-mode" />
  )
}));
vi.mock("@/components/map/HeatLegend", () => ({
  HeatLegend: () => <div data-testid="heat-legend" />
}));
vi.mock("@/components/map/MapTools", () => ({
  MapTools: () => <div data-testid="map-tools" />
}));
vi.mock("@/components/map/DashboardTileSwitcher", () => ({
  DashboardTileSwitcher: () => <div data-testid="dashboard-tile-switcher" />
}));

import { MapDashboard } from "@/components/map/MapDashboard";

const defaultProps = {
  sliderValues: [250, 750],
  setSliderValue: vi.fn(),
  commitSliderValues: vi.fn(),
  byHood: true,
  setByHood: vi.fn(),
  timeWeighting: "None",
  setTimeWeighting: vi.fn(),
  weightKInv: 0.5,
  setWeightKInv: vi.fn(),
  weightKInvQuad: 0.25,
  setWeightKInvQuad: vi.fn(),
  weightFlipped: false,
  onWeightFlipToggle: vi.fn(),
  poissonIndex: 0,
  setPoissonIndex: vi.fn()
};

describe("MapDashboard", () => {
  it("renders the dashboard toggle, tools, visualization mode, legend, and date range", () => {
    render(<MapDashboard {...defaultProps} />);
    expect(screen.getByTestId("dashboard-toggle")).toBeInTheDocument();
    expect(screen.getByTestId("map-tools")).toBeInTheDocument();
    expect(
      screen.getByTestId("dashboard-visualization-mode")
    ).toBeInTheDocument();
    expect(screen.getByTestId("heat-legend")).toBeInTheDocument();
    expect(screen.getByTestId("dashboard-tile-switcher")).toBeInTheDocument();
    expect(screen.getByTestId("dashboard-date-range")).toBeInTheDocument();
  });

  it("passes sliderValues through to DashboardDateRange", () => {
    render(<MapDashboard {...defaultProps} />);
    expect(screen.getByTestId("dashboard-date-range")).toHaveAttribute(
      "data-slider-values",
      "250,750"
    );
  });
});
