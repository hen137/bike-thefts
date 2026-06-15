import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardVisualizationMode } from "@/components/map/DashboardVisualizationMode";

describe("DashboardVisualizationMode", () => {
  it("applies the given className to the root", () => {
    const { container } = render(
      <DashboardVisualizationMode className="my-class" />
    );
    expect(container.firstElementChild).toHaveClass("my-class");
  });

  it("renders the section heading", () => {
    render(<DashboardVisualizationMode />);
    expect(screen.getByText("Visualization Mode:")).toBeInTheDocument();
  });
});
