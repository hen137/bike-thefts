import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import type * as React from "react";

// Stub Radix primitives as simple DOM pass-throughs so we can verify
// that each wrapper adds its data-slot without pulling in real Radix behavior.
vi.mock("@radix-ui/react-dialog", () => ({
  Root: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => (
    <div {...props}>{children}</div>
  ),
  Trigger: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLButtonElement> & {
    children?: React.ReactNode;
  }) => <button {...props}>{children}</button>,
  Portal: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  Overlay: (props: React.HTMLAttributes<HTMLDivElement>) => <div {...props} />,
  Content: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => (
    <div {...props}>{children}</div>
  ),
  Title: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement> & {
    children?: React.ReactNode;
  }) => <h2 {...props}>{children}</h2>,
  Description: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLParagraphElement> & {
    children?: React.ReactNode;
  }) => <p {...props}>{children}</p>,
  Close: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLButtonElement> & {
    children?: React.ReactNode;
  }) => <button {...props}>{children}</button>
}));

import {
  DialogRoot,
  DialogTrigger,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";

describe("dialog primitives — data-slot attributes", () => {
  it("DialogRoot sets data-slot=dialog", () => {
    const { container } = render(<DialogRoot />);
    expect(container.firstChild).toHaveAttribute("data-slot", "dialog");
  });

  it("DialogTrigger sets data-slot=dialog-trigger", () => {
    const { container } = render(<DialogTrigger />);
    expect(container.firstChild).toHaveAttribute("data-slot", "dialog-trigger");
  });

  it("DialogOverlay sets data-slot=dialog-overlay", () => {
    const { container } = render(<DialogOverlay />);
    expect(container.firstChild).toHaveAttribute("data-slot", "dialog-overlay");
  });

  it("DialogContent sets data-slot=dialog-content", () => {
    const { container } = render(<DialogContent />);
    expect(container.firstChild).toHaveAttribute("data-slot", "dialog-content");
  });

  it("DialogTitle sets data-slot=dialog-title", () => {
    const { container } = render(<DialogTitle>title</DialogTitle>);
    expect(container.firstChild).toHaveAttribute("data-slot", "dialog-title");
  });

  it("DialogDescription sets data-slot=dialog-description", () => {
    const { container } = render(
      <DialogDescription>description</DialogDescription>
    );
    expect(container.firstChild).toHaveAttribute(
      "data-slot",
      "dialog-description"
    );
  });

  it("DialogClose sets data-slot=dialog-close", () => {
    const { container } = render(<DialogClose>X</DialogClose>);
    expect(container.firstChild).toHaveAttribute("data-slot", "dialog-close");
  });

  it("each primitive forwards children", () => {
    const { getByText } = render(
      <DialogContent>
        <DialogTitle>My Title</DialogTitle>
        <DialogDescription>My Description</DialogDescription>
        <DialogClose>Close</DialogClose>
      </DialogContent>
    );
    expect(getByText("My Title")).toBeInTheDocument();
    expect(getByText("My Description")).toBeInTheDocument();
    expect(getByText("Close")).toBeInTheDocument();
  });
});
