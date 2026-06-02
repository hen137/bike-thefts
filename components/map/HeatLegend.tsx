// const LEGEND_DIVISION = 3;

export function HeatLegend() {
  return (
    <div className="h-10 w-100 pl-3 pr-3  flex flex-col justify-center bg-white dark:bg-slate-700 shadow-lg">
      {/* Scale */}
      <div className=" h-5/10 w-full items-center flex flex-row justify-between ml-0.5 mr-0.5 text-xs pl-2 pr-2 bg-linear-to-r from-blue-600 via-green-400 to-red-500">
        <p>Less</p>
        <p>More</p>
      </div>
    </div>
  );
}
