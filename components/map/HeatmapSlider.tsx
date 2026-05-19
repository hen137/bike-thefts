"use client";

import { Slider, SliderTrack, SliderRange, SliderThumb } from "../ui/slider";
import { Tooltip } from "./Tooltip";

interface HeatmapSliderProps {
  updateValues: (values: number[]) => void;
  sliderDates: {startDate: string, endDate: string}
}

const MAX_RANGE = 1000;

export function HeatmapSlider({ updateValues, sliderDates }: HeatmapSliderProps) {
  return (
    <Slider
      className=" flex h-130 w-9 items-center justify-center"
      onValueChange={updateValues}
      orientation="vertical"
      max={MAX_RANGE}
      defaultValue={[1000, 500]}
      minStepsBetweenThumbs={MAX_RANGE / 10}
      step={1}
    >
      <SliderTrack className="relative h-full w-1 bg-gray-600 dark:bg-gray-100 rounded-full">
        <SliderRange className="absolute w-1 bg-blue-600 dark:bg-blue-400 rounded-full" />
        {/* <Tooltip /> */}
        <Tooltip tooltipDates={sliderDates}>
          {/* <SliderThumb className="absolute -left-2 -top-2.5 block rounded-full shadow-lg size-5 bg-gray-600 dark:bg-gray-100" /> */}
        </Tooltip>
      </SliderTrack>
    </Slider>
  );
}
