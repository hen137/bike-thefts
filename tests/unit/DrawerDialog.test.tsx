import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DrawerDialog } from "@/components/map/DrawerDialog";

describe("DrawerDialog", () => {
  it("renders trigger content", () => {
    render(
      <DrawerDialog
        trigger={<button>open dialog</button>}
        content={<p>hidden content</p>}
      />
    );
    expect(
      screen.getByRole("button", { name: "open dialog" })
    ).toBeInTheDocument();
  });

  it("content not in DOM before trigger clicked", () => {
    render(
      <DrawerDialog
        trigger={<button>open</button>}
        content={<p>secret text</p>}
      />
    );
    expect(screen.queryByText("secret text")).not.toBeInTheDocument();
  });

  it("content visible after trigger clicked", () => {
    render(
      <DrawerDialog
        trigger={<button>open</button>}
        content={<p>revealed content</p>}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "open" }));
    expect(screen.getByText("revealed content")).toBeInTheDocument();
  });

  it("close button present when dialog is open", () => {
    render(
      <DrawerDialog trigger={<button>open</button>} content={<p>content</p>} />
    );
    fireEvent.click(screen.getByRole("button", { name: "open" }));
    expect(
      document.body.querySelector('[data-slot="dialog-close"]')
    ).toBeInTheDocument();
  });

  it("clicking close button dismisses dialog", () => {
    render(
      <DrawerDialog
        trigger={<button>open</button>}
        content={<p>modal text</p>}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "open" }));
    expect(screen.getByText("modal text")).toBeInTheDocument();

    const closeBtn = document.body.querySelector(
      '[data-slot="dialog-close"]'
    ) as HTMLElement;
    fireEvent.click(closeBtn);

    expect(screen.queryByText("modal text")).not.toBeInTheDocument();
  });

  it("renders overlay when dialog is open", () => {
    render(
      <DrawerDialog trigger={<button>open</button>} content={<p>content</p>} />
    );
    fireEvent.click(screen.getByRole("button", { name: "open" }));
    expect(
      document.body.querySelector('[data-slot="dialog-overlay"]')
    ).toBeInTheDocument();
  });

  it("content renders inside data-slot=dialog-content", () => {
    render(
      <DrawerDialog
        trigger={<button>open</button>}
        content={<span data-testid="inner">inner</span>}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "open" }));
    const content = document.body.querySelector('[data-slot="dialog-content"]');
    expect(content).not.toBeNull();
    expect(content!.querySelector('[data-testid="inner"]')).not.toBeNull();
  });
});
