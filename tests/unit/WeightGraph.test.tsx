import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { WeightGraph } from "@/components/map/WeightGraph";

// jsdom doesn't implement setPointerCapture — stub it
beforeAll(() => {
  SVGElement.prototype.setPointerCapture = vi.fn();
  SVGElement.prototype.releasePointerCapture = vi.fn();
});

const noop = () => {};

describe("WeightGraph", () => {
  describe("visibility", () => {
    it("is collapsed (gridTemplateRows 0fr) when mode is None", () => {
      const { container } = render(
        <WeightGraph mode="None" k={1} onKChange={noop} />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.gridTemplateRows).toBe("0fr");
    });

    it("is visible when mode is Lin", () => {
      const { container } = render(
        <WeightGraph mode="Lin" k={1} onKChange={noop} />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.gridTemplateRows).toBe("1fr");
    });

    it("is visible when mode is Inv", () => {
      const { container } = render(
        <WeightGraph mode="Inv" k={1} onKChange={noop} />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.gridTemplateRows).toBe("1fr");
    });

    it("is visible when mode is InvQuad", () => {
      const { container } = render(
        <WeightGraph mode="InvQuad" k={1} onKChange={noop} />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.gridTemplateRows).toBe("1fr");
    });
  });

  describe("SVG rendering", () => {
    it("renders an SVG element", () => {
      const { container } = render(
        <WeightGraph mode="Inv" k={1} onKChange={noop} />
      );
      expect(container.querySelector("svg")).toBeTruthy();
    });

    it("renders axis labels 'weight', '1' and '0'", () => {
      const { container } = render(
        <WeightGraph mode="Inv" k={1} onKChange={noop} />
      );
      const texts = Array.from(container.querySelectorAll("text")).map(
        (el) => el.textContent
      );
      expect(texts).toContain("weight");
      expect(texts).toContain("1");
      expect(texts).toContain("0");
    });

    it("renders a curve path when mode is not None", () => {
      const { container } = render(
        <WeightGraph mode="Lin" k={1} onKChange={noop} />
      );
      const paths = container.querySelectorAll("path");
      const curvePath = Array.from(paths).find(
        (p) => p.getAttribute("fill") === "none"
      );
      expect(curvePath).toBeTruthy();
      expect(curvePath!.getAttribute("d")).toBeTruthy();
    });
  });

  describe("handle", () => {
    it("renders a drag handle for Inv mode", () => {
      const { container } = render(
        <WeightGraph mode="Inv" k={1} onKChange={noop} />
      );
      const handle = container.querySelector("rect[style*='ew-resize']");
      expect(handle).toBeTruthy();
    });

    it("renders a drag handle for InvQuad mode", () => {
      const { container } = render(
        <WeightGraph mode="InvQuad" k={1} onKChange={noop} />
      );
      const handle = container.querySelector("rect[style*='ew-resize']");
      expect(handle).toBeTruthy();
    });

    it("does not render a drag handle for Lin mode", () => {
      const { container } = render(
        <WeightGraph mode="Lin" k={1} onKChange={noop} />
      );
      const handle = container.querySelector("rect[style*='ew-resize']");
      expect(handle).toBeNull();
    });

    it("does not render a drag handle for None mode", () => {
      const { container } = render(
        <WeightGraph mode="None" k={1} onKChange={noop} />
      );
      const handle = container.querySelector("rect[style*='ew-resize']");
      expect(handle).toBeNull();
    });
  });

  describe("drag interaction", () => {
    it("calls onKChange on pointer up after dragging", () => {
      const onKChange = vi.fn();
      const { container } = render(
        <WeightGraph mode="Inv" k={1} onKChange={onKChange} />
      );
      const handle = container.querySelector(
        "rect[style*='ew-resize']"
      ) as SVGRectElement;
      const svg = container.querySelector("svg") as SVGSVGElement;

      svg.getBoundingClientRect = () => ({
        left: 0,
        top: 0,
        width: 240,
        height: 100,
        right: 240,
        bottom: 100,
        x: 0,
        y: 0,
        toJSON: () => ({})
      });

      fireEvent.pointerDown(handle, { clientX: 120, pointerId: 1 });
      fireEvent.pointerMove(handle, { clientX: 150, pointerId: 1 });
      expect(onKChange).not.toHaveBeenCalled(); // fires on up, not move
      fireEvent.pointerUp(handle, { pointerId: 1 });
      expect(onKChange).toHaveBeenCalledTimes(1);
      const [newK] = onKChange.mock.calls[0];
      expect(newK).toBeGreaterThan(0);
      expect(newK).toBeLessThanOrEqual(2.0);
    });

    it("does not call onKChange on pointer move without prior pointer down", () => {
      const onKChange = vi.fn();
      const { container } = render(
        <WeightGraph mode="Inv" k={1} onKChange={onKChange} />
      );
      const handle = container.querySelector(
        "rect[style*='ew-resize']"
      ) as SVGRectElement;
      fireEvent.pointerMove(handle, { clientX: 150 });
      expect(onKChange).not.toHaveBeenCalled();
    });
  });

  describe("direction labels & flip button", () => {
    it("shows 'END' at the left edge and 'START' at the right edge by default", () => {
      const { container } = render(
        <WeightGraph mode="Lin" k={1} onKChange={noop} />
      );
      // X0 = 42 is the left plot edge in WeightGraph.tsx
      const leftLabel = container.querySelector('text[x="42"]');
      expect(leftLabel?.textContent).toBe("END");
      const texts = Array.from(container.querySelectorAll("text")).map(
        (el) => el.textContent
      );
      expect(texts).toContain("START");
    });

    it("swaps to 'START' at the left edge when flipped", () => {
      const { container } = render(
        <WeightGraph mode="Lin" k={1} onKChange={noop} flipped />
      );
      // X0 = 42 is the left plot edge in WeightGraph.tsx
      const leftLabel = container.querySelector('text[x="42"]');
      expect(leftLabel?.textContent).toBe("START");
    });

    it("calls onFlipToggle when the flip button is clicked", () => {
      const onFlipToggle = vi.fn();
      const { getByRole } = render(
        <WeightGraph
          mode="Lin"
          k={1}
          onKChange={noop}
          onFlipToggle={onFlipToggle}
        />
      );
      fireEvent.click(
        getByRole("button", { name: "Flip weighting direction" })
      );
      expect(onFlipToggle).toHaveBeenCalledTimes(1);
    });
  });
});
