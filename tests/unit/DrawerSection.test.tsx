import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DrawerSection } from "@/components/map/DrawerSection";

describe("DrawerSection", () => {
  it("renders string title", () => {
    render(<DrawerSection title="Settings" />);
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("renders node title", () => {
    render(<DrawerSection title={<span>Custom Title</span>} />);
    expect(screen.getByText("Custom Title")).toBeInTheDocument();
  });

  it("renders children below the title", () => {
    render(
      <DrawerSection title="Settings">
        <p>section body</p>
      </DrawerSection>
    );
    expect(screen.getByText("section body")).toBeInTheDocument();
  });

  it("renders without children", () => {
    render(<DrawerSection title="Settings" />);
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("renders title row and children as siblings without a wrapper element", () => {
    const { container } = render(
      <DrawerSection title="Settings">
        <p>section body</p>
      </DrawerSection>
    );
    expect(container.children).toHaveLength(2);
    expect(container.children[0]).toHaveClass(
      "flex",
      "items-center",
      "py-2",
      "gap-2"
    );
    expect(container.children[1].textContent).toBe("section body");
  });
});
