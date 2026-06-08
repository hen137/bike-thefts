import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CollapsibleSection } from "@/components/map/CollapsibleSection";

describe("CollapsibleSection", () => {
  it("renders title", () => {
    render(
      <CollapsibleSection title="Settings" open={false} onToggle={vi.fn()} />
    );
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  describe("body visibility", () => {
    it("removes body content from DOM when closed", () => {
      render(
        <CollapsibleSection title="S" open={false} onToggle={vi.fn()}>
          <span>secret content</span>
        </CollapsibleSection>
      );
      expect(screen.queryByText("secret content")).not.toBeInTheDocument();
    });

    it("shows body content when open", () => {
      render(
        <CollapsibleSection title="S" open={true} onToggle={vi.fn()}>
          <span>visible content</span>
        </CollapsibleSection>
      );
      expect(screen.getByText("visible content")).toBeInTheDocument();
    });
  });

  describe("toggle interaction", () => {
    it("calls onToggle when header button clicked", () => {
      const onToggle = vi.fn();
      render(
        <CollapsibleSection title="Settings" open={false} onToggle={onToggle} />
      );
      fireEvent.click(screen.getByRole("button", { name: /Settings/i }));
      expect(onToggle).toHaveBeenCalledOnce();
    });

    it("does not call onToggle when body content clicked", () => {
      const onToggle = vi.fn();
      render(
        <CollapsibleSection title="S" open={true} onToggle={onToggle}>
          <button>inner button</button>
        </CollapsibleSection>
      );
      fireEvent.click(screen.getByRole("button", { name: "inner button" }));
      expect(onToggle).not.toHaveBeenCalled();
    });
  });

  describe("accessibility", () => {
    it("sets aria-expanded=false when closed", () => {
      render(<CollapsibleSection title="S" open={false} onToggle={vi.fn()} />);
      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-expanded",
        "false"
      );
    });

    it("sets aria-expanded=true when open", () => {
      render(<CollapsibleSection title="S" open={true} onToggle={vi.fn()} />);
      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-expanded",
        "true"
      );
    });
  });
});
