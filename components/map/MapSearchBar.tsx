"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search } from "lucide-react";
import { useGeolocation } from "@/hooks";

// interface Country {
//   id: string;
//   name: string;
//   nameLong: string;
// }

/**
 * MapSearchBar - Google Maps-style expandable search bar with keyboard navigation
 *
 */
export function MapSearchBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const { locateUser, isLocating, isAvailable } = useGeolocation();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Fetch countries when expanded or search query changes
  useEffect(() => {
    if (!isExpanded) return;

    const fetchCountries = async () => {
      setLoading(true);
      try {
        // const query = searchQuery.trim();
        // const url = query
        //   ? `/api/countries/search?q=${encodeURIComponent(query)}`
        //   : "/api/countries/search";
        // const response = await fetch(url);
        // const data = await response.json();
        // setCountries(data);
      } catch {
        // setCountries([]);
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately when first expanded
    if (searchQuery === "") {
      fetchCountries();
    } else {
      // Debounce when searching
      const timer = setTimeout(fetchCountries, 150);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, isExpanded]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isExpanded) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          // setSelectedIndex((prev) =>
          //   prev < countries.length - 1 ? prev + 1 : prev,
          // );
          break;
        case "ArrowUp":
          e.preventDefault();
          // setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case "Enter":
          e.preventDefault();
          // if (selectedIndex >= 0 && selectedIndex < countries.length) {
          // do something
          // }
          break;
        case "Escape":
          e.preventDefault();
          setIsExpanded(false);
          setSelectedIndex(-1);
          searchInputRef.current?.blur();
          break;
      }
    },
    [isExpanded, selectedIndex]
  );

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth"
      });
    }
  }, [selectedIndex]);

  // Reset selected index when search query changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchQuery]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isExpanded && !target.closest(".search-container")) {
        setIsExpanded(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpanded]);

  // Handle locate me functionality
  const handleLocateMe = useCallback(() => {
    locateUser();
    setIsExpanded(false);
  }, [locateUser]);

  return (
    <div className="search-container justify-center">
      {/* Search Box - always visible */}
      <div
        className={`flex items-center gap-2 bg-white dark:bg-gray-700/80 backdrop-blur px-4 py-2 sm:py-3.5 shadow-lg transition-all duration-50 ${
          isExpanded ? "rounded-t-lg" : "rounded-full"
        } w-full sm:w-[360px]`}
      >
        {/* Search Input */}
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search on maps"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          onKeyDown={handleKeyDown}
          className="border-none bg-transparent text-base sm:text-sm text-gray-800 dark:text-gray-200 font-semibold outline-none placeholder:text-gray-500 dark:placeholder:text-gray-200 transition-all duration-300 w-full"
          aria-label="Search countries"
          aria-controls="search-results"
          aria-activedescendant={
            selectedIndex >= 0 ? `country-${selectedIndex}` : undefined
          }
          autoComplete="off"
        />
        <Search
          className="h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500"
          aria-hidden="true"
        />
        <div className="ml-2 flex items-center gap-2 border-l border-gray-200 dark:border-gray-700 pl-3">
          {/* Desktop: Show locate button */}
          <button
            onClick={handleLocateMe}
            disabled={!isAvailable || isLocating}
            className={`hidden sm:block text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded transition-all ${
              isLocating ? "animate-pulse" : ""
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-label="Show current location"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Dropdown Panel */}
      <div
        ref={resultsRef}
        id="search-results"
        role="listbox"
        className={`overflow-hidden bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ease-out ${
          isExpanded
            ? "max-h-[500px] opacity-100 rounded-b-lg"
            : "max-h-0 opacity-0"
        }`}
        aria-label="Search results"
      >
        <div className="overflow-y-auto max-h-[450px]">
          {loading && (
            <div
              className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
              role="status"
              aria-live="polite"
            >
              Searching...
            </div>
          )}

          {!loading && searchQuery && (
            <div
              className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
              role="status"
              aria-live="polite"
            >
              No results found for &quot;{searchQuery}&quot;
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
