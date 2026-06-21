"use client";

import { useContext } from "react";
import { DataContext } from "@/contexts/DataContext";

export function useDataSettings() {
  const context = useContext(DataContext);

  if (context === undefined)
    throw new Error("useDataSettings must be used within a DataProvider");

  return context;
}
