import { MapProvider } from "@/contexts/MapContext";
import { MapMain, MapErrorBoundary, MapLoadingSpinner } from "@/components/map";

export default function Home() {
  // const data = await getBikeTheftData();
  // console.log(data.length);
  return (
    <div className="relative w-full h-screen">
      <MapErrorBoundary>
        <MapProvider>
          <MapMain />
          <MapLoadingSpinner />
        </MapProvider>
      </MapErrorBoundary>
    </div>
  );
}
