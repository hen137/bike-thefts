import { describe, it, expect, vi, beforeEach } from "vitest";
import { getBikeData } from "@/lib/bike-data";

function makeCountResponse(count: number) {
  return new Response(JSON.stringify({ count }), { status: 200 });
}

function makeDataResponse(features: object[]) {
  return new Response(JSON.stringify({ features }), { status: 200 });
}

function errorResponse(status = 500) {
  return new Response("Internal Server Error", {
    status,
    statusText: "Internal Server Error",
    headers: { "content-type": "text/plain" }
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("getBikeData", () => {
  it("happy path — fetches count then one data page", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(makeCountResponse(5))
      .mockResolvedValueOnce(makeDataResponse([{ id: 1 }]));
    vi.stubGlobal("fetch", fetchMock);

    const result = await getBikeData({ startDate: null, endDate: null });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result).toHaveLength(1);
  });

  it("paginates when totalRecords > 2000", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(makeCountResponse(3001))
      .mockResolvedValueOnce(makeDataResponse([{ id: 1 }]))
      .mockResolvedValueOnce(makeDataResponse([{ id: 2 }]));
    vi.stubGlobal("fetch", fetchMock);

    const result = await getBikeData({ startDate: null, endDate: null });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(result).toHaveLength(2);

    const urls: string[] = fetchMock.mock.calls.map(
      (c: unknown[]) => c[0] as string
    );
    expect(urls[1]).toContain("resultOffset=0");
    expect(urls[2]).toContain("resultOffset=2000");
  });

  it("throws when count endpoint fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(errorResponse()));
    await expect(
      getBikeData({ startDate: null, endDate: null })
    ).rejects.toThrow(/count/i);
  });

  it("throws when data endpoint fails", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(makeCountResponse(1))
      .mockResolvedValueOnce(errorResponse());
    vi.stubGlobal("fetch", fetchMock);
    await expect(
      getBikeData({ startDate: null, endDate: null })
    ).rejects.toThrow(/data/i);
  });

  it("uses default where param when no dates provided", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(makeCountResponse(0));
    vi.stubGlobal("fetch", fetchMock);

    await getBikeData({ startDate: null, endDate: null });
    const countUrl: string = fetchMock.mock.calls[0][0];
    expect(countUrl).toContain("1%3D1");
  });

  it("includes only lower bound when only startDate given", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(makeCountResponse(0));
    vi.stubGlobal("fetch", fetchMock);

    await getBikeData({ startDate: { year: 2020, month: 0 }, endDate: null });
    const url: string = fetchMock.mock.calls[0][0];
    expect(url).toContain("OCC_YEAR>=2020");
    expect(url).not.toContain("OCC_YEAR<=");
  });

  it("includes AND when both dates given", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(makeCountResponse(0));
    vi.stubGlobal("fetch", fetchMock);

    await getBikeData({
      startDate: { year: 2020, month: 0 },
      endDate: { year: 2022, month: 11 }
    });
    const url: string = fetchMock.mock.calls[0][0];
    expect(url).toContain("AND");
    expect(url).toContain("OCC_YEAR>=2020");
    expect(url).toContain("OCC_YEAR<=2022");
  });
});
