"use client";

import { useContext, useState } from "react";
import Image from "next/image";
import { SwatchBook } from "lucide-react";
import { useTheme } from "@/hooks";
import { TileContext } from "@/contexts";
import { TILE_PROVIDERS } from "@/constants/tile-providers";

/**
 * MapTileSwitcher - Tile layer switcher UI
 */
export function MapTileSwitcher() {
  const [isOpen, setIsOpen] = useState(false);

  const { theme } = useTheme();

  const tileContext = useContext(TileContext);

  if (tileContext === undefined) {
    throw new Error("MapTileSwitcher must be used within a TileProvider");
  }

  const { currentProviderId, setProviderId } = tileContext;

  // Map tile providers to display options with PNG previews
  const layerOptions = [
    {
      id: theme === "light" ? "osm" : "dark",
      label: "Default",
      image: theme === "light" ? "/map-basic.png" : "/map-dark.png",
      provider: TILE_PROVIDERS.find(
        (p) => p.id === (theme === "light" ? "osm" : "dark")
      )
    },
    {
      id: "satellite",
      label: "Satellite",
      image: "/map-satellite.jpg",
      provider: TILE_PROVIDERS.find((p) => p.id === "satellite")
    }
  ];

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="bottom-24 sm:bottom-8 left-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 z-[1000]">
      {/* Slide-out Panel - Above on mobile, Right on desktop */}
      <div
        className={`order-first sm:order-last flex flex-col items-center gap-2 transition-all duration-300 ease-out ${
          isOpen
            ? "opacity-100 translate-y-0 sm:translate-y-0 sm:translate-x-0"
            : "opacity-0 translate-y-4  sm:-translate-y-4 pointer-events-none"
        }`}
      >
        <div className="absolute sm:top-6 flex items-center gap-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-1 border border-gray-200 dark:border-gray-700">
          {layerOptions.map((layer) => (
            <button
              key={layer.id}
              onClick={() => layer.provider && setProviderId(layer.id)}
              disabled={!layer.provider}
              className={`flex flex-col items-center gap-1.5 px-2 sm:px-3 py-2 rounded-xl transition-all ${
                currentProviderId === layer.id
                  ? "bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500 dark:ring-blue-400"
                  : "hover:bg-gray-50 dark:hover:bg-gray-700"
              } ${!layer.provider ? "opacity-50 cursor-not-allowed" : ""}`}
              title={layer.label}
            >
              <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-lg overflow-hidden shadow-sm">
                <Image
                  src={layer.image}
                  alt={`${layer.label} map preview`}
                  fill
                  sizes="(max-width: 640px) 40px, 48px"
                  className="object-cover"
                />
              </div>
              <span className="text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300">
                {layer.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Tile Button */}
      <button
        onClick={toggleOpen}
        className="flex flex-col items-center gap-1 rounded-full bg-white dark:bg-gray-800 p-2 shadow-lg hover:bg-gray-50 transition-colors"
        aria-label="Choose Tile Themes"
      >
        <SwatchBook
          className={
            theme === "dark" ? "h-5 w-5 text-gray-200" : "h-5 w-5 text-gray-600"
          }
        />
      </button>
    </div>
    // </div>
  );
}
