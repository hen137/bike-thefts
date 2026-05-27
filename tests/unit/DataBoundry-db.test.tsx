import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";

vi.mock("@/lib/bike-data", () => ({ getBikeData: vi.fn() }));
vi.mock("@/contexts/DbContext", () => ({ useDbContext: vi.fn() }));
vi.mock("@/hooks", () => ({
  useLeafletHeatLayer: vi.fn(() => ({
    registerZoomRadiusHandler: vi.fn(),
    setHeatValues: vi.fn()
  }))
}));
// Mock Heatmap and HeatmapSlider to avoid Leaflet SSR issues
vi.mock("@/components/map", () => ({
  Heatmap: () => null,
  HeatmapSlider: () => null
}));
vi.mock("@/components/debug", () => ({ DebugHUD: () => null }));

import { DataBoundry } from "@/components/map/DataBoundry";
import { getBikeData } from "@/lib/bike-data";
import { useDbContext } from "@/contexts/DbContext";
import { useLeafletHeatLayer } from "@/hooks";

const mockGetBikeData = vi.mocked(getBikeData);
const mockUseDbContext = vi.mocked(useDbContext);
const mockUseLeafletHeatLayer = vi.mocked(useLeafletHeatLayer);

describe("DataBoundry — DB integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses queryHeatmap when isReady=true on slider commit", async () => {
    const mockQueryHeatmap = vi
      .fn()
      .mockResolvedValue([{ lat: 43.7, lng: -79.4, count: 3 }]);
    const mockSetHeatValues = vi.fn();

    mockUseDbContext.mockReturnValue({
      isReady: true,
      worker: { queryHeatmap: mockQueryHeatmap } as unknown as ReturnType<
        typeof useDbContext
      >["worker"],
      progress: null,
      initResult: null,
      error: null,
      refresh: vi.fn()
    });

    mockUseLeafletHeatLayer.mockReturnValue({
      registerZoomRadiusHandler: vi.fn(),
      setHeatValues: mockSetHeatValues,
      heatLayer: null,
      heatOptions: null,
      heatValues: null,
      setHeatLayer: vi.fn(),
      setHeatOptions: vi.fn(),
      setZoomRadius: vi.fn()
    });

    render(<DataBoundry />);

    // The initial useEffect for commitedSliderValues fires immediately on mount
    await waitFor(() => {
      expect(mockQueryHeatmap).toHaveBeenCalled();
    });

    expect(mockGetBikeData).not.toHaveBeenCalled();
  });

  it("uses getBikeData fallback when isReady=false", async () => {
    mockUseDbContext.mockReturnValue({
      isReady: false,
      worker: null,
      progress: null,
      initResult: null,
      error: null,
      refresh: vi.fn()
    });

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

    mockGetBikeData.mockReturnValue(Promise.resolve([]));

    render(<DataBoundry />);

    await waitFor(() => {
      expect(mockGetBikeData).toHaveBeenCalled();
    });
  });
});
