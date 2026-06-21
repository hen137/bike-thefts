import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDataSettings } from "@/hooks/useDataSettings";
import { DataProvider } from "@/contexts/DataContext";

describe("useDataSettings", () => {
  it("throws when used outside a DataProvider", () => {
    expect(() => renderHook(() => useDataSettings())).toThrow(
      "useDataSettings must be used within a DataProvider"
    );
  });

  it("returns the DataContext value when used inside a DataProvider", () => {
    const { result } = renderHook(() => useDataSettings(), {
      wrapper: DataProvider
    });
    expect(result.current.byHood).toBe(true);
    expect(typeof result.current.setByHood).toBe("function");
  });
});
