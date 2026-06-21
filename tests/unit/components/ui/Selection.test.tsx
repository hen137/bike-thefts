import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Selection } from "@/components/ui/Selection";

const OPTIONS = [
  { mode: "a", text: "Option A" },
  { mode: "b", text: "Option B" }
] as const;

describe("Selection", () => {
  it("shows the text for the current mode", () => {
    render(<Selection mode="a" setMode={vi.fn()} options={[...OPTIONS]} />);
    expect(screen.getByText("Option A")).toBeInTheDocument();
  });

  it("calls setMode with the clicked option's mode", () => {
    const setMode = vi.fn();
    render(<Selection mode="a" setMode={setMode} options={[...OPTIONS]} />);
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("Option B"));
    expect(setMode).toHaveBeenCalledWith("b");
  });
});
