import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";

// import { cn } from "@/lib/utils";

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectTrigger({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return <SelectPrimitive.Trigger data-slot="select-trigger" {...props} />;
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectIcon({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Icon>) {
  return <SelectPrimitive.Icon data-slot="select-icon" {...props} />;
}

function SelectPortal({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Portal>) {
  return <SelectPrimitive.Portal data-slot="select-portal" {...props} />;
}

function SelectContent({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return <SelectPrimitive.Content data-slot="select-content" {...props} />;
}

function SelectViewport({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Viewport>) {
  return <SelectPrimitive.Viewport data-slot="select-viewport" {...props} />;
}

function SelectItem({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return <SelectPrimitive.Item data-slot="select-item" {...props} />;
}

function SelectItemText({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ItemText>) {
  return <SelectPrimitive.ItemText data-slot="select-item-text" {...props} />;
}

function SelectItemIndicator({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ItemIndicator>) {
  return (
    <SelectPrimitive.ItemIndicator
      data-slot="select-item-indicator"
      {...props}
    />
  );
}

function SelectScrollUpButton({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      {...props}
    />
  );
}

function SelectScrollDownButton({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      {...props}
    />
  );
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectLabel({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return <SelectPrimitive.Label data-slot="select-label" {...props} />;
}

function SelectSeparator({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return <SelectPrimitive.Separator data-slot="select-separator" {...props} />;
}

function SelectArrow({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Arrow>) {
  return <SelectPrimitive.Arrow data-slot="select-arrow" {...props} />;
}

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectIcon,
  SelectPortal,
  SelectContent,
  SelectViewport,
  SelectItem,
  SelectItemText,
  SelectItemIndicator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
  SelectArrow
};
