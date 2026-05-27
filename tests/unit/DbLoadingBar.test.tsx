import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

vi.mock("@/contexts/DbContext", () => ({
  useDbContext: vi.fn()
}));

import { useDbContext } from "@/contexts/DbContext";
import { DbLoadingBar } from "@/components/ui/DbLoadingBar";

const mockUseDbContext = vi.mocked(useDbContext);

const baseContext = {
  isReady: false,
  progress: null,
  initResult: null,
  error: null,
  worker: null,
  refresh: vi.fn()
};

describe("DbLoadingBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders nothing when progress is null and not ready and no error", () => {
    mockUseDbContext.mockReturnValue({ ...baseContext });
    const { container } = render(<DbLoadingBar />);
    expect(container.firstChild).toBeNull();
  });

  it("shows fetching progress text with formatted numbers", () => {
    mockUseDbContext.mockReturnValue({
      ...baseContext,
      progress: { type: "fetching", fetched: 4200, total: 18000 }
    });
    render(<DbLoadingBar />);
    expect(screen.getByText(/4,200/)).toBeInTheDocument();
    expect(screen.getByText(/18,000/)).toBeInTheDocument();
  });

  it("shows inserting progress text with page numbers", () => {
    mockUseDbContext.mockReturnValue({
      ...baseContext,
      progress: { type: "inserting", page: 3, totalPages: 9 }
    });
    render(<DbLoadingBar />);
    expect(screen.getByText(/Indexing page 3 \/ 9/)).toBeInTheDocument();
  });

  it("shows a progress bar element for fetching progress", () => {
    mockUseDbContext.mockReturnValue({
      ...baseContext,
      progress: { type: "fetching", fetched: 9000, total: 18000 }
    });
    render(<DbLoadingBar />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute("aria-valuenow", "50");
    expect(progressbar).toHaveAttribute("aria-valuemin", "0");
    expect(progressbar).toHaveAttribute("aria-valuemax", "100");
  });

  it("renders nothing when ready and progress type is ready", () => {
    mockUseDbContext.mockReturnValue({
      ...baseContext,
      progress: { type: "ready" },
      isReady: true
    });
    const { container } = render(<DbLoadingBar />);
    expect(container.firstChild).toBeNull();
  });

  it("shows error message and retry button", () => {
    const mockRefresh = vi.fn().mockResolvedValue(undefined);
    mockUseDbContext.mockReturnValue({
      ...baseContext,
      progress: { type: "error", message: "Network failed" },
      error: new Error("Network failed"),
      refresh: mockRefresh
    });
    render(<DbLoadingBar />);
    expect(screen.getByText(/Network failed/)).toBeInTheDocument();
    const retryButton = screen.getByRole("button", { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
  });

  it("calls refresh when retry button is clicked", () => {
    const mockRefresh = vi.fn().mockResolvedValue(undefined);
    mockUseDbContext.mockReturnValue({
      ...baseContext,
      progress: { type: "error", message: "Network failed" },
      error: new Error("Network failed"),
      refresh: mockRefresh
    });
    render(<DbLoadingBar />);
    const retryButton = screen.getByRole("button", { name: /retry/i });
    fireEvent.click(retryButton);
    expect(mockRefresh).toHaveBeenCalledOnce();
  });
});
