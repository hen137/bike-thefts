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
  "block size-5 rounded-full bg-gray-600 shadow-lg dark:bg-gray-100 focus:outline-none";

export function HeatSlider({
  values,
  updateValues,
  commitValues
}: HeatSliderProps) {
  return (
    <Slider
      className="relative flex w-full touch-none select-none items-center"
      onValueChange={updateValues}
      onValueCommit={commitValues}
      max={MAX_RANGE}
      value={values}
      step={1}
    >
      <SliderTrack className="relative h-0.5 w-full grow rounded-full bg-gray-600 dark:bg-gray-100">
        <SliderRange className="absolute h-full rounded-full bg-blue-600 dark:bg-blue-400" />
      </SliderTrack>
      <SliderThumb className={thumbStyles} />
      <SliderThumb className={thumbStyles} />
    </Slider>
  );
}
