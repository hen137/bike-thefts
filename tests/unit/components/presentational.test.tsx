import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// DebugHUD pulls DebugSlider (a Radix Slider wrapper); stub it so these tests
// stay focused on DebugHUD's own formatting logic.
vi.mock("@/components/debug", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/components/debug")>();
  return { ...actual, DebugSlider: () => null };
});

// Stub context-dependent subcomponents so MapTopBar tests stay isolated.
vi.mock("@/components/map/MapSearchBar", () => ({
  MapSearchBar: () => <div data-testid="mock-search-bar" />
}));

import { HeatLegend } from "@/components/map/HeatLegend";
import { MapTopBar } from "@/components/map/MapTopBar";
import { MapLoadingSpinner } from "@/components/map/MapLoadingSpinner";
import { DebugHUD } from "@/components/debug/DebugHUD";
import { MapContext } from "@/contexts/MapContext";
import type { MapContextValue } from "@/types/map";
import type { DebugHUDProps } from "@/types/components";

describe("HeatLegend", () => {
  it("renders the qualitative scale labels", () => {
    render(<HeatLegend />);
    expect(screen.getByText("Less")).toBeInTheDocument();
    expect(screen.getByText("More")).toBeInTheDocument();
  });
});

describe("MapTopBar", () => {
  it("renders the top bar container", () => {
    render(<MapTopBar />);
    expect(document.getElementById("map-top-bar")).toBeInTheDocument();
  });

  it("renders the search bar", () => {
    render(<MapTopBar />);
    expect(screen.getByTestId("mock-search-bar")).toBeInTheDocument();
  });
});

describe("MapLoadingSpinner", () => {
  function wrapWithReady(isReady: boolean) {
    return render(
      <MapContext.Provider value={{ isReady } as unknown as MapContextValue}>
        <MapLoadingSpinner />
      </MapContext.Provider>
    );
  }

  it("shows the spinner while the map is not ready", () => {
    wrapWithReady(false);
    expect(screen.getByText("Loading map...")).toBeInTheDocument();
  });

  it("renders nothing once the map is ready", () => {
    const { container } = wrapWithReady(true);
    expect(container).toBeEmptyDOMElement();
  });

  it("throws when used outside a MapProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<MapLoadingSpinner />)).toThrow(
      /must be used within a MapProvider/
    );
    spy.mockRestore();
  });
});

describe("DebugHUD", () => {
  const baseProps: DebugHUDProps = {
    sliderValues: [750, 1000],
    startDate: { month: 2, year: 2020 },
    endDate: { month: 5, year: 2021 },
    avgIntensity: 0.42,
    blur: 30,
    setBlur: vi.fn(),
    radius: 60,
    setRadius: vi.fn(),
    maxZoom: 13,
    setMaxZoom: vi.fn(),
    gradient: undefined,
    totalRecords: 1234,
    currentQueryCount: 56,
    dbMinDate: "2014-01-01",
    dbMaxDate: "2026-11-30",
    onRefreshDb: vi.fn()
  };

  it("renders raw slider values and DB stats", () => {
    render(<DebugHUD {...baseProps} />);
    expect(screen.getByText("Raw: 750,1000")).toBeInTheDocument();
    expect(screen.getByText("Total records: 1234")).toBeInTheDocument();
    expect(screen.getByText(/Current query:/)).toHaveTextContent("56");
  });

  // The date range is rendered across several text nodes inside one <p>,
  // so match on the paragraph element's full textContent.
  const norm = (s: string | null | undefined) =>
    (s ?? "").replace(/\s+/g, " ").trim();
  const pWithText = (text: string) => (_: string, el: Element | null) =>
    el?.tagName === "P" && norm(el.textContent) === text;

  it("formats the DB date range as MM-YYYY", () => {
    render(<DebugHUD {...baseProps} />);
    // formatDate("2014-01-01") → "01-2014", ("2026-11-30") → "11-2026"
    expect(
      screen.getByText(pWithText("Date range: 01-2014 → 11-2026"))
    ).toBeInTheDocument();
  });

  it("falls back to em dashes for null records / dates", () => {
    render(
      <DebugHUD
        {...baseProps}
        totalRecords={null}
        currentQueryCount={null}
        dbMinDate={null}
        dbMaxDate={null}
      />
    );
    expect(screen.getByText("Total records: —")).toBeInTheDocument();
    expect(
      screen.getByText(pWithText("Date range: — → —"))
    ).toBeInTheDocument();
  });
});
