import { MapProvider } from "@/contexts/MapContext";
import { MapMain, MapErrorBoundary } from "@/components/map";
import { TileProvider } from "@/contexts/TileContext";
import { NavBar } from "@/components/ui/NavBar";
import { DataProvider } from "@/contexts/DataContext";
import { DateRangeGraph } from "@/components/data/DateRangeGraph";
import { RankingsChart } from "@/components/data/RankingsChart";
import { DayOfWeekChart } from "@/components/data/DayOfWeekChart";
import { HoodBreakdownTable } from "@/components/data/HoodBreakdownTable";

export default function Home() {
  return (
    <div className="w-full flex flex-col absolute px-16 gap-6 sm:left-1/2 sm:-translate-x-1/2">
      <MapErrorBoundary>
        <MapProvider>
          <TileProvider>
            <NavBar />
            <DataProvider>
              {/* Map */}
              <MapMain />
              {/* <MapLoadingSpinner /> */}

              {/* Date Range Histogram & Rankings */}
              <div className="flex gap-4 justify-between h-90">
                <DateRangeGraph className="bg-slate-100 basis-1/2 py-2 px-4 flex flex-col" />
                <RankingsChart className="bg-slate-100 basis-1/2 text-center flex flex-col py-2 px-4" />
              </div>

              {/* Time Charts */}
              <div className="bg-slate-200 flex gap-4 h-90">
                <DayOfWeekChart className="bg-slate-100 basis-full py-2 px-4 flex flex-col" />
              </div>

              {/* Neighbourhood Breakdown Table */}
              <div className="bg-slate-200 text-center h-120 overflow-auto">
                <HoodBreakdownTable />
              </div>

              {/* footer */}
              <div className="bg-slate-200 text-center">footer</div>
            </DataProvider>
          </TileProvider>
        </MapProvider>
      </MapErrorBoundary>
    </div>
  );
}
