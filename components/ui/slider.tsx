import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

// import { cn } from "@/lib/utils";

function Slider({
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  return <SliderPrimitive.Root data-slot="slider" {...props} />;
}

function SliderTrack({
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Track>) {
  return <SliderPrimitive.Track data-slot="slider-track" {...props} />;
}

function SliderRange({
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Range>) {
  return <SliderPrimitive.Range data-slot="slider-range" {...props} />;
}

function SliderThumb({
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Thumb>) {
  return <SliderPrimitive.Thumb data-slot="slider-thumb" {...props} />;
}

export { Slider, SliderTrack, SliderRange, SliderThumb };
