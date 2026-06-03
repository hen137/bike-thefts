import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor, renderHook, act } from "@testing-library/react";
import React from "react";

const mockInit = vi.fn();
const mockQueryHeatmap = vi.fn();
const mockRefresh = vi.fn();

vi.mock("@/lib/db-client", () => ({
  getDbWorker: () => ({
    init: mockInit,
    queryHeatmap: mockQueryHeatmap,
    refresh: mockRefresh
  })
}));

// Import after mocks
import { DbProvider, useDbContext } from "@/contexts/DbContext";

describe("DbContext", () => {
  beforeEach(() => {
    mockInit.mockReset();
    mockQueryHeatmap.mockReset();
    mockRefresh.mockReset();
    // Default: init never resolves (hangs) so we can test initial state
    mockInit.mockReturnValue(new Promise(() => {}));
  });

  // Helper wrapper for renderHook
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <DbProvider>{children}</DbProvider>
  );

  it("isReady starts as false", () => {
    const { result } = renderHook(() => useDbContext(), { wrapper });
    expect(result.current.isReady).toBe(false);
  });

  it("isReady becomes true after init resolves", async () => {
    mockInit.mockResolvedValue({
      status: "cached",
      recordCount: 1000,
      lastFetched: "2026-05-27T00:00:00.000Z",
      minDate: null,
      maxDate: null
    });

    const { result } = renderHook(() => useDbContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });
  });

  it("mockInit is called with a progress callback function", async () => {
    mockInit.mockImplementation((onProgress: (e: unknown) => void) => {
      onProgress({ type: "fetching", fetched: 0, total: 100 });
      return Promise.resolve({
        status: "fresh",
        recordCount: 500,
        lastFetched: null,
        minDate: null,
        maxDate: null
      });
    });

    const { result } = renderHook(() => useDbContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    expect(mockInit).toHaveBeenCalledWith(expect.any(Function));
  });

  it("initResult is set after init resolves", async () => {
    mockInit.mockResolvedValue({
      status: "cached",
      recordCount: 1000,
      lastFetched: "2026-05-27T00:00:00.000Z",
      minDate: null,
      maxDate: null
    });

    const { result } = renderHook(() => useDbContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.initResult?.recordCount).toBe(1000);
    });
  });

  it("error state is set when init throws", async () => {
    mockInit.mockRejectedValue(new Error("DB failed"));

    const { result } = renderHook(() => useDbContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.error?.message).toBe("DB failed");
    });
  });

  it("worker reference is available from context after effect runs", async () => {
    const { result } = renderHook(() => useDbContext(), { wrapper });
    // Worker is set inside useEffect (client-only), not during SSR render
    await waitFor(() => {
      expect(result.current.worker).not.toBeNull();
    });
  });

  it("refresh() re-runs the worker and ends ready", async () => {
    mockInit.mockResolvedValue({
      status: "cached",
      recordCount: 10,
      lastFetched: null,
      minDate: null,
      maxDate: null
    });
    mockRefresh.mockResolvedValue({
      status: "fresh",
      recordCount: 99,
      lastFetched: "2026-01-01T00:00:00.000Z",
      minDate: "2010-01-15",
      maxDate: "2025-12-31"
    });

    const { result } = renderHook(() => useDbContext(), { wrapper });
    await waitFor(() => expect(result.current.isReady).toBe(true));

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockRefresh).toHaveBeenCalledWith(expect.any(Function));
    expect(result.current.isReady).toBe(true);
    expect(result.current.initResult).toMatchObject({
      status: "fresh",
      recordCount: 99,
      minDate: "2010-01-15",
      maxDate: "2025-12-31"
    });
  });

  it("refresh() sets error state when the worker rejects", async () => {
    mockInit.mockResolvedValue({
      status: "cached",
      recordCount: 10,
      lastFetched: null,
      minDate: null,
      maxDate: null
    });
    mockRefresh.mockRejectedValue(new Error("refresh failed"));

    const { result } = renderHook(() => useDbContext(), { wrapper });
    await waitFor(() => expect(result.current.isReady).toBe(true));

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.error?.message).toBe("refresh failed");
    expect(result.current.isReady).toBe(false);
  });
});
