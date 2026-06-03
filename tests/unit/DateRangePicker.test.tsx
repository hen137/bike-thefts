import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { ReactNode } from "react";

vi.mock("@/hooks", () => ({
  useDbContext: vi.fn()
}));

type MockProps = { children?: ReactNode };

// Render Popup unconditionally so the month grid is always queryable
vi.mock("@base-ui/react", () => ({
  Popover: {
    Root: ({ children }: MockProps) => <>{children}</>,
    Trigger: ({ children }: MockProps) => <button>{children}</button>,
    Portal: ({ children }: MockProps) => <>{children}</>,
    Positioner: ({ children }: MockProps) => <div>{children}</div>,
    Popup: ({ children }: MockProps) => <div>{children}</div>
  }
}));

import { DateRangePicker } from "@/components/map/DateRangePicker";
import { useDbContext } from "@/hooks";

const mockUseDbContext = vi.mocked(useDbContext);

// minDate = Apr 15 2020 → month 3, year 2020
// maxDate = Aug 15 2026 → month 7, year 2026
// totalMonths = (2026-2020)*12 + (7-3) = 76
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
  worker: null,
  refresh: vi.fn()
};

// sliderValues=[0,1000] maps to startDate="04/2020", endDate="08/2026"
const FULL_RANGE: [number, number] = [0, 1000];

const defaultProps = {
  sliderValues: FULL_RANGE,
  setSliderValue: vi.fn(),
  commitSliderValues: vi.fn()
};

