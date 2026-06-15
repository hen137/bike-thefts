import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("@/hooks", () => ({
  useMapControls: vi.fn()
}));

import { useMapControls } from "@/hooks";
import { MapTools } from "@/components/map/MapTools";

const mockUseMapControls = vi.mocked(useMapControls);

function setHookState(
  overrides: Partial<ReturnType<typeof useMapControls>> = {}
) {
  mockUseMapControls.mockReturnValue({
    map: {},
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    toggleFullscreen: vi.fn(),
    resetView: vi.fn(),
    ...overrides
  } as unknown as ReturnType<typeof useMapControls>);
}

describe("MapTools", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setHookState();
  });

  it("applies the given className to the root", () => {
    const { container } = render(<MapTools className="my-class" />);
    expect(container.firstElementChild).toHaveClass("my-class");
  });

  it("calls zoomIn when the zoom in button is clicked", () => {
    const zoomIn = vi.fn();
    setHookState({ zoomIn });
    render(<MapTools />);
    fireEvent.click(screen.getByRole("button", { name: /zoom in/i }));
    expect(zoomIn).toHaveBeenCalled();
  });

  it("calls zoomOut when the zoom out button is clicked", () => {
    const zoomOut = vi.fn();
    setHookState({ zoomOut });
    render(<MapTools />);
    fireEvent.click(screen.getByRole("button", { name: /zoom out/i }));
    expect(zoomOut).toHaveBeenCalled();
  });

  it("calls resetView when the reset view button is clicked", () => {
    const resetView = vi.fn();
    setHookState({ resetView });
    render(<MapTools />);
    fireEvent.click(screen.getByRole("button", { name: /reset view/i }));
    expect(resetView).toHaveBeenCalled();
  });

  it("disables zoom and reset buttons when map is null", () => {
    setHookState({ map: null });
    render(<MapTools />);
    expect(screen.getByRole("button", { name: /zoom in/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /zoom out/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /reset view/i })).toBeDisabled();
  });

  it("calls toggleFullscreen and shows enter-fullscreen state by default", () => {
    const toggleFullscreen = vi.fn();
    setHookState({ toggleFullscreen });
    render(<MapTools />);
    const btn = screen.getByRole("button", { name: /enter fullscreen/i });
    fireEvent.click(btn);
    expect(toggleFullscreen).toHaveBeenCalled();
  });

  it("switches to exit-fullscreen label after a fullscreenchange event", () => {
    render(<MapTools />);
    Object.defineProperty(document, "fullscreenElement", {
      value: document.body,
      configurable: true
    });
    fireEvent(document, new Event("fullscreenchange"));
    expect(
      screen.getByRole("button", { name: /exit fullscreen/i })
    ).toBeInTheDocument();
    Object.defineProperty(document, "fullscreenElement", {
      value: null,
      configurable: true
    });
  });
});
