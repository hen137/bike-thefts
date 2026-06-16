"use client";

import { useContext, useState } from "react";
import Image from "next/image";
import { SwatchBook } from "lucide-react";
import { useTheme } from "@/hooks";
import { TileContext } from "@/contexts";
import { TILE_PROVIDERS } from "@/constants/tile-providers";

interface MapTileSwitcherProps {
  buttonClassName?: string;
}

export function MapTileSwitcher({ buttonClassName }: MapTileSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { theme } = useTheme();

  const tileContext = useContext(TileContext);

  if (tileContext === undefined) {
    throw new Error("MapTileSwitcher must be used within a TileProvider");
  }

  const { currentProviderId, setProviderId } = tileContext;

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

  const triggerClass =
    buttonClassName ??
    "flex flex-col items-center gap-1 rounded-full bg-white p-2 shadow-lg hover:bg-gray-50 transition-colors";

  return (
    <div className="relative">
      {/* Slide-out panel */}
      <div
        className={`absolute top-full right-0 mt-2 transition-all duration-300 ease-out ${
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-2 bg-white rounded-2xl shadow-xl p-1 border border-gray-200 ">
          {layerOptions.map((layer) => (
            <button
              key={layer.id}
              onClick={() => layer.provider && setProviderId(layer.id)}
              disabled={!layer.provider}
              className={`flex flex-col items-center gap-1.5 px-2 sm:px-3 py-2 rounded-xl transition-all ${
                currentProviderId === layer.id
                  ? "bg-blue-50 ring-2 ring-blue-500 "
                  : "hover:bg-gray-50 "
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
              <span className="text-[10px] sm:text-xs font-medium text-gray-700 ">
                {layer.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={triggerClass}
        aria-label="Choose Tile Themes"
      >
        <SwatchBook
          className={
            theme === "dark" ? "h-5 w-5 text-gray-200" : "h-5 w-5 text-gray-600"
          }
        />
      </button>
    </div>
  );
}
