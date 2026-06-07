import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    width,
    height
  }: {
    src: string;
    alt: string;
    width: number;
    height: number;
  }) => <img src={src} alt={alt} width={width} height={height} />
}));

import { TechButton } from "@/components/map/TechButton";

describe("TechButton", () => {
  it("renders the title", () => {
    render(<TechButton title="React" icon={<span>icon</span>} />);
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  it("renders a link with the given href and opens in a new tab", () => {
    render(
      <TechButton
        title="React"
        icon={<span>icon</span>}
        link="https://reactjs.org/"
      />
    );
    const link = screen.getByRole("link", { name: /React/i });
    expect(link).toHaveAttribute("href", "https://reactjs.org/");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("omits href when no link is provided", () => {
    render(<TechButton title="React" icon={<span>icon</span>} />);
    expect(screen.getByText("React").closest("a")).not.toHaveAttribute("href");
  });

  it("renders a ReactNode icon directly", () => {
    render(
      <TechButton title="React" icon={<span data-testid="node-icon" />} />
    );
    expect(screen.getByTestId("node-icon")).toBeInTheDocument();
  });

  it("renders a string icon as an Image with the title as alt text", () => {
    render(
      <TechButton title="Leaflet" icon="https://example.com/leaflet.ico" />
    );
    const img = screen.getByRole("img", { name: "Leaflet" });
    expect(img).toHaveAttribute("src", "https://example.com/leaflet.ico");
    expect(img).toHaveAttribute("width", "12");
    expect(img).toHaveAttribute("height", "12");
  });
});
