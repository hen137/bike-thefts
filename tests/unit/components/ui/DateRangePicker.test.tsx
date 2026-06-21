import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { ReactNode } from "react";

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

import {
  DateRangePicker,
  DateRangePlaceholder
} from "@/components/ui/DateRangePicker";

const MIN = { month: 3, year: 2020 }; // Apr 2020
const MAX = { month: 7, year: 2026 }; // Aug 2026

function baseProps() {
  return {
    startDate: { month: 3, year: 2020 },
    endDate: { month: 7, year: 2026 },
    onStartChange: vi.fn(),
    onEndChange: vi.fn(),
    minDate: MIN,
    maxDate: MAX
  };
}

describe("DateRangePicker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("display", () => {
    it("shows formatted start and end dates from props", () => {
      render(<DateRangePicker {...baseProps()} />);
      const inputs = screen.getAllByLabelText("Month and year");
      expect(inputs[0]).toHaveValue("04/2020");
      expect(inputs[1]).toHaveValue("08/2026");
    });

    it("renders 12 month buttons per picker (24 total)", () => {
      render(<DateRangePicker {...baseProps()} />);
      expect(screen.getAllByText("Jan")).toHaveLength(2);
      expect(screen.getAllByText("Dec")).toHaveLength(2);
    });
  });

  describe("text input", () => {
    it("calls onStartChange on valid MM/YYYY blur", () => {
      const props = baseProps();
      render(<DateRangePicker {...props} />);
      const [startInput] = screen.getAllByLabelText("Month and year");
      fireEvent.change(startInput, { target: { value: "06/2022" } });
      fireEvent.blur(startInput);
      expect(props.onStartChange).toHaveBeenCalledWith({
        month: 5,
        year: 2022
      });
    });

    it("calls onEndChange on valid MM/YYYY blur", () => {
      const props = baseProps();
      render(<DateRangePicker {...props} />);
      const inputs = screen.getAllByLabelText("Month and year");
      fireEvent.change(inputs[1], { target: { value: "01/2025" } });
      fireEvent.blur(inputs[1]);
      expect(props.onEndChange).toHaveBeenCalledWith({
        month: 0,
        year: 2025
      });
    });

    it("accepts Mon YYYY format", () => {
      const props = baseProps();
      render(<DateRangePicker {...props} />);
      const [startInput] = screen.getAllByLabelText("Month and year");
      fireEvent.change(startInput, { target: { value: "Jun 2022" } });
      fireEvent.blur(startInput);
      expect(props.onStartChange).toHaveBeenCalledWith({
        month: 5,
        year: 2022
      });
    });

    it("resets to current value on unparseable input without calling onChange", () => {
      const props = baseProps();
      render(<DateRangePicker {...props} />);
      const [startInput] = screen.getAllByLabelText("Month and year");
      fireEvent.change(startInput, { target: { value: "garbage" } });
      fireEvent.blur(startInput);
      expect(props.onStartChange).not.toHaveBeenCalled();
      expect(startInput).toHaveValue("04/2020");
    });

    it("commits on Enter key", () => {
      const props = baseProps();
      render(<DateRangePicker {...props} />);
      const [startInput] = screen.getAllByLabelText("Month and year");
      fireEvent.change(startInput, { target: { value: "06/2022" } });
      fireEvent.keyDown(startInput, { key: "Enter" });
      expect(props.onStartChange).toHaveBeenCalledWith({
        month: 5,
        year: 2022
      });
    });
  });

  describe("bound clamping", () => {
    it("clamps start date to minDate when typed date is before min", () => {
      const props = baseProps();
      render(<DateRangePicker {...props} />);
      const [startInput] = screen.getAllByLabelText("Month and year");
      fireEvent.change(startInput, { target: { value: "01/2019" } });
      fireEvent.blur(startInput);
      expect(props.onStartChange).toHaveBeenCalledWith(MIN);
    });

    it("clamps end date to maxDate when typed date is after max", () => {
      const props = baseProps();
      render(<DateRangePicker {...props} />);
      const inputs = screen.getAllByLabelText("Month and year");
      fireEvent.change(inputs[1], { target: { value: "12/2030" } });
      fireEvent.blur(inputs[1]);
      expect(props.onEndChange).toHaveBeenCalledWith(MAX);
    });
  });

  describe("month grid", () => {
    it("calls onStartChange when a month is clicked in the start picker", () => {
      const props = baseProps();
      render(<DateRangePicker {...props} />);
      // getAllByText('Jun')[0] → start picker's Jun at navYear 2020
      fireEvent.click(screen.getAllByText("Jun")[0]);
      expect(props.onStartChange).toHaveBeenCalledWith({
        month: 5,
        year: 2020
      });
    });
  });

  describe("DateRangePlaceholder", () => {
    it("renders dash placeholders with no interactive controls", () => {
      render(<DateRangePlaceholder />);
      expect(screen.getAllByText("-")).toHaveLength(2);
      expect(screen.queryAllByRole("button")).toHaveLength(0);
    });
  });
});
