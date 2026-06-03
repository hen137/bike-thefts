import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { ReactNode } from "react";

type MockProps = { children?: ReactNode };
type DrawerRootProps = {
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

vi.mock("@base-ui/react", () => ({
  Drawer: {
    Root: ({ children, open, onOpenChange }: DrawerRootProps) => (
      <div data-testid="drawer-root" data-open={String(open)}>
        <button onClick={() => onOpenChange?.(false)}>close</button>
        {children}
      </div>
    ),
    Portal: ({ children }: MockProps) => <>{children}</>,
    Viewport: ({ children }: MockProps) => <div>{children}</div>,
    Popup: ({ children }: MockProps) => <div>{children}</div>,
    Content: ({ children }: MockProps) => <div>{children}</div>,
    Title: ({ children }: MockProps) => <h2>{children}</h2>,
    Description: ({ children }: MockProps) => <p>{children}</p>
  }
}));

interface DateRangePickerProps {
  sliderValues: number[];
  setSliderValue: (values: number[]) => void;
  commitSliderValues: (values: number[]) => void;
}

vi.mock("@/components/map/DateRangePicker", () => ({
  DateRangePicker: ({
    sliderValues,
    setSliderValue,
    commitSliderValues
  }: DateRangePickerProps) => (
    <div data-testid="date-range-picker">
      <span data-testid="drp-values">{sliderValues.join(",")}</span>
      <button onClick={() => setSliderValue([10, 20])}>drp-set</button>
      <button onClick={() => commitSliderValues([10, 20])}>drp-commit</button>
    </div>
  )
}));

interface HeatSliderProps {
  values: number[];
  updateValues: (values: number[]) => void;
  commitValues: (values: number[]) => void;
}

vi.mock("@/components/map/HeatSlider", () => ({
  HeatSlider: ({ values, updateValues, commitValues }: HeatSliderProps) => (
    <div data-testid="heat-slider">
      <span data-testid="hs-values">{values.join(",")}</span>
      <button onClick={() => updateValues([30, 40])}>hs-update</button>
      <button onClick={() => commitValues([30, 40])}>hs-commit</button>
    </div>
  )
}));

import { DrawerPanel } from "@/components/map/DrawerPanel";

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  sliderValues: [250, 750],
  setSliderValue: vi.fn(),
  commitSliderValues: vi.fn()
};

describe("DrawerPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without throwing", () => {
    expect(() => render(<DrawerPanel {...defaultProps} />)).not.toThrow();
  });

  describe("static content", () => {
    it("renders the panel title", () => {
      render(<DrawerPanel {...defaultProps} />);
      expect(screen.getByText("Toronto Bike Thefts")).toBeInTheDocument();
    });

    it("renders Modes section", () => {
      render(<DrawerPanel {...defaultProps} />);
      expect(screen.getByText("Modes")).toBeInTheDocument();
    });

    it("renders footer About link", () => {
      render(<DrawerPanel {...defaultProps} />);
      const link = screen.getByText("About");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/about");
    });

    it("renders footer Contribute and Github links", () => {
      render(<DrawerPanel {...defaultProps} />);
      const contribute = screen.getByText("Contribute");
      expect(contribute).toHaveAttribute("href", "/contribute");
      const github = screen.getByText("Github");
      expect(github).toHaveAttribute(
        "href",
        "https://github.com/hen137/bike-thefts"
      );
    });
  });

  describe("Drawer open state", () => {
    it("passes open=true to Drawer.Root", () => {
      render(<DrawerPanel {...defaultProps} open={true} />);
      expect(screen.getByTestId("drawer-root")).toHaveAttribute(
        "data-open",
        "true"
      );
    });

    it("passes open=false to Drawer.Root", () => {
      render(<DrawerPanel {...defaultProps} open={false} />);
      expect(screen.getByTestId("drawer-root")).toHaveAttribute(
        "data-open",
        "false"
      );
    });

    it("calls onOpenChange when Drawer requests close", () => {
      const onOpenChange = vi.fn();
      render(<DrawerPanel {...defaultProps} onOpenChange={onOpenChange} />);
      fireEvent.click(screen.getByText("close"));
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe("DateRangePicker integration", () => {
    it("renders DateRangePicker", () => {
      render(<DrawerPanel {...defaultProps} />);
      expect(screen.getByTestId("date-range-picker")).toBeInTheDocument();
    });

    it("passes sliderValues to DateRangePicker", () => {
      render(<DrawerPanel {...defaultProps} sliderValues={[100, 900]} />);
      expect(screen.getByTestId("drp-values")).toHaveTextContent("100,900");
    });

    it("wires setSliderValue through DateRangePicker", () => {
      const setSliderValue = vi.fn();
      render(<DrawerPanel {...defaultProps} setSliderValue={setSliderValue} />);
      fireEvent.click(screen.getByText("drp-set"));
      expect(setSliderValue).toHaveBeenCalledWith([10, 20]);
    });

    it("wires commitSliderValues through DateRangePicker", () => {
      const commitSliderValues = vi.fn();
      render(
        <DrawerPanel
          {...defaultProps}
          commitSliderValues={commitSliderValues}
        />
      );
      fireEvent.click(screen.getByText("drp-commit"));
      expect(commitSliderValues).toHaveBeenCalledWith([10, 20]);
    });
  });

  describe("HeatSlider integration", () => {
    it("renders HeatSlider", () => {
      render(<DrawerPanel {...defaultProps} />);
      expect(screen.getByTestId("heat-slider")).toBeInTheDocument();
    });

    it("passes sliderValues as values to HeatSlider", () => {
      render(<DrawerPanel {...defaultProps} sliderValues={[200, 800]} />);
      expect(screen.getByTestId("hs-values")).toHaveTextContent("200,800");
    });

    it("wires setSliderValue as updateValues through HeatSlider", () => {
      const setSliderValue = vi.fn();
      render(<DrawerPanel {...defaultProps} setSliderValue={setSliderValue} />);
      fireEvent.click(screen.getByText("hs-update"));
      expect(setSliderValue).toHaveBeenCalledWith([30, 40]);
    });

    it("wires commitSliderValues as commitValues through HeatSlider", () => {
      const commitSliderValues = vi.fn();
      render(
        <DrawerPanel
          {...defaultProps}
          commitSliderValues={commitSliderValues}
        />
      );
      fireEvent.click(screen.getByText("hs-commit"));
      expect(commitSliderValues).toHaveBeenCalledWith([30, 40]);
    });
  });
});
