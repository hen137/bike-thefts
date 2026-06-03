import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import type { HeatRow } from "@/types/db";

// MapControls drives the DB query flow (formerly in the deleted DataBoundry
// component). It pulls all four hooks from "@/hooks", so the whole barrel is
// mocked. Child components are stubbed so we test only the query effect.
vi.mock("@/hooks", () => ({
  useMapControls: vi.fn(),
  useGeolocation: vi.fn(),
  useDbContext: vi.fn(),
  useLeafletHeatLayer: vi.fn()
}));
vi.mock("@/components/map/HeatmapSlider", () => ({
  HeatmapSlider: () => null
}));
vi.mock("@/components/map/HeatLegend", () => ({ HeatLegend: () => null }));
vi.mock("@/components/debug", () => ({ DebugHUD: () => null }));
vi.mock("@/components/map/MapThemeSwitcher", () => ({
  MapThemeSwitcher: () => null
}));
vi.mock("@/components/map/MapTileSwitcher", () => ({
  MapTileSwitcher: () => null
}));

import { MapControls } from "@/components/map/MapControls";
import {
  useMapControls,
  useGeolocation,
  useDbContext,
  useLeafletHeatLayer
} from "@/hooks";

const mockUseMapControls = vi.mocked(useMapControls);
const mockUseGeolocation = vi.mocked(useGeolocation);
const mockUseDbContext = vi.mocked(useDbContext);
const mockUseLeafletHeatLayer = vi.mocked(useLeafletHeatLayer);

const sampleRows: HeatRow[] = [
  { hood_158: 77, lat: 43.7, lng: -79.4, count: 3 },
  { hood_158: 77, lat: 43.71, lng: -79.41, count: 6 }
];

function setHeatLayerMock() {
  return {
    registerZoomRadiusHandler: vi.fn(),
    registerZoomBlurHandler: vi.fn(),
    setHeatValues: vi.fn(),
    heatLayer: null,
    heatOptions: null,
    heatValues: null,
    setHeatLayer: vi.fn(),
    setHeatOptions: vi.fn(),
    setZoomRadius: vi.fn()
  };
}

describe("MapControls — DB query integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMapControls.mockReturnValue({
      map: null,
      zoomIn: vi.fn(),
      zoomOut: vi.fn(),
      toggleFullscreen: vi.fn(),
      resetView: vi.fn()
    } as unknown as ReturnType<typeof useMapControls>);
    mockUseGeolocation.mockReturnValue({
      locateUser: vi.fn(),
      isLocating: false,
      isAvailable: true
    } as unknown as ReturnType<typeof useGeolocation>);
    mockUseLeafletHeatLayer.mockReturnValue(
      setHeatLayerMock() as unknown as ReturnType<typeof useLeafletHeatLayer>
    );
  });

  it("calls queryHeatmap when isReady=true and worker present", async () => {
    const mockQueryHeatmap = vi.fn().mockResolvedValue(sampleRows);

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
    } as unknown as ReturnType<typeof useDbContext>);

    render(
      <MapControls
        drawerOpen={false}
        onDrawerToggle={() => {}}
        sliderValues={[750, 1000]}
        committedSliderValues={[750, 1000]}
        startDate={null}
        setStartDate={() => {}}
        endDate={null}
        setEndDate={() => {}}
        byHood={false}
        timeWeighting="none"
      />
    );

    await waitFor(() => {
      expect(mockQueryHeatmap).toHaveBeenCalled();
    });
    // Query args are ISO date strings (start = first of month, end = last of month)
    const [startISO, endISO] = mockQueryHeatmap.mock.calls[0];
    expect(startISO).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(endISO).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("pushes built heat values to the heat layer after query resolves", async () => {
    const heatLayerHook = setHeatLayerMock();
    mockUseLeafletHeatLayer.mockReturnValue(
      heatLayerHook as unknown as ReturnType<typeof useLeafletHeatLayer>
    );
    const mockQueryHeatmap = vi.fn().mockResolvedValue(sampleRows);

    mockUseDbContext.mockReturnValue({
      isReady: true,
      worker: { queryHeatmap: mockQueryHeatmap } as unknown as ReturnType<
        typeof useDbContext
      >["worker"],
      progress: null,
      initResult: {
        status: "cached",
        recordCount: 1000,
        lastFetched: null,
        minDate: "2014-01-01",
        maxDate: "2026-11-30"
      },
      error: null,
      refresh: vi.fn()
    } as unknown as ReturnType<typeof useDbContext>);

    render(
      <MapControls
        drawerOpen={false}
        onDrawerToggle={() => {}}
        sliderValues={[750, 1000]}
        committedSliderValues={[750, 1000]}
        startDate={null}
        setStartDate={() => {}}
        endDate={null}
        setEndDate={() => {}}
        byHood={false}
        timeWeighting="none"
      />
    );

    await waitFor(() => {
      expect(heatLayerHook.setHeatValues).toHaveBeenCalled();
    });
    // buildHeatDataFromRows(rows, true) → HeatLatLngTuple[] [lat, lng, intensity]
    const values = heatLayerHook.setHeatValues.mock.calls[0][0];
    expect(values).toHaveLength(sampleRows.length);
    values.forEach((tuple: number[]) => expect(tuple).toHaveLength(3));
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
    } as unknown as ReturnType<typeof useDbContext>);

    render(
      <MapControls
        drawerOpen={false}
        onDrawerToggle={() => {}}
        sliderValues={[750, 1000]}
        committedSliderValues={[750, 1000]}
        startDate={null}
        setStartDate={() => {}}
        endDate={null}
        setEndDate={() => {}}
        byHood={false}
        timeWeighting="none"
      />
    );

    // Allow effects to settle
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockQueryHeatmap).not.toHaveBeenCalled();
  });

  it("does not call queryHeatmap when isReady=true but worker is null", async () => {
    mockUseDbContext.mockReturnValue({
      isReady: true,
      worker: null,
      progress: null,
      initResult: {
        status: "cached",
        recordCount: 0,
        lastFetched: null,
        minDate: null,
        maxDate: null
      },
      error: null,
      refresh: vi.fn()
    } as unknown as ReturnType<typeof useDbContext>);

    // Should render without throwing despite no worker
    expect(() =>
      render(
        <MapControls
          drawerOpen={false}
          onDrawerToggle={() => {}}
          sliderValues={[750, 1000]}
          committedSliderValues={[750, 1000]}
          startDate={null}
          setStartDate={() => {}}
          endDate={null}
          setEndDate={() => {}}
          byHood={false}
          timeWeighting="none"
        />
      )
    ).not.toThrow();
  });

  it("re-queries the heatmap when byHood prop changes", async () => {
    const mockQueryHeatmap = vi.fn().mockResolvedValue(sampleRows);

    mockUseDbContext.mockReturnValue({
      isReady: true,
      worker: { queryHeatmap: mockQueryHeatmap } as unknown as ReturnType<
        typeof useDbContext
      >["worker"],
      progress: null,
      initResult: {
        status: "cached",
        recordCount: 1000,
        lastFetched: null,
        minDate: "2014-01-01",
        maxDate: "2026-11-30"
      },
      error: null,
      refresh: vi.fn()
    } as unknown as ReturnType<typeof useDbContext>);

    const { rerender } = render(
      <MapControls
        drawerOpen={false}
        onDrawerToggle={() => {}}
        sliderValues={[750, 1000]}
        committedSliderValues={[750, 1000]}
        startDate={null}
        setStartDate={() => {}}
        endDate={null}
        setEndDate={() => {}}
        byHood={false}
        timeWeighting="none"
      />
    );

    await waitFor(() => expect(mockQueryHeatmap).toHaveBeenCalledTimes(1));

    rerender(
      <MapControls
        drawerOpen={false}
        onDrawerToggle={() => {}}
        sliderValues={[750, 1000]}
        committedSliderValues={[750, 1000]}
        startDate={null}
        setStartDate={() => {}}
        endDate={null}
        setEndDate={() => {}}
        byHood={true}
        timeWeighting="none"
      />
    );

    await waitFor(() => expect(mockQueryHeatmap).toHaveBeenCalledTimes(2));
  });
});

