"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { TileContext } from "@/contexts/TileContext";
import { useContext } from "react";

/**
 * MapThemeSwitcher - Toggle between light and dark themes
 * Also switches the base map tile layer accordingly
 */
export function MapThemeSwitcher() {
  const { theme, toggleTheme, mounted } = useTheme();

  const tileProps = useContext(TileContext);

  if (!tileProps) return;

  const { selectedProviderId, onProviderChange } = tileProps;

  const handleToggleTheme = () => {
    if (selectedProviderId === "osm" || selectedProviderId === "dark")
      onProviderChange(theme === "light" ? "dark" : "osm");
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
