import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

// ViewTransition is a Next.js experimental API not available in the test
// environment — render it as a passthrough so page tests don't break.
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    ViewTransition: ({ children }: { children: ReactNode }) => children
  };
});

vi.mock("@/components/ui/NavBar", () => ({
  NavBar: () => <nav data-testid="nav-bar" />
}));

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
