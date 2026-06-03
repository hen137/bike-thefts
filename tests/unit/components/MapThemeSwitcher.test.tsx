import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TileContext } from "@/contexts/TileContext";
import type { TileContextValue } from "@/types/map";

vi.mock("@/hooks/useTheme", () => ({
  useTheme: vi.fn()
}));

import { useTheme } from "@/hooks/useTheme";
import { MapThemeSwitcher } from "@/components/map/MapThemeSwitcher";

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
  props: { className?: string } = {},
  tileOverrides: Partial<TileContextValue> = {}
) {
  return render(
    <TileContext.Provider value={makeTileCtx(tileOverrides)}>
      <MapThemeSwitcher {...props} />
    </TileContext.Provider>
  );
}

describe("MapThemeSwitcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTheme.mockReturnValue({
      theme: "light",
      toggleTheme: vi.fn(),
      mounted: true
    });
  });

  it("throws when rendered outside TileProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<MapThemeSwitcher />)).toThrow(
      /must be used within a TileProvider/
    );
    spy.mockRestore();
  });

  describe("className prop", () => {
    it("uses default rounded-full style when no className provided", () => {
      renderSwitcher();
      expect(screen.getByRole("button").className).toContain("rounded-full");
    });

    it("applies custom className and drops default style", () => {
      renderSwitcher({ className: "custom-class h-9 w-9 rounded" });
      const btn = screen.getByRole("button");
      expect(btn.className).toContain("custom-class");
      expect(btn.className).not.toContain("rounded-full");
    });

    it("applies custom className in the hydration placeholder (mounted=false)", () => {
      mockUseTheme.mockReturnValue({
        theme: "light",
        toggleTheme: vi.fn(),
        mounted: false
      });
      renderSwitcher({ className: "my-custom-class" });
      expect(screen.getByRole("button").className).toContain("my-custom-class");
    });
  });

  describe("theme icons", () => {
    it("shows 'Switch to dark mode' title in light mode", () => {
      mockUseTheme.mockReturnValue({
        theme: "light",
        toggleTheme: vi.fn(),
        mounted: true
      });
      renderSwitcher();
      expect(screen.getByRole("button")).toHaveAttribute(
        "title",
        "Switch to dark mode"
      );
    });

    it("shows 'Switch to light mode' title in dark mode", () => {
      mockUseTheme.mockReturnValue({
        theme: "dark",
        toggleTheme: vi.fn(),
        mounted: true
      });
      renderSwitcher();
      expect(screen.getByRole("button")).toHaveAttribute(
        "title",
        "Switch to light mode"
      );
    });
  });

  describe("interactions", () => {
    it("calls toggleTheme on click", () => {
      const toggleTheme = vi.fn();
      mockUseTheme.mockReturnValue({
        theme: "light",
        toggleTheme,
        mounted: true
      });
      renderSwitcher();
      fireEvent.click(screen.getByRole("button"));
      expect(toggleTheme).toHaveBeenCalledOnce();
    });

    it("switches to dark tile provider when toggling from light with osm active", () => {
      const setProviderId = vi.fn();
      mockUseTheme.mockReturnValue({
        theme: "light",
        toggleTheme: vi.fn(),
        mounted: true
      });
      renderSwitcher({}, { currentProviderId: "osm", setProviderId });
      fireEvent.click(screen.getByRole("button"));
      expect(setProviderId).toHaveBeenCalledWith("dark");
    });

    it("switches to osm tile provider when toggling from dark with dark active", () => {
      const setProviderId = vi.fn();
      mockUseTheme.mockReturnValue({
        theme: "dark",
        toggleTheme: vi.fn(),
        mounted: true
      });
      renderSwitcher({}, { currentProviderId: "dark", setProviderId });
      fireEvent.click(screen.getByRole("button"));
      expect(setProviderId).toHaveBeenCalledWith("osm");
    });

    it("does not call setProviderId when a non-default tile is active", () => {
      const setProviderId = vi.fn();
      mockUseTheme.mockReturnValue({
        theme: "light",
        toggleTheme: vi.fn(),
        mounted: true
      });
      renderSwitcher({}, { currentProviderId: "satellite", setProviderId });
      fireEvent.click(screen.getByRole("button"));
      expect(setProviderId).not.toHaveBeenCalled();
    });
  });
});
