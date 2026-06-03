import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { ReactNode } from "react";

type SliderProps = {
  onValueChange?: (vals: number[]) => void;
  onValueCommit?: (vals: number[]) => void;
  max?: number;
  children?: ReactNode;
};

vi.mock("@/components/ui", () => ({
  Slider: ({ onValueChange, onValueCommit, max, children }: SliderProps) => (
    <div>
      <output data-testid="slider-max">{max}</output>
      <button onClick={() => onValueChange?.([100, 900])}>change</button>
      <button onClick={() => onValueCommit?.([100, 900])}>commit</button>
      {children}
    </div>
  ),
  SliderTrack: ({ children }: { children?: ReactNode }) => (
    <div>{children}</div>
  ),
  SliderRange: () => null,
  SliderThumb: () => <span data-testid="thumb" />
}));

import { HeatSlider } from "@/components/map/HeatSlider";

const defaultProps = {
  initialValues: [250, 750],
  updateValues: vi.fn(),
  commitValues: vi.fn()
};

describe("HeatSlider", () => {
  it("renders without throwing", () => {
    expect(() => render(<HeatSlider {...defaultProps} />)).not.toThrow();
  });

  it("renders two thumb elements", () => {
    render(<HeatSlider {...defaultProps} />);
    expect(screen.getAllByTestId("thumb")).toHaveLength(2);
  });

  it("passes max=1000 to Slider", () => {
    render(<HeatSlider {...defaultProps} />);
    expect(screen.getByTestId("slider-max")).toHaveTextContent("1000");
  });

  it("calls updateValues with new values on change", () => {
    const updateValues = vi.fn();
    render(<HeatSlider {...defaultProps} updateValues={updateValues} />);
    fireEvent.click(screen.getByText("change"));
    expect(updateValues).toHaveBeenCalledWith([100, 900]);
  });

  it("calls commitValues with new values on commit", () => {
    const commitValues = vi.fn();
    render(<HeatSlider {...defaultProps} commitValues={commitValues} />);
    fireEvent.click(screen.getByText("commit"));
    expect(commitValues).toHaveBeenCalledWith([100, 900]);
  });

  it("does not call commitValues before a commit event", () => {
    const commitValues = vi.fn();
    render(<HeatSlider {...defaultProps} commitValues={commitValues} />);
    expect(commitValues).not.toHaveBeenCalled();
  });
});