describe("DateRangePicker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loading state", () => {
    it("shows placeholder dashes when not ready", () => {
      mockUseDbContext.mockReturnValue({ ...READY_CONTEXT, isReady: false });
      render(<DateRangePicker {...defaultProps} />);
      expect(screen.getAllByText("—")).toHaveLength(2);
    });

    it("shows placeholder dashes when initResult is null", () => {
      mockUseDbContext.mockReturnValue({ ...READY_CONTEXT, initResult: null });
      render(<DateRangePicker {...defaultProps} />);
      expect(screen.getAllByText("—")).toHaveLength(2);
    });
  });

  describe("display", () => {
    it("shows formatted start and end dates derived from sliderValues", () => {
      mockUseDbContext.mockReturnValue(READY_CONTEXT);
      render(<DateRangePicker {...defaultProps} />);
      const inputs = screen.getAllByLabelText("Month and year");
      expect(inputs[0]).toHaveValue("04/2020");
      expect(inputs[1]).toHaveValue("08/2026");
    });

    it("renders 12 month buttons per picker (24 total)", () => {
      mockUseDbContext.mockReturnValue(READY_CONTEXT);
      render(<DateRangePicker {...defaultProps} />);
      // Both pickers render their grids — 2 of each month label
      expect(screen.getAllByText("Jan")).toHaveLength(2);
      expect(screen.getAllByText("Dec")).toHaveLength(2);
    });
  });

  describe("text input", () => {
    it("calls setSliderValue and commitSliderValues on valid MM/YYYY blur", () => {
      mockUseDbContext.mockReturnValue(READY_CONTEXT);
      const setSliderValue = vi.fn();
      const commitSliderValues = vi.fn();
      render(
        <DateRangePicker
          sliderValues={FULL_RANGE}
          setSliderValue={setSliderValue}
          commitSliderValues={commitSliderValues}
        />
      );
      const [startInput] = screen.getAllByLabelText("Month and year");
      // Jun 2022: targetMonths=(2022-2020)*12+(5-3)=26 → round(26/76*1000)=342
      fireEvent.change(startInput, { target: { value: "06/2022" } });
      fireEvent.blur(startInput);
      expect(setSliderValue).toHaveBeenCalledWith([342, 1000]);
      expect(commitSliderValues).toHaveBeenCalledWith([342, 1000]);
    });

    it("accepts Mon YYYY format", () => {
      mockUseDbContext.mockReturnValue(READY_CONTEXT);
      const setSliderValue = vi.fn();
      render(
        <DateRangePicker
          sliderValues={FULL_RANGE}
          setSliderValue={setSliderValue}
          commitSliderValues={vi.fn()}
        />
      );
      const [startInput] = screen.getAllByLabelText("Month and year");
      fireEvent.change(startInput, { target: { value: "Jun 2022" } });
      fireEvent.blur(startInput);
      expect(setSliderValue).toHaveBeenCalledWith([342, 1000]);
    });

    it("resets to current value on unparseable input", () => {
      mockUseDbContext.mockReturnValue(READY_CONTEXT);
      const setSliderValue = vi.fn();
      render(
        <DateRangePicker
          sliderValues={FULL_RANGE}
          setSliderValue={setSliderValue}
          commitSliderValues={vi.fn()}
        />
      );
      const [startInput] = screen.getAllByLabelText("Month and year");
      fireEvent.change(startInput, { target: { value: "garbage" } });
      fireEvent.blur(startInput);
      expect(setSliderValue).not.toHaveBeenCalled();
      expect(startInput).toHaveValue("04/2020");
    });

    it("commits on Enter key", () => {
      mockUseDbContext.mockReturnValue(READY_CONTEXT);
      const commitSliderValues = vi.fn();
      render(
        <DateRangePicker
          sliderValues={FULL_RANGE}
          setSliderValue={vi.fn()}
          commitSliderValues={commitSliderValues}
        />
      );
      const [startInput] = screen.getAllByLabelText("Month and year");
      fireEvent.change(startInput, { target: { value: "06/2022" } });
      fireEvent.keyDown(startInput, { key: "Enter" });
      expect(commitSliderValues).toHaveBeenCalledWith([342, 1000]);
    });
  });

  describe("bound clamping", () => {
    it("clamps start date to min when typed date is before min", () => {
      mockUseDbContext.mockReturnValue(READY_CONTEXT);
      const setSliderValue = vi.fn();
      const commitSliderValues = vi.fn();
      render(
        <DateRangePicker
          sliderValues={FULL_RANGE}
          setSliderValue={setSliderValue}
          commitSliderValues={commitSliderValues}
        />
      );
      const [startInput] = screen.getAllByLabelText("Month and year");
      // Jan 2019 is before min Apr 2020 → clamp to min → slider val 0
      fireEvent.change(startInput, { target: { value: "01/2019" } });
      fireEvent.blur(startInput);
      expect(setSliderValue).toHaveBeenCalledWith([0, 1000]);
      expect(commitSliderValues).toHaveBeenCalledWith([0, 1000]);
    });

    it("clamps end date to max when typed date is after max", () => {
      mockUseDbContext.mockReturnValue(READY_CONTEXT);
      const setSliderValue = vi.fn();
      const commitSliderValues = vi.fn();
      render(
        <DateRangePicker
          sliderValues={FULL_RANGE}
          setSliderValue={setSliderValue}
          commitSliderValues={commitSliderValues}
        />
      );
      const inputs = screen.getAllByLabelText("Month and year");
      // Dec 2030 is after max Aug 2026 → clamp to max → slider val 1000
      fireEvent.change(inputs[1], { target: { value: "12/2030" } });
      fireEvent.blur(inputs[1]);
      expect(setSliderValue).toHaveBeenCalledWith([0, 1000]);
      expect(commitSliderValues).toHaveBeenCalledWith([0, 1000]);
    });
  });

  describe("month grid", () => {
    it("calls setSliderValue and commitSliderValues when a month is clicked", () => {
      mockUseDbContext.mockReturnValue(READY_CONTEXT);
      const setSliderValue = vi.fn();
      const commitSliderValues = vi.fn();
      render(
        <DateRangePicker
          sliderValues={FULL_RANGE}
          setSliderValue={setSliderValue}
          commitSliderValues={commitSliderValues}
        />
      );
      // getAllByText('Jun')[0] → start picker's Jun at navYear 2020
      // {month:5,year:2020}: targetMonths=(2020-2020)*12+(5-3)=2 → round(2/76*1000)=26
      fireEvent.click(screen.getAllByText("Jun")[0]);
      expect(setSliderValue).toHaveBeenCalledWith([26, 1000]);
      expect(commitSliderValues).toHaveBeenCalledWith([26, 1000]);
    });
  });
});
