import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
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
      lastFetched: "2026-05-27T00:00:00.000Z"
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
        lastFetched: null
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
      lastFetched: "2026-05-27T00:00:00.000Z"
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

  it("worker reference is available from context after render", () => {
    const { result } = renderHook(() => useDbContext(), { wrapper });
    expect(result.current.worker).not.toBeNull();
  });
});
