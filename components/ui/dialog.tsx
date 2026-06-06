import * as React from "react";
import * as DialogPrimative from "@radix-ui/react-dialog";

function DialogRoot({
  ...props
}: React.ComponentProps<typeof DialogPrimative.Root>) {
  return <DialogPrimative.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimative.Trigger>) {
  return <DialogPrimative.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimative.Portal>) {
  return <DialogPrimative.Portal data-slot="dialog-portal" {...props} />;
}

function DialogOverlay({
  ...props
}: React.ComponentProps<typeof DialogPrimative.Overlay>) {
  return <DialogPrimative.Overlay data-slot="dialog-overlay" {...props} />;
}

function DialogContent({
  ...props
}: React.ComponentProps<typeof DialogPrimative.Content>) {
  return <DialogPrimative.Content data-slot="dialog-content" {...props} />;
}

function DialogTitle({
  ...props
}: React.ComponentProps<typeof DialogPrimative.Title>) {
  return <DialogPrimative.Title data-slot="dialog-title" {...props} />;
}

function DialogDescription({
  ...props
}: React.ComponentProps<typeof DialogPrimative.Description>) {
  return (
    <DialogPrimative.Description data-slot="dialog-description" {...props} />
  );
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimative.Close>) {
  return <DialogPrimative.Close data-slot="dialog-close" {...props} />;
}

export {
  DialogRoot,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose
};
