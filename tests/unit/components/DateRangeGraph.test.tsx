import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { DateRangeGraph } from "@/components/data/DateRangeGraph";
import { DataContext } from "@/contexts/DataContext";
import type { DataContextValue } from "@/types/data";
import type { HeatRow } from "@/types/db";

vi.mock("@/lib/utils/heatmap", () => ({
  computeHistBins: vi.fn(() => [1, 2, 3])
}));

import { computeHistBins } from "@/lib/utils/heatmap";

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

describe("DateRangeGraph", () => {
  it("passes endDate as refDate to computeHistBins when not flipped", () => {
    const value = makeContextValue({ weightFlipped: false });
    render(
      <DataContext.Provider value={value}>
        <DateRangeGraph />
      </DataContext.Provider>
    );
    expect(computeHistBins).toHaveBeenCalledWith(
      value.rows,
      value.queryRange!.endDate
    );
  });

  it("passes startDate as refDate to computeHistBins when flipped", () => {
    const value = makeContextValue({ weightFlipped: true });
    render(
      <DataContext.Provider value={value}>
        <DateRangeGraph />
      </DataContext.Provider>
    );
    expect(computeHistBins).toHaveBeenCalledWith(
      value.rows,
      value.queryRange!.startDate
    );
  });
});
