"use client";

import { HeatmapSliderProps } from "@/types/components";
import {
  Slider,
  SliderTrack,
  SliderRange,
  SliderThumb,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
  TooltipArrow
} from "@/components/ui";

const MAX_RANGE = 1000;

const thumbStyles =
  "absolute -left-2 -top-2.5 block rounded-full shadow-lg size-5 bg-gray-600 dark:bg-gray-100";

const contentStyles =
  "w-30 h-15 bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-100";

export function HeatmapSlider({
  updateValues,
  sliderDates
}: HeatmapSliderProps) {
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
        <TooltipProvider delayDuration={300}>
          <TooltipRoot>
            <TooltipTrigger asChild>
              <SliderThumb className={thumbStyles} />
            </TooltipTrigger>
            <TooltipContent
              side="left"
              className={contentStyles}
              sticky="always"
            >
              <TooltipArrow height={10} className="" />
              {sliderDates.startDate}
            </TooltipContent>
          </TooltipRoot>
          <TooltipRoot>
            <TooltipTrigger asChild>
              <SliderThumb className={thumbStyles} />
            </TooltipTrigger>
            <TooltipContent
              side="left"
              className={contentStyles}
              sticky="always"
            >
              <TooltipArrow height={10} className="" />
              {sliderDates.endDate}
            </TooltipContent>
          </TooltipRoot>
        </TooltipProvider>
      </SliderTrack>
    </Slider>
  );
}
