import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { vi, afterEach } from "vitest";

// Vitest isn't running with `globals: true`, so RTL's automatic afterEach
// cleanup never registers. Wire it explicitly so renders don't leak into the
// next test (otherwise getByText finds duplicate nodes across tests).
afterEach(() => cleanup());

// jsdom lacks ResizeObserver, which Radix UI primitives (Slider, Tooltip,
// Dropdown) construct on mount. Provide a no-op implementation.
if (!("ResizeObserver" in globalThis)) {
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver =
    ResizeObserver as unknown as typeof globalThis.ResizeObserver;
}

// jsdom lacks matchMedia, which next-themes queries on mount.
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn()
  }));
}
