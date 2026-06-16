import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NavBar } from "@/components/ui/NavBar";

describe("NavBar", () => {
  it("renders the site title", () => {
    render(<NavBar />);
    expect(screen.getByText("TObikethefts")).toBeInTheDocument();
  });

  it("renders About, Map, and Community links with correct hrefs", () => {
    render(<NavBar />);
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

  // TODO: restore when MapThemeSwitcher is re-added to NavBar
  // it("renders the theme switcher", () => {
  //   render(<NavBar />);
  //   expect(screen.getByRole("button")).toBeInTheDocument();
  // });
});
