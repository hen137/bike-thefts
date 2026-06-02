import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MapErrorBoundary } from "@/components/map/MapErrorBoundary";

function Thrower({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error("test map error");
  return <div>Map loaded</div>;
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("MapErrorBoundary", () => {
  it("renders children when no error", () => {
    render(
      <MapErrorBoundary>
        <Thrower shouldThrow={false} />
      </MapErrorBoundary>
    );
    expect(screen.getByText("Map loaded")).toBeInTheDocument();
  });

  it("shows fallback UI when child throws", () => {
    render(
      <MapErrorBoundary>
        <Thrower shouldThrow={true} />
      </MapErrorBoundary>
    );
    expect(screen.getByText("Map Error")).toBeInTheDocument();
  });

  it("displays the thrown error message", () => {
    render(
      <MapErrorBoundary>
        <Thrower shouldThrow={true} />
      </MapErrorBoundary>
    );
    expect(screen.getByText("test map error")).toBeInTheDocument();
  });

  it("shows Try Again button in fallback", () => {
    render(
      <MapErrorBoundary>
        <Thrower shouldThrow={true} />
      </MapErrorBoundary>
    );
    expect(
      screen.getByRole("button", { name: /try again/i })
    ).toBeInTheDocument();
  });

  it("resets error state when Try Again is clicked", () => {
    let shouldThrow = true;
    function ControlledThrower() {
      if (shouldThrow) throw new Error("test map error");
      return <div>Map loaded</div>;
    }

    render(
      <MapErrorBoundary>
        <ControlledThrower />
      </MapErrorBoundary>
    );

    expect(screen.getByText("Map Error")).toBeInTheDocument();

    shouldThrow = false;
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));

    expect(screen.getByText("Map loaded")).toBeInTheDocument();
  });
});
