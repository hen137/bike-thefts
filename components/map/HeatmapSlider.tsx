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

const stepSize = Math.round(MAX_RANGE / 144);

export function HeatmapSlider({
  initialValues,
  updateValues,
  commitValues,
  sliderDates
}: HeatmapSliderProps) {
  return (
    <Slider
      className=" flex h-130 w-9 items-center justify-center"
      onValueChange={updateValues}
      onValueCommit={commitValues}
      orientation="vertical"
      max={MAX_RANGE}
      defaultValue={initialValues}
      minStepsBetweenThumbs={stepSize * 2}
      step={stepSize}
    >
      <SliderTrack className="relative h-full w-1 bg-gray-600 dark:bg-gray-100 rounded-full">
        <SliderRange className="absolute w-1 bg-blue-600 dark:bg-blue-400 rounded-full" />
        <TooltipProvider delayDuration={300}>
          <TooltipRoot>
            <TooltipTrigger asChild>
              <SliderThumb className={thumbStyles} />
            </TooltipTrigger>
            <TooltipContent side="left" className={contentStyles}>
              <TooltipArrow height={10} className="" />
              {`${sliderDates.startDate?.month ? sliderDates.startDate?.month + 1 : ""}-${sliderDates.startDate?.year}`}
            </TooltipContent>
          </TooltipRoot>
          <TooltipRoot>
            <TooltipTrigger asChild>
              <SliderThumb className={thumbStyles} />
            </TooltipTrigger>
            <TooltipContent side="left" className={contentStyles}>
              <TooltipArrow height={10} className="" />
              {`${sliderDates.endDate?.month ? sliderDates.endDate?.month + 1 : ""}-${sliderDates.endDate?.year}`}
            </TooltipContent>
          </TooltipRoot>
        </TooltipProvider>
      </SliderTrack>
    </Slider>
  );
}
