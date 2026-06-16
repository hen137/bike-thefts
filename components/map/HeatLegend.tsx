import Lock from "@/assets/lock.svg";

interface HeatLegendProps {
  className?: string;
}

export function HeatLegend({ className }: HeatLegendProps) {
  return (
    <div
      className={`${className} size-full px-3 flex items-center justify-center`}
    >
      {/* Scale */}
      <div className=" h-5/10 w-full items-center flex justify-between rounded-xs text-xs px-2 bg-linear-to-r from-blue-600 via-green-400 to-red-500">
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
