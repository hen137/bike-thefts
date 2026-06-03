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
    it("is hidden (max-height 0) when mode is None", () => {
      const { container } = render(
        <WeightGraph mode="None" k={1} onKChange={noop} />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.maxHeight).toBe("0px");
    });

    it("is visible when mode is Lin", () => {
      const { container } = render(
        <WeightGraph mode="Lin" k={1} onKChange={noop} />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.maxHeight).not.toBe("0px");
    });

    it("is visible when mode is Inv", () => {
      const { container } = render(
        <WeightGraph mode="Inv" k={1} onKChange={noop} />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.maxHeight).not.toBe("0px");
    });

    it("is visible when mode is InvQuad", () => {
      const { container } = render(
        <WeightGraph mode="InvQuad" k={1} onKChange={noop} />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.maxHeight).not.toBe("0px");
    });
  });

  describe("SVG rendering", () => {
    it("renders an SVG element", () => {
      const { container } = render(
        <WeightGraph mode="Inv" k={1} onKChange={noop} />
      );
      expect(container.querySelector("svg")).toBeTruthy();
    });

    it("renders axis labels 'weight' and 'Δt'", () => {
      const { container } = render(
        <WeightGraph mode="Inv" k={1} onKChange={noop} />
      );
      const texts = Array.from(container.querySelectorAll("text")).map(
        (el) => el.textContent
      );
      expect(texts).toContain("weight");
      expect(texts).toContain("Δt");
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
      const handle = container.querySelector("circle[style*='ew-resize']");
      expect(handle).toBeTruthy();
    });

    it("renders a drag handle for InvQuad mode", () => {
      const { container } = render(
        <WeightGraph mode="InvQuad" k={1} onKChange={noop} />
      );
      const handle = container.querySelector("circle[style*='ew-resize']");
      expect(handle).toBeTruthy();
    });

    it("does not render a drag handle for Lin mode", () => {
      const { container } = render(
        <WeightGraph mode="Lin" k={1} onKChange={noop} />
      );
      const handle = container.querySelector("circle[style*='ew-resize']");
      expect(handle).toBeNull();
    });

    it("does not render a drag handle for None mode", () => {
      const { container } = render(
        <WeightGraph mode="None" k={1} onKChange={noop} />
      );
      const handle = container.querySelector("circle[style*='ew-resize']");
      expect(handle).toBeNull();
    });
  });

  describe("drag interaction", () => {
    it("calls onKChange on pointer move after pointer down", () => {
      const onKChange = vi.fn();
      const { container } = render(
        <WeightGraph mode="Inv" k={1} onKChange={onKChange} />
      );
      const handle = container.querySelector(
        "circle[style*='ew-resize']"
      ) as SVGCircleElement;
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
      expect(onKChange).toHaveBeenCalled();
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
        "circle[style*='ew-resize']"
      ) as SVGCircleElement;
      fireEvent.pointerMove(handle, { clientX: 150 });
      expect(onKChange).not.toHaveBeenCalled();
    });
  });
});
