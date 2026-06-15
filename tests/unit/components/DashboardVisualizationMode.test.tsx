import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DashboardVisualizationMode } from "@/components/map/DashboardVisualizationMode";

const defaultProps = {
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

describe("DashboardVisualizationMode", () => {
  it("applies the given className to the root", () => {
    const { container } = render(
      <DashboardVisualizationMode className="my-class" {...defaultProps} />
    );
    expect(container.firstElementChild).toHaveClass("my-class");
  });

  it("defaults to showing Reported Thefts as the selected mode", () => {
    render(<DashboardVisualizationMode {...defaultProps} />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Reported Thefts");
  });

  it("defaults to Reported Thefts controls", () => {
    render(<DashboardVisualizationMode {...defaultProps} />);
    expect(screen.getByText("Reported Thefts")).toBeInTheDocument();
    expect(screen.getByText("Local Scaling")).toBeInTheDocument();
    expect(screen.getByText("Time Weighting")).toBeInTheDocument();
  });

  it("switches to Predict Thefts controls when selected", async () => {
    render(<DashboardVisualizationMode {...defaultProps} />);

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(
      await screen.findByRole("option", { name: "Predict Thefts" })
    );

    expect(screen.getByText("Poisson")).toBeInTheDocument();
    expect(screen.queryByText("Local Scaling")).not.toBeInTheDocument();
  });
});
