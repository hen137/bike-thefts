import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { LeafletHeatLayer } from "@/components/map/LeafletHeatLayer";
import { DataContext } from "@/contexts/DataContext";
import type { DataContextValue } from "@/types/data";
import type { HeatRow } from "@/types/db";

vi.mock("@/hooks", () => ({
  useLeafletMap: vi.fn(() => null),
  useLeafletHeatLayer: vi.fn(() => ({
    heatLayer: null,
    setHeatLayer: vi.fn(),
    setZoomRadius: vi.fn(),
    setZoomBlur: vi.fn(),
    setZoomMaxZoom: vi.fn(),
    registerZoomRadiusHandler: vi.fn(),
    registerZoomBlurHandler: vi.fn(),
    registerZoomMaxZoomHandler: vi.fn(),
    setHeatOptions: vi.fn(),
    setHeatValues: vi.fn()
  }))
}));

vi.mock("@/lib/utils/heatmap", () => ({
  buildHeatDataFromRows: vi.fn(() => ({ values: [], avgIntensity: 0 }))
}));

import { buildHeatDataFromRows } from "@/lib/utils/heatmap";

function makeContextValue(
  overrides: Partial<DataContextValue> = {}
): DataContextValue {
  return {
    byHood: true,
    setByHood: vi.fn(),
    queryRange: {
      startDate: { month: 0, year: 2023 },
      endDate: { month: 5, year: 2023 }
    },
    setQueryRange: vi.fn(),
    rows: [] as HeatRow[],
    setRows: vi.fn(),
    weightFlipped: false,
    setWeightFlipped: vi.fn(),
    histBins: [],
    setHistBins: vi.fn(),
    timeWeighting: "None",
    setTimeWeighting: vi.fn(),
    weightKInv: 0.5,
    setWeightKInv: vi.fn(),
    weightKInvQuad: 0.25,
    setWeightKInvQuad: vi.fn(),
    ...overrides
  };
}

describe("LeafletHeatLayer", () => {
  it("passes endDate as refDate to buildHeatDataFromRows when not flipped", () => {
    const value = makeContextValue({ weightFlipped: false });
    render(
      <DataContext.Provider value={value}>
        <LeafletHeatLayer />
      </DataContext.Provider>
    );
    expect(buildHeatDataFromRows).toHaveBeenCalledWith(
      value.rows,
      value.byHood,
      value.timeWeighting.toLocaleLowerCase(),
      value.queryRange!.endDate,
      value.weightKInv
    );
  });

  it("passes startDate as refDate to buildHeatDataFromRows when flipped", () => {
    const value = makeContextValue({ weightFlipped: true });
    render(
      <DataContext.Provider value={value}>
        <LeafletHeatLayer />
      </DataContext.Provider>
    );
    expect(buildHeatDataFromRows).toHaveBeenCalledWith(
      value.rows,
      value.byHood,
      value.timeWeighting.toLocaleLowerCase(),
      value.queryRange!.startDate,
      value.weightKInv
    );
  });
});
