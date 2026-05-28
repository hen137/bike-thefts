import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";

vi.mock("@/contexts/DbContext", () => ({ useDbContext: vi.fn() }));
vi.mock("@/hooks", () => ({
  useLeafletHeatLayer: vi.fn(() => ({
    registerZoomRadiusHandler: vi.fn(),
    setHeatValues: vi.fn(),
    heatLayer: null,
    setHeatOptions: vi.fn()
  }))
}));
vi.mock("@/components/map", () => ({
  HeatmapSlider: () => null
}));
vi.mock("@/components/debug", () => ({ DebugHUD: () => null }));

import { DataBoundry } from "@/components/map/DataBoundry";
import { useDbContext } from "@/contexts/DbContext";
import { useLeafletHeatLayer } from "@/hooks";

const mockUseDbContext = vi.mocked(useDbContext);
const mockUseLeafletHeatLayer = vi.mocked(useLeafletHeatLayer);

describe("DataBoundry — DB integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLeafletHeatLayer.mockReturnValue({
      registerZoomRadiusHandler: vi.fn(),
      setHeatValues: vi.fn(),
      heatLayer: null,
      heatOptions: null,
      heatValues: null,
      setHeatLayer: vi.fn(),
      setHeatOptions: vi.fn(),
      setZoomRadius: vi.fn()
    });
  });

  it("calls queryHeatmap when isReady=true on slider commit", async () => {
    const mockQueryHeatmap = vi
      .fn()
      .mockResolvedValue([{ lat: 43.7, lng: -79.4, count: 3 }]);

    mockUseDbContext.mockReturnValue({
      isReady: true,
      worker: { queryHeatmap: mockQueryHeatmap } as unknown as ReturnType<
        typeof useDbContext
      >["worker"],
      progress: null,
      initResult: {
        status: "cached",
        recordCount: 1000,
        lastFetched: "2026-05-27T00:00:00.000Z",
        minDate: "2014-01-01",
        maxDate: "2026-11-30"
      },
      error: null,
      refresh: vi.fn()
    });

    render(<DataBoundry />);

    await waitFor(() => {
      expect(mockQueryHeatmap).toHaveBeenCalled();
    });
  });

  it("does not call queryHeatmap when isReady=false", async () => {
    const mockQueryHeatmap = vi.fn();

    mockUseDbContext.mockReturnValue({
      isReady: false,
      worker: null,
      progress: null,
      initResult: null,
      error: null,
      refresh: vi.fn()
    });

    render(<DataBoundry />);

    // Allow effects to settle
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockQueryHeatmap).not.toHaveBeenCalled();
  });
});
