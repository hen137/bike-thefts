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
import { DashboardTileSwitcher } from "@/components/map/DashboardTileSwitcher";

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
      <DashboardTileSwitcher {...props} />
    </TileContext.Provider>
  );
}

describe("DashboardTileSwitcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTheme.mockReturnValue({ theme: "light" });
  });

  it("throws when rendered outside TileProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<DashboardTileSwitcher />)).toThrow(
      /must be used within a TileProvider/
    );
    spy.mockRestore();
  });

  it("applies className to root element", () => {
    const { container } = renderSwitcher({ className: "my-class" });
    expect(container.firstElementChild).toHaveClass("my-class");
  });

  it("renders Default and Satellite select options", () => {
    renderSwitcher();
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("option", { name: "Default" })).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Satellite" })
    ).toBeInTheDocument();
  });

  it("shows Default map preview image on initial render", () => {
    renderSwitcher();
    expect(screen.getByAltText("Default map preview")).toBeInTheDocument();
  });

  it("calls setProviderId with osm on Default select in light theme", () => {
    const setProviderId = vi.fn();
    renderSwitcher({}, { setProviderId });
    // Switch away first so re-selecting Default triggers onValueChange
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: "Satellite" }));
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: "Default" }));
    expect(setProviderId).toHaveBeenLastCalledWith("osm");
  });

  it("calls setProviderId with dark on Default select in dark theme", () => {
    mockUseTheme.mockReturnValue({ theme: "dark" });
    const setProviderId = vi.fn();
    renderSwitcher({}, { setProviderId });
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: "Satellite" }));
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: "Default" }));
    expect(setProviderId).toHaveBeenLastCalledWith("dark");
  });

  it("calls setProviderId with satellite on Satellite select", () => {
    const setProviderId = vi.fn();
    renderSwitcher({}, { setProviderId });
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: "Satellite" }));
    expect(setProviderId).toHaveBeenCalledWith("satellite");
  });

  it("shows Satellite preview image after selecting Satellite", async () => {
    renderSwitcher();
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: "Satellite" }));
    expect(screen.getByAltText("Satellite map preview")).toBeInTheDocument();
  });
});
