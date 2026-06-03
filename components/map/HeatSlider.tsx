// import { HeatmapSliderProps } from "@/types/components";
import {
  Slider,
  SliderTrack,
  SliderRange,
  SliderThumb
  //   TooltipProvider,
  //   TooltipRoot,
  //   TooltipTrigger,
  //   TooltipContent,
  //   TooltipArrow
} from "@/components/ui";

interface HeatSliderProps {
  values: number[];
  updateValues: (values: number[]) => void;
  commitValues: (values: number[]) => void;
}

const MAX_RANGE = 1000;

const thumbStyles =
  "block rounded-full shadow-lg size-5 bg-gray-600 dark:bg-gray-100";

export function HeatSlider({
  values,
  updateValues,
  commitValues
}: HeatSliderProps) {
  return (
    <Slider
      className="flex h-1 w-full items-center justify-center"
      onValueChange={updateValues}
      onValueCommit={commitValues}
      max={MAX_RANGE}
      value={values}
      step={1}
    >
      <SliderTrack className="relative h-1 w-full bg-gray-600 dark:bg-gray-100 rounded-full">
        <SliderRange className="absolute w-full bg-blue-600 dark:bg-blue-400 rounded-full" />
        <SliderThumb className={thumbStyles} />
        <SliderThumb className={thumbStyles} />
      </SliderTrack>
    </Slider>
  );
}
