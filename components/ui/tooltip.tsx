"use client";

import * as React from "react";
import * as TooltipPrimative from "@radix-ui/react-tooltip";

// import { cn } from "@/lib/utils";

function TooltipProvider({
  ...props
}: React.ComponentProps<typeof TooltipPrimative.Provider>) {
  return <TooltipPrimative.Provider data-slot="tooltip-provider" {...props} />;
}

function TooltipRoot({
  ...props
}: React.ComponentProps<typeof TooltipPrimative.Root>) {
  return <TooltipPrimative.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimative.Trigger>) {
  return <TooltipPrimative.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipPortal({
  ...props
}: React.ComponentProps<typeof TooltipPrimative.Portal>) {
  return <TooltipPrimative.Portal data-slot="tooltip-portal" {...props} />;
}

function TooltipContent({
  ...props
}: React.ComponentProps<typeof TooltipPrimative.Content>) {
  return <TooltipPrimative.Content data-slot="tooltip-content" {...props} />;
}

function TooltipArrow({
  ...props
}: React.ComponentProps<typeof TooltipPrimative.Arrow>) {
  return <TooltipPrimative.Arrow data-slot="tooltip-arrow" {...props} />;
}

export {
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipPortal,
  TooltipContent,
  TooltipArrow,
};
