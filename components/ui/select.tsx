import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";

// import { cn } from "@/lib/utils";

function SelectRoot({
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

// function SelectItemIndicator({
//   ...props
// }: React.ComponentProps<typeof SelectPrimitive.ItemIndicator>) {
//   return (
//     <SelectPrimitive.ItemIndicator
//       data-slot="select-item-indicator"
//       {...props}
//     />
//   );
// }

// function SelectScrollUpButton({
//   ...props
// }: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
//   return (
//     <SelectPrimitive.ScrollUpButton
//       data-slot="select-scroll-up-button"
//       {...props}
//     />
//   );
// }

// function SelectScrollDownButton({
//   ...props
// }: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
//   return (
//     <SelectPrimitive.ScrollDownButton
//       data-slot="select-scroll-down-button"
//       {...props}
//     />
//   );
// }

// function SelectGroup({
//   ...props
// }: React.ComponentProps<typeof SelectPrimitive.Group>) {
//   return <SelectPrimitive.Group data-slot="select-group" {...props} />;
// }

// function SelectLabel({
//   ...props
// }: React.ComponentProps<typeof SelectPrimitive.Label>) {
//   return <SelectPrimitive.Label data-slot="select-label" {...props} />;
// }

// function SelectSeparator({
//   ...props
// }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
//   return <SelectPrimitive.Separator data-slot="select-separator" {...props} />;
// }

// function SelectArrow({
//   ...props
// }: React.ComponentProps<typeof SelectPrimitive.Arrow>) {
//   return <SelectPrimitive.Arrow data-slot="select-arrow" {...props} />;
// }

interface SelectProps<Mode> {
  mode: Mode;
  setMode: (val: Mode) => void;
  options: { mode: Mode; text: string }[];
}

export function Select<Mode extends string>({
  mode,
  setMode,
  options
}: SelectProps<Mode>) {
  return (
    <SelectRoot value={mode} onValueChange={(val) => setMode(val as Mode)}>
      <SelectTrigger className="flex items-center border text-xs flex-between gap-2 rounded px-2 py-1 text-slate-600 hover:bg-slate-100 transition-colors">
        <SelectValue />
        <SelectIcon className=" border-slate-500">
          <ChevronDown className="size-3" />
        </SelectIcon>
      </SelectTrigger>
      <SelectPortal>
        <SelectContent className="z-1200 rounded border border-slate-200 bg-white shadow-lg">
          <SelectViewport className="p-1">
            {options.map((option) => (
              <SelectItem
                key={option.mode}
                value={option.mode}
                className="flex items-center justify-between gap-2 rounded px-2 py-1 text-xs text-slate-600  outline-none cursor-default data-[highlighted]:bg-slate-100"
              >
                <SelectItemText>{option.text}</SelectItemText>
              </SelectItem>
            ))}
          </SelectViewport>
        </SelectContent>
      </SelectPortal>
    </SelectRoot>
  );
}
