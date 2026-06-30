import Lock from "@/assets/lock.svg";

interface HeatLegendProps {
  className?: string;
}

export function MapHeatLegend({ className }: HeatLegendProps) {
  return (
    <div
      className={
        className ??
        "bg-white self-end rounded w-100 h-8 px-3 flex items-center justify-center pointer-events-auto"
      }
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
