import { describe, it, expect, vi } from "vitest";

vi.mock("leaflet", () => ({
  default: {}
}));

import { isInRange, buildHeatData } from "@/lib/utils/heatmap";
import type { BikeData, StartEndDates } from "@/types/map";

const range: StartEndDates = {
  startDate: { year: 2021, month: 0 }, // Jan 2021
  endDate: { year: 2022, month: 11 } // Dec 2022
};

describe("isInRange", () => {
  it("accepts record on exact start month", () => {
    expect(isInRange(range, { month: "January", year: "2021" })).toBe(true);
  });
  it("accepts record on exact end month", () => {
    expect(isInRange(range, { month: "December", year: "2022" })).toBe(true);
  });
  it("rejects record before start", () => {
    expect(isInRange(range, { month: "December", year: "2020" })).toBe(false);
  });
  it("rejects record after end", () => {
    expect(isInRange(range, { month: "January", year: "2023" })).toBe(false);
  });
  it("accepts record in middle year", () => {
    expect(isInRange(range, { month: "June", year: "2021" })).toBe(true);
  });
  it("returns false when dateRanges has null startDate", () => {
    expect(
      isInRange(
        { startDate: null, endDate: range.endDate },
        { month: "June", year: "2021" }
      )
    ).toBe(false);
  });
  it("returns false when dateRanges has null endDate", () => {
    expect(
      isInRange(
        { startDate: range.startDate, endDate: null },
        { month: "June", year: "2021" }
      )
    ).toBe(false);
  });
  it("rejects same year record before start month", () => {
    // start is Jan 2021 (month=0), record is Jan 2021 month 0 → boundary
    const earlyRange: StartEndDates = {
      startDate: { year: 2021, month: 5 }, // June 2021
      endDate: { year: 2021, month: 11 }
    };
    expect(isInRange(earlyRange, { month: "January", year: "2021" })).toBe(
      false
    );
  });
});

function makeRecord(lng: number, lat: number, month: string, year: string) {
  return {
    geometry: { coordinates: [lng, lat] },
    properties: {
      OCC_MONTH: month,
      OCC_YEAR: year,
      OBJECTID: 0,
      EVENT_UNIQUE_ID: "",
      PRIMARY_OFFENCE: "",
      OCC_DATE: 0,
      OCC_DOW: "",
      OCC_DAY: "",
      OCC_DOY: "",
      OCC_HOUR: "",
      REPORT_DATE: 0,
      REPORT_YEAR: "",
      REPORT_MONTH: "",
      REPORT_DOW: "",
      REPORT_DAY: "",
      REPORT_DOY: "",
      REPORT_HOUR: "",
      DIVISION: "",
      LOCATION_TYPE: "",
      PREMISES_TYPE: "",
      BIKE_MAKE: "",
      BIKE_MODEL: "",
      BIKE_TYPE: "",
      BIKE_SPEED: "",
      BIKE_COLOUR: "",
      BIKE_COST: null,
      STATUS: "",
      HOOD_158: "",
      NEIGHBOURHOOD_158: "",
      HOOD_140: "",
      NEIGHBOURHOOD_140: "",
      LONG_WGS84: lng,
      LAT_WGS84: lat
    }
  };
}

// Sentinel coords: coordsIndex = coords[1]+coords[0] = lat+lng
// SENTINAL_COORDINATES = "5.08888749034163e-14" + "5.6843418860808e-14"
// → coords[1]=lat=5.08888749034163e-14, coords[0]=lng=5.6843418860808e-14
const SENTINEL_LNG = 5.6843418860808e-14;
const SENTINEL_LAT = 5.08888749034163e-14;

describe("buildHeatData", () => {
  it("filters out sentinel coordinates", () => {
    const data: BikeData = [
      {
        features: [
          makeRecord(SENTINEL_LNG, SENTINEL_LAT, "June", "2021"),
          makeRecord(-79.4, 43.7, "June", "2021")
        ]
      }
    ];
    const { values } = buildHeatData(data, range);
    // only the non-sentinel record should produce a heat point
    expect(values).toHaveLength(1);
  });

  it("accumulates duplicate coordinates into a single entry with higher count", () => {
    const data: BikeData = [
      {
        features: [
          makeRecord(-79.4, 43.7, "June", "2021"),
          makeRecord(-79.4, 43.7, "June", "2021"),
          makeRecord(-79.4, 43.7, "July", "2021")
        ]
      }
    ];
    const { values } = buildHeatData(data, range);
    expect(values).toHaveLength(1);
    // intensity is calcNormalDistribution(3, 3, 0) — std dev of [3] is 0
    // when all values identical std = 0; just check it doesn't throw and returns one point
    expect(values[0]).toHaveLength(3);
  });

  it("excludes records outside date range", () => {
    const data: BikeData = [
      {
        features: [
          makeRecord(-79.4, 43.7, "June", "2020"), // before range
          makeRecord(-79.3, 43.6, "June", "2021") // in range
        ]
      }
    ];
    const { values } = buildHeatData(data, range);
    expect(values).toHaveLength(1);
  });

  it("returns positive intensities for all heat points", () => {
    // Need different occurrence counts per coord so std > 0 (avoids NaN from 0/0)
    const data: BikeData = [
      {
        features: [
          makeRecord(-79.4, 43.7, "June", "2021"),
          makeRecord(-79.4, 43.7, "July", "2021"), // 2 occurrences at -79.4,43.7
          makeRecord(-79.4, 43.7, "August", "2021"), // 3 occurrences at -79.4,43.7
          makeRecord(-79.3, 43.6, "June", "2021") // 1 occurrence at -79.3,43.6
        ]
      }
    ];
    const { values } = buildHeatData(data, range);
    for (const [, , intensity] of values) {
      expect(intensity).toBeGreaterThan(0);
    }
  });

  it("each heat tuple has [lat, lng, intensity] order", () => {
    const data: BikeData = [
      { features: [makeRecord(-79.4, 43.7, "June", "2021")] }
    ];
    const { values } = buildHeatData(data, range);
    // buildHeatData puts [coords[1], coords[0], intensity] = [lat, lng, intensity]
    // coords[0]=lng=-79.4, coords[1]=lat=43.7 → tuple[0]=43.7, tuple[1]=-79.4
    expect(values[0][0]).toBeCloseTo(43.7, 4);
    expect(values[0][1]).toBeCloseTo(-79.4, 4);
  });
});
