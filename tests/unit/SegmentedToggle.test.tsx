import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SegmentedToggle } from "@/components/map/SegmentedToggle";

describe("SegmentedToggle", () => {
  it("renders all option labels", () => {
    render(<SegmentedToggle options={["Alpha", "Beta", "Gamma"]} />);
    expect(screen.getByRole("button", { name: "Alpha" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Beta" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Gamma" })).toBeInTheDocument();
  });

  describe("active state", () => {
    it("highlights the option at activeIndex", () => {
      render(<SegmentedToggle options={["A", "B"]} activeIndex={1} />);
      expect(screen.getByRole("button", { name: "B" }).className).toContain(
        "bg-slate-800"
      );
    });

    it("does not highlight inactive options", () => {
      render(<SegmentedToggle options={["A", "B"]} activeIndex={0} />);
      expect(screen.getByRole("button", { name: "B" }).className).not.toContain(
        "bg-slate-800"
      );
    });

    it("defaults activeIndex to 0", () => {
      render(<SegmentedToggle options={["X", "Y"]} />);
      expect(screen.getByRole("button", { name: "X" }).className).toContain(
        "bg-slate-800"
      );
    });
  });

  describe("onChange", () => {
    it("calls onChange with value and index when option clicked", () => {
      const onChange = vi.fn();
      render(
        <SegmentedToggle
          options={["A", "B", "C"]}
          activeIndex={0}
          onChange={onChange}
        />
      );
      fireEvent.click(screen.getByRole("button", { name: "C" }));
      expect(onChange).toHaveBeenCalledWith("C", 2);
    });

    it("calls onChange even when clicking the already-active option", () => {
      const onChange = vi.fn();
      render(
        <SegmentedToggle
          options={["A", "B"]}
          activeIndex={0}
          onChange={onChange}
        />
      );
      fireEvent.click(screen.getByRole("button", { name: "A" }));
      expect(onChange).toHaveBeenCalledWith("A", 0);
    });

    it("does not throw when onChange is omitted", () => {
      render(<SegmentedToggle options={["A", "B"]} />);
      expect(() =>
        fireEvent.click(screen.getByRole("button", { name: "B" }))
      ).not.toThrow();
    });
  });
});
