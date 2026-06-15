import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

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

const defaultProps = {
  sliderValues: [250, 750],
  setSliderValue: vi.fn(),
  commitSliderValues: vi.fn()
};

describe("DashboardDateRange", () => {
  it("applies the given className to the root", () => {
    const { container } = render(
      <DashboardDateRange {...defaultProps} className="my-class" />
    );
    expect(container.firstElementChild).toHaveClass("my-class");
  });

  it("renders the section heading", () => {
    render(<DashboardDateRange {...defaultProps} />);
    expect(screen.getByText("Date Range")).toBeInTheDocument();
  });

  it("passes sliderValues through to DateRangePicker and HeatSlider", () => {
    render(<DashboardDateRange {...defaultProps} />);
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
