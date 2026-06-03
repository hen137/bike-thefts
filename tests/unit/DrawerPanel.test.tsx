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

vi.mock("@/components/map/WeightGraph", () => ({
  WeightGraph: ({
    mode,
    k,
    onKChange
  }: {
    mode: string;
    k: number;
    onKChange: (k: number) => void;
  }) => (
    <div data-testid="weight-graph" data-mode={mode} data-k={String(k)}>
      <button onClick={() => onKChange(0.5)}>change-k</button>
    </div>
  )
}));

import { DrawerPanel } from "@/components/map/DrawerPanel";

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  sliderValues: [250, 750],
  setSliderValue: vi.fn(),
  commitSliderValues: vi.fn(),
  byHood: false,
  setByHood: vi.fn(),
  timeWeighting: "None",
  setTimeWeighting: vi.fn(),
  weightKInv: 0.5,
  setWeightKInv: vi.fn(),
  weightKInvQuad: 0.25,
  setWeightKInvQuad: vi.fn()
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

    it("renders Reported Thefts section", () => {
      render(<DrawerPanel {...defaultProps} />);
      expect(screen.getByText("Reported Thefts")).toBeInTheDocument();
    });

    it("renders Predict Future Thefts section", () => {
      render(<DrawerPanel {...defaultProps} />);
      expect(screen.getByText("Predict Future Thefts")).toBeInTheDocument();
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

  describe("collapsible sections — accordion behaviour", () => {
    it("opens Reported Thefts by default", () => {
      render(<DrawerPanel {...defaultProps} />);
      expect(screen.getByText("Local Scaling")).toBeInTheDocument();
      expect(screen.getByText("Time Weighting")).toBeInTheDocument();
    });

    it("hides Predict Future Thefts body by default", () => {
      render(<DrawerPanel {...defaultProps} />);
      expect(screen.queryByText("Poisson")).not.toBeInTheDocument();
    });

    it("opens Predict Future Thefts and closes Reported Thefts on click", () => {
      render(<DrawerPanel {...defaultProps} />);
      fireEvent.click(
        screen.getByRole("button", { name: /Predict Future Thefts/i })
      );
      expect(screen.getByText("Poisson")).toBeInTheDocument();
      expect(screen.queryByText("Local Scaling")).not.toBeInTheDocument();
    });

    it("closes the open section when its header is clicked again", () => {
      render(<DrawerPanel {...defaultProps} />);
      fireEvent.click(screen.getByRole("button", { name: /Reported Thefts/i }));
      expect(screen.queryByText("Local Scaling")).not.toBeInTheDocument();
    });
  });

  describe("Local Scaling toggle — byHood wiring", () => {
    it("highlights Municipal when byHood=false", () => {
      render(<DrawerPanel {...defaultProps} byHood={false} />);
      expect(
        screen.getByRole("button", { name: "Municipal" }).className
      ).toContain("bg-slate-800");
    });

    it("highlights Neighbourhood when byHood=true", () => {
      render(<DrawerPanel {...defaultProps} byHood={true} />);
      expect(
        screen.getByRole("button", { name: "Neighbourhood" }).className
      ).toContain("bg-slate-800");
    });

    it("calls setByHood(true) when Neighbourhood clicked", () => {
      const setByHood = vi.fn();
      render(<DrawerPanel {...defaultProps} setByHood={setByHood} />);
      fireEvent.click(screen.getByRole("button", { name: "Neighbourhood" }));
      expect(setByHood).toHaveBeenCalledWith(true);
    });

    it("calls setByHood(false) when Municipal clicked", () => {
      const setByHood = vi.fn();
      render(
        <DrawerPanel {...defaultProps} byHood={true} setByHood={setByHood} />
      );
      fireEvent.click(screen.getByRole("button", { name: "Municipal" }));
      expect(setByHood).toHaveBeenCalledWith(false);
    });
  });

  describe("Time Weighting toggle — wiring", () => {
    it("highlights the option matching timeWeighting prop", () => {
      render(<DrawerPanel {...defaultProps} timeWeighting="Lin" />);
      expect(screen.getByRole("button", { name: "Lin" }).className).toContain(
        "bg-slate-800"
      );
    });

    it("calls setTimeWeighting with selected value", () => {
      const setTimeWeighting = vi.fn();
      render(
        <DrawerPanel {...defaultProps} setTimeWeighting={setTimeWeighting} />
      );
      fireEvent.click(screen.getByRole("button", { name: "Inv" }));
      expect(setTimeWeighting).toHaveBeenCalledWith("Inv");
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

  describe("WeightGraph integration", () => {
    it("passes weightKInv to WeightGraph when mode is Inv", () => {
      render(
        <DrawerPanel {...defaultProps} timeWeighting="Inv" weightKInv={0.8} />
      );
      const graph = screen.getByTestId("weight-graph");
      expect(graph.dataset.mode).toBe("Inv");
      expect(graph.dataset.k).toBe("0.8");
    });

    it("passes weightKInvQuad to WeightGraph when mode is InvQuad", () => {
      render(
        <DrawerPanel
          {...defaultProps}
          timeWeighting="InvQuad"
          weightKInvQuad={0.3}
        />
      );
      const graph = screen.getByTestId("weight-graph");
      expect(graph.dataset.mode).toBe("InvQuad");
      expect(graph.dataset.k).toBe("0.3");
    });

    it("calls setWeightKInv when Inv mode fires onKChange", () => {
      const setWeightKInv = vi.fn();
      render(
        <DrawerPanel
          {...defaultProps}
          timeWeighting="Inv"
          setWeightKInv={setWeightKInv}
        />
      );
      fireEvent.click(screen.getByRole("button", { name: "change-k" }));
      expect(setWeightKInv).toHaveBeenCalledWith(0.5);
    });

    it("calls setWeightKInvQuad when InvQuad mode fires onKChange", () => {
      const setWeightKInvQuad = vi.fn();
      render(
        <DrawerPanel
          {...defaultProps}
          timeWeighting="InvQuad"
          setWeightKInvQuad={setWeightKInvQuad}
        />
      );
      fireEvent.click(screen.getByRole("button", { name: "change-k" }));
      expect(setWeightKInvQuad).toHaveBeenCalledWith(0.5);
    });
  });
});
