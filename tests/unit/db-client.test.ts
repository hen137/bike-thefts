import { describe, it, expect, vi, beforeEach } from "vitest";
import type { DbWorker } from "@/types/db";

// Mock Comlink before any imports
vi.mock("comlink", () => ({
  wrap: vi.fn((w) => ({
    __worker: w,
    init: vi.fn(),
    queryHeatmap: vi.fn(),
    refresh: vi.fn()
  })),
  expose: vi.fn()
}));

// Mock global Worker — must be a class/constructor, not an arrow fn
const MockWorker = vi.fn(function (this: unknown) {
  (this as { terminate: () => void }).terminate = vi.fn();
});
vi.stubGlobal("Worker", MockWorker);

// getDbWorker is re-imported each test via resetModules
let getDbWorker: () => ReturnType<
  (typeof import("@/lib/db-client"))["getDbWorker"]
>;

describe("getDbWorker", () => {
  beforeEach(async () => {
    vi.resetModules();
    // Re-stub Worker after resetModules clears the global state
    vi.stubGlobal("Worker", MockWorker);
    MockWorker.mockClear();
    const mod = await import("@/lib/db-client");
    getDbWorker = mod.getDbWorker;
  });

  it("creates a Worker on first call", () => {
    getDbWorker();
    expect(MockWorker).toHaveBeenCalledTimes(1);
  });

  it("returns same instance on second call (singleton)", () => {
    const first = getDbWorker();
    const second = getDbWorker();
    // Worker constructor called only once despite two getDbWorker() calls
    expect(MockWorker).toHaveBeenCalledTimes(1);
    expect(first).toBe(second);
  });

  it("returned object has init, queryHeatmap, and refresh methods", () => {
    const worker = getDbWorker();
    expect(typeof (worker as unknown as DbWorker).init).toBe("function");
    expect(typeof (worker as unknown as DbWorker).queryHeatmap).toBe(
      "function"
    );
    expect(typeof (worker as unknown as DbWorker).refresh).toBe("function");
  });
});
