import { MapProvider } from "@/contexts/MapContext";
import { MapMain, MapErrorBoundary } from "@/components/map";
import { TileProvider } from "@/contexts/TileContext";
import { NavBar } from "@/components/ui/NavBar";
import { DataProvider } from "@/contexts/DataContext";
import { DateRangeGraph } from "@/components/data/DateRangeGraph";

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
              <div className="flex gap-4 bg-slate-200 justify-between h-90">
                <DateRangeGraph className="bg-slate-100 basis-1/2 text-center" />
                <div className="bg-slate-100 basis-1/2 text-center">
                  rankings
                </div>
              </div>

              {/* Time Charts */}
              <div className="bg-slate-200 flex gap-4"></div>

              {/* Neighbourhood Breakdown Table */}
              <div className="bg-slate-200 text-center h-120">
                hood breakdown table
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
