import { SliderThumb } from "../ui/slider";
import {
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
  TooltipArrow,
} from "../ui/tooltip";
import { ReactNode } from "react";

interface TooltipProps {
  children?: ReactNode;
  tooltipDates: {startDate: string, endDate: string}
}

const thumbStyles =
  "absolute -left-2 -top-2.5 block rounded-full shadow-lg size-5 bg-gray-600 dark:bg-gray-100";

const contentStyles =
  "w-30 h-15 bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-100";


export function Tooltip({
  children,
  tooltipDates
  //   thumb,
}: TooltipProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <TooltipRoot>
        <TooltipTrigger asChild>
          <SliderThumb className={thumbStyles} />
          {/* {children} */}
        </TooltipTrigger>
        <TooltipContent side="left" className={contentStyles} sticky="always">
          <TooltipArrow height={10} className="" />
          {tooltipDates.startDate}
        </TooltipContent>
      </TooltipRoot>
      <TooltipRoot>
        <TooltipTrigger asChild>
          <SliderThumb className={thumbStyles} />
          {/* {children} */}
        </TooltipTrigger>
        <TooltipContent side="left" className={contentStyles} sticky="always">
          <TooltipArrow height={10} className="" />
          {tooltipDates.endDate}
        </TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  );
}
