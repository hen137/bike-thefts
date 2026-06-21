"use client";

import { useEffect, useState } from "react";
import { Plus, Minus, Minimize2, Maximize2 } from "lucide-react";
import { useMapControls } from "@/hooks";

interface MapControlsProps {
  className?: string;
}

export function MapControls({ className }: MapControlsProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { map, zoomIn, zoomOut, toggleFullscreen, resetView } =
    useMapControls();

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <div
      className={
        className ??
        "absolute left-4 bottom-4 pointer-events-auto flex flex-col gap-2 z-1000 w-8"
      }
    >
      {/* Zoom Controls */}
      <div className="flex flex-col overflow-hidden rounded-lg bg-white shadow-lg">
        <button
          onClick={zoomIn}
          disabled={!map}
          className="flex w-full aspect-square items-center justify-center border-b border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Zoom in"
          aria-label="Zoom in"
        >
          <Plus className="h-5 w-5 text-gray-600" />
        </button>
        <button
          onClick={zoomOut}
          disabled={!map}
          className="flex w-full aspect-square items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Zoom out"
          aria-label="Zoom out"
        >
          <Minus className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Reset View Button */}
      <button
        onClick={resetView}
        disabled={!map}
        className="flex w-full aspect-square items-center justify-center rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Reset view"
        aria-label="Reset view to default"
      >
        <svg
          className="h-5 w-5 text-gray-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
          <path d="M3 21v-5h5" />
        </svg>
      </button>

      {/* Fullscreen Button */}
      <button
        onClick={toggleFullscreen}
        className="flex w-full aspect-square items-center justify-center rounded bg-white  hover:bg-gray-50"
        title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      >
        {isFullscreen ? (
          <Minimize2 className="h-5 w-5 text-gray-600" />
        ) : (
          <Maximize2 className="h-5 w-5 text-gray-600" />
        )}
      </button>
    </div>
  );
}