describe("MapControls — right-side control stack layout", () => {
  const defaultHookState = () => {
    mockUseMapControls.mockReturnValue({
      map: null,
      zoomIn: vi.fn(),
      zoomOut: vi.fn(),
      toggleFullscreen: vi.fn(),
      resetView: vi.fn()
    } as unknown as ReturnType<typeof useMapControls>);
    mockUseGeolocation.mockReturnValue({
      locateUser: vi.fn(),
      isLocating: false,
      isAvailable: true
    } as unknown as ReturnType<typeof useGeolocation>);
    mockUseLeafletHeatLayer.mockReturnValue(
      setHeatLayerMock() as unknown as ReturnType<typeof useLeafletHeatLayer>
    );
    mockUseDbContext.mockReturnValue({
      isReady: false,
      worker: null,
      progress: null,
      initResult: null,
      error: null,
      refresh: vi.fn()
    } as unknown as ReturnType<typeof useDbContext>);
  };

  const defaultProps = {
    onDrawerToggle: vi.fn(),
    sliderValues: [750, 1000],
    committedSliderValues: [750, 1000],
    startDate: null,
    setStartDate: vi.fn(),
    endDate: null,
    setEndDate: vi.fn(),
    byHood: false as boolean,
    timeWeighting: "none" as "none" | "linear" | "exponential"
  };

  beforeEach(() => {
    vi.clearAllMocks();
    defaultHookState();
  });

  it("drawer trigger container has right-4 class when drawer is closed", () => {
    render(<MapControls {...defaultProps} drawerOpen={false} />);
    const trigger = screen.getByRole("button", { name: /open panel/i });
    expect(trigger.parentElement!.className).toContain("right-4");
  });

  it("drawer trigger container has right-[336px] class when drawer is open", () => {
    render(<MapControls {...defaultProps} drawerOpen={true} />);
    const trigger = screen.getByRole("button", { name: /close panel/i });
    expect(trigger.parentElement!.className).toContain("right-[336px]");
  });

  it("container is fixed-positioned", () => {
    render(<MapControls {...defaultProps} drawerOpen={false} />);
    const trigger = screen.getByRole("button", { name: /open panel/i });
    expect(trigger.parentElement!.className).toContain("fixed");
  });

  it("container stacks items vertically (flex-col)", () => {
    render(<MapControls {...defaultProps} drawerOpen={false} />);
    const trigger = screen.getByRole("button", { name: /open panel/i });
    expect(trigger.parentElement!.className).toContain("flex-col");
  });
});
