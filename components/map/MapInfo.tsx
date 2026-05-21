"use client";

import { User, Settings, LogOut, Heart, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/hooks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * MapUser - User profile dropdown menu
 * Shows user info and navigation options
 * On mobile, also includes theme switcher
 */
export function MapInfo() {
  const router = useRouter();

  const { theme } = useTheme();

  const handleCloseMaps = () => {
    router.push("/");
  };

  return (
    <div className="absolute bottom-5 left-5 z-1000">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-full bg-white dark:bg-gray-800 p-1 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2">
            {/* <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center text-white font-semibold text-sm"> */}
            <Info
              className={
                theme === "dark"
                  ? "h-5 w-5 text-gray-200"
                  : "h-5 w-5 text-gray-600"
              }
            />
            {/* </div> */}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 z-[1100]">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                Toronto Bike Thefts
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                Built with Next.js and Leaflet
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                Bike Thefts Open Data from{" "}
                <a href="https://data.tps.ca/datasets/TorontoPS::bicycle-thefts-open-data/about">
                  Toronto Police Service
                </a>
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a
              href="https://github.com/hen137/bike-thefts"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center cursor-pointer"
            >
              <User className="mr-2 h-4 w-4" />
              <span>GitHub</span>
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Heart className="mr-2 h-4 w-4" />
            <span>Support</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={handleCloseMaps}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Close Maps</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
