import { DateRangePicker } from "./DateRangePicker";
import { HeatSlider } from "./HeatSlider";

interface DashboardDateRangeProps {
  className?: string;
  sliderValues: number[];
  setSliderValue: (values: number[]) => void;
  commitSliderValues: (values: number[]) => void;
}

export function DashboardDateRange({
  className,
  sliderValues,
  setSliderValue,
  commitSliderValues
}: DashboardDateRangeProps) {
  return (
    <div className={`${className} flex flex-col p-2`}>
      <h1 className="border-b px-2">Date Range</h1>
      <div className="flex flex-col justify-around grow px-8 py-5">
        {/* <div className="border-b" /> */}
        <DateRangePicker
          sliderValues={sliderValues}
          setSliderValue={setSliderValue}
          commitSliderValues={commitSliderValues}
        />
        <div className="w-full">
          <HeatSlider
            values={sliderValues}
            updateValues={setSliderValue}
            commitValues={commitSliderValues}
          />
        </div>
      </div>
    </div>
  );
}
