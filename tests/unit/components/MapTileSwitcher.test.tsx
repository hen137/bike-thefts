import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TileContext } from "@/contexts/TileContext";
import type { TileContextValue } from "@/types/map";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    <img alt={alt} src={src} />
  )
}));

vi.mock("@/hooks", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/hooks")>();
  return { ...actual, useTheme: vi.fn() };
});

import { useTheme } from "@/hooks";
import { MapTileSwitcher } from "@/components/map/MapTileSwitcher";

const mockUseTheme = vi.mocked(useTheme);

function makeTileCtx(
  overrides: Partial<TileContextValue> = {}
): TileContextValue {
  return {
    tileProvider: null as unknown as TileContextValue["tileProvider"],
    currentProviderId: "osm",
    setProviderId: vi.fn(),
    ...overrides
  };
}

function renderSwitcher(
  props: { buttonClassName?: string } = {},
  tileOverrides: Partial<TileContextValue> = {}
) {
  return render(
    <TileContext.Provider value={makeTileCtx(tileOverrides)}>
      <MapTileSwitcher {...props} />
    </TileContext.Provider>
  );
}

describe("MapTileSwitcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTheme.mockReturnValue({ theme: "light" });
  });

  it("throws when rendered outside TileProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<MapTileSwitcher />)).toThrow(
      /must be used within a TileProvider/
    );
    spy.mockRestore();
  });

  describe("buttonClassName prop", () => {
    it("uses default rounded-full style when no buttonClassName provided", () => {
      renderSwitcher();
      expect(
        screen.getByRole("button", { name: /choose tile themes/i }).className
      ).toContain("rounded-full");
    });

    it("applies custom buttonClassName and drops default style", () => {
      renderSwitcher({ buttonClassName: "h-9 w-9 rounded custom" });
      const btn = screen.getByRole("button", { name: /choose tile themes/i });
      expect(btn.className).toContain("custom");
      expect(btn.className).not.toContain("rounded-full");
    });
  });

  describe("popup visibility", () => {
    function getPopup() {
      const trigger = screen.getByRole("button", {
        name: /choose tile themes/i
      });
      const wrapper = trigger.closest("div")!;
      return wrapper.firstElementChild as HTMLElement;
    }

    it("popup is hidden by default (pointer-events-none)", () => {
      renderSwitcher();
      expect(getPopup()).toHaveClass("pointer-events-none");
    });

    it("popup becomes visible after trigger click", () => {
      renderSwitcher();
      fireEvent.click(
        screen.getByRole("button", { name: /choose tile themes/i })
      );
      expect(getPopup()).not.toHaveClass("pointer-events-none");
    });

    it("popup closes again on second trigger click", () => {
      renderSwitcher();
      const trigger = screen.getByRole("button", {
        name: /choose tile themes/i
      });
      fireEvent.click(trigger);
      fireEvent.click(trigger);
      expect(getPopup()).toHaveClass("pointer-events-none");
    });
  });

  describe("popup positioning", () => {
    it("popup is positioned below the button (top-full)", () => {
      renderSwitcher();
      const trigger = screen.getByRole("button", {
        name: /choose tile themes/i
      });
      const popup = trigger.closest("div")!.firstElementChild as HTMLElement;
      expect(popup).toHaveClass("top-full");
    });

    it("popup is right-aligned (right-0)", () => {
      renderSwitcher();
      const trigger = screen.getByRole("button", {
        name: /choose tile themes/i
      });
      const popup = trigger.closest("div")!.firstElementChild as HTMLElement;
      expect(popup).toHaveClass("right-0");
    });

    it("popup has top margin separating it from the button (mt-2)", () => {
      renderSwitcher();
      const trigger = screen.getByRole("button", {
        name: /choose tile themes/i
      });
      const popup = trigger.closest("div")!.firstElementChild as HTMLElement;
      expect(popup).toHaveClass("mt-2");
    });
  });

  describe("layer options", () => {
    it("renders Default and Satellite layer options", () => {
      renderSwitcher();
      fireEvent.click(
        screen.getByRole("button", { name: /choose tile themes/i })
      );
      expect(screen.getByText("Default")).toBeInTheDocument();
      expect(screen.getByText("Satellite")).toBeInTheDocument();
    });

    it("calls setProviderId when a layer option is clicked", () => {
      const setProviderId = vi.fn();
      renderSwitcher({}, { currentProviderId: "osm", setProviderId });
      fireEvent.click(
        screen.getByRole("button", { name: /choose tile themes/i })
      );
      fireEvent.click(screen.getByText("Satellite"));
      expect(setProviderId).toHaveBeenCalledWith("satellite");
    });

    it("active layer option has ring-2 highlight", () => {
      renderSwitcher({}, { currentProviderId: "satellite" });
      fireEvent.click(
        screen.getByRole("button", { name: /choose tile themes/i })
      );
      const satelliteBtn = screen.getByText("Satellite").closest("button")!;
      expect(satelliteBtn.className).toContain("ring-2");
    });

    it("inactive layer option does not have ring highlight", () => {
      renderSwitcher({}, { currentProviderId: "osm" });
      fireEvent.click(
        screen.getByRole("button", { name: /choose tile themes/i })
      );
      const satelliteBtn = screen.getByText("Satellite").closest("button")!;
      expect(satelliteBtn.className).not.toContain("ring-2");
    });
  });
});
