import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { DashboardToggle } from "@/components/map/DashboardToggle";

describe("DashboardToggle", () => {
  it("applies the given className to the root", () => {
    const { container } = render(<DashboardToggle className="my-class" />);
    expect(container.firstElementChild).toHaveClass("my-class");
  });

  it("renders a chevron-down icon", () => {
    const { container } = render(<DashboardToggle />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
