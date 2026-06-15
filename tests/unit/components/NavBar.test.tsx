import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NavBar } from "@/components/ui/NavBar";
import { TileContext } from "@/contexts/TileContext";
import type { TileContextValue } from "@/types/map";

function renderNavBar() {
  const tileCtx: TileContextValue = {
    tileProvider: null as unknown as TileContextValue["tileProvider"],
    currentProviderId: "osm",
    setProviderId: vi.fn()
  };

  return render(
    <TileContext.Provider value={tileCtx}>
      <NavBar />
    </TileContext.Provider>
  );
}

describe("NavBar", () => {
  it("renders the site title", () => {
    renderNavBar();
    expect(screen.getByText("TObikethefts")).toBeInTheDocument();
  });

  it("renders About, Map, and Community links with correct hrefs", () => {
    renderNavBar();
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
      "href",
      "/about"
    );
    expect(screen.getByRole("link", { name: "Map" })).toHaveAttribute(
      "href",
      "/"
    );
    expect(screen.getByRole("link", { name: "Community" })).toHaveAttribute(
      "href",
      "/community"
    );
  });

  it("renders the theme switcher", () => {
    renderNavBar();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
