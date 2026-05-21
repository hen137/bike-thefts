import { MapProvider } from "@/contexts/MapContext";
import { MapMain, MapErrorBoundary, MapLoadingSpinner } from "@/components/map";
import { TileProvider } from "@/contexts/TileContext";

export default function Home() {
  return (
    <div className="relative w-full h-screen">
      <MapErrorBoundary>
        <MapProvider>
          <TileProvider>
            <MapMain />
            <MapLoadingSpinner />
          </TileProvider>
        </MapProvider>
      </MapErrorBoundary>
    </div>
  );
}
