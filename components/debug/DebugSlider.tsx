"use client";

import { Slider, SliderRange, SliderThumb, SliderTrack } from "@/components/ui";
import { DebugSliderProps } from "@/types/components";

export function DebugSlider({
  updateValue,
  defaultVal,
  max,
  increment = 5
}: DebugSliderProps) {
  const setValueWithHandler =
    (setter: (value: number) => void) => (tupledValue: [number]) => {
      setter(tupledValue[0]);
    };
  return (
    <Slider
      className="relative h-2 w-60 ml-5 flex items-center justify-center"
      defaultValue={[defaultVal]}
      // onValueCommit={updateValue}
      onValueChange={setValueWithHandler(updateValue)}
      step={increment}
      max={max}
    >
      <SliderTrack className="relative grow h-1 rounded-full bg-white ">
        <SliderRange className="absolute h-1 rounded-full w-full bg-gray-400" />
      </SliderTrack>
      <SliderThumb className="block size-3 rounded-full bg-gray-300 " />
    </Slider>
  );
}
