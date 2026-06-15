import Lock from "@/assets/lock.svg";

interface HeatLegendProps {
  className?: string;
}

export function HeatLegend({ className }: HeatLegendProps) {
  return (
    <div
      className={`${className} size-full pl-3 pr-3  flex flex-col justify-center bg-white dark:bg-slate-700 shadow-lg`}
    >
      {/* Scale */}
      <div className=" h-5/10 w-full items-center flex flex-row justify-between ml-0.5 mr-0.5 text-xs pl-2 pr-2 bg-linear-to-r from-blue-600 via-green-400 to-red-500">
        {/* <p>Less</p> */}
        <Lock className="size-3 rotate-225 text-white translate-y-px" />

        {/* <p>More</p> */}
        <div className="flex translate-y-px">
          <Lock className="size-3 rotate-225 text-white" />
          <Lock className="size-3 rotate-225 text-white" />
          <Lock className="size-3 rotate-225 text-white" />
        </div>
      </div>
    </div>
  );
}
