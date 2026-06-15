import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import About from "@/app/about/page";
import Community from "@/app/community/page";

describe("About page", () => {
  it("renders placeholder content", () => {
    render(<About />);
    expect(screen.getByText("about page")).toBeInTheDocument();
  });
});

describe("Community page", () => {
  it("renders placeholder content", () => {
    render(<Community />);
    expect(screen.getByText("community page")).toBeInTheDocument();
  });
});
