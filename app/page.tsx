import { MapProvider } from "@/contexts/MapContext";
import { MapMain, MapErrorBoundary, MapLoadingSpinner } from "@/components/map";
import { TileProvider } from "@/contexts/TileContext";
import { NavBar } from "@/components/ui/NavBar";

export default function Home() {
  return (
    <div className="h-screen w-full flex flex-col gap-4 sm:h-185 sm:w-220 sm:absolute sm:bottom-5 sm:left-1/2 sm:-translate-x-1/2 lg:h-248 lg:w-450">
      <MapErrorBoundary>
        <MapProvider>
          <TileProvider>
            <NavBar />
            <MapMain />
            <MapLoadingSpinner />
          </TileProvider>
        </MapProvider>
      </MapErrorBoundary>
    </div>
  );
}
