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
    it("keeps body content in DOM when closed (CSS collapse)", () => {
      render(
        <CollapsibleSection title="S" open={false} onToggle={vi.fn()}>
          <span>secret content</span>
        </CollapsibleSection>
      );
      expect(screen.getByText("secret content")).toBeInTheDocument();
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

  describe("collapse animation styles", () => {
    it("collapses grid row to 0fr when closed", () => {
      const { container } = render(
        <CollapsibleSection title="S" open={false} onToggle={vi.fn()}>
          <span>content</span>
        </CollapsibleSection>
      );
      const grid = container.querySelector<HTMLElement>(
        '[style*="grid-template-rows"]'
      );
      expect(grid).not.toBeNull();
      expect(grid!.style.gridTemplateRows).toBe("0fr");
    });

    it("expands grid row to 1fr when open", () => {
      const { container } = render(
        <CollapsibleSection title="S" open={true} onToggle={vi.fn()}>
          <span>content</span>
        </CollapsibleSection>
      );
      const grid = container.querySelector<HTMLElement>(
        '[style*="grid-template-rows"]'
      );
      expect(grid).not.toBeNull();
      expect(grid!.style.gridTemplateRows).toBe("1fr");
    });

    it("applies CSS transition to collapse wrapper", () => {
      const { container } = render(
        <CollapsibleSection title="S" open={false} onToggle={vi.fn()} />
      );
      const grid = container.querySelector<HTMLElement>(
        '[style*="grid-template-rows"]'
      );
      expect(grid!.style.transition).toContain("grid-template-rows");
    });

    it("inner wrapper has overflow hidden", () => {
      const { container } = render(
        <CollapsibleSection title="S" open={false} onToggle={vi.fn()}>
          <span>content</span>
        </CollapsibleSection>
      );
      const inner = container.querySelector<HTMLElement>(
        '[style*="overflow: hidden"]'
      );
      expect(inner).not.toBeNull();
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
