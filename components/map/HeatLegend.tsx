// const LEGEND_DIVISION = 3;

export function HeatLegend() {
  return (
    <div className="h-15 w-100 pl-3 pr-3  flex flex-col justify-center bg-white dark:bg-slate-700 shadow-lg">
      {/* Qualitative Range */}
      <div className="flex flex-row justify-between ml-0.5 mr-0.5 text-xs">
        <p>Less</p>
        <p>More</p>
      </div>

      {/* Scale */}
      <div className=" h-3/10 w-full items-center bg-linear-to-r from-blue-600 via-green-400 to-red-500">
        {/* Ticks */}
        {/* <div className="flex flex-row justify-evenly text-xs"><p>|</p><p>|</p></div> */}
      </div>

      {/* Quantitative Range */}
      <div className="flex flex-row justify-between ml-1 mr-1 text-xs">
        <p>0</p>
        <p>1</p>
      </div>
    </div>
  );
}
