"use client";

import { useContext } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { TileContext } from "@/contexts/TileContext";

/**
 * MapThemeSwitcher - Toggle between light and dark themes
 * Also switches the base map tile layer accordingly
 */
export function MapThemeSwitcher() {
  const { theme, toggleTheme, mounted } = useTheme();

  const tileContext = useContext(TileContext);

  if (tileContext === undefined) {
    throw new Error("MapThemeSwitcher must be used within a TileProvider");
  }

  const { currentProviderId, setProviderId } = tileContext;

  const handleToggleTheme = () => {
    if (currentProviderId === "osm" || currentProviderId === "dark")
      setProviderId(theme === "light" ? "dark" : "osm");
    toggleTheme();
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <button className="rounded-full bg-white p-2 shadow-lg">
        <div className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      onClick={handleToggleTheme}
      className="rounded-full bg-white dark:bg-gray-800 p-2 shadow-lg hover:bg-gray-50 transition-colors"
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      }
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-gray-200" />
      ) : (
        <Moon className="h-5 w-5 text-gray-600" />
      )}
    </button>
  );
}
