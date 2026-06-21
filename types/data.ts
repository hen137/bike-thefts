import { HeatRow } from "./db";
import { MonthYear } from "./map";
import { HistBin } from "@/lib/utils/heatmap";

export type VisualizationMode = "reported" | "predict";

export type DateMode = "30days" | "90days" | "365days" | "YTD" | "custom";

export interface DataContextValue {
  byHood: boolean;
  setByHood: (byHood: boolean) => void;
  // dateMode: DateMode;
  // setDateMode: (mode: DateMode) => void;
  queryRange: {
    startDate: MonthYear;
    endDate: MonthYear;
  };
  setQueryRange: (queryRange: {
    startDate: MonthYear;
    endDate: MonthYear;
  }) => void;
  rows: HeatRow[];
  setRows: (rows: HeatRow[]) => void;
  weightFlipped: boolean;
  setWeightFlipped: (weightFlipped: boolean) => void;
  histBins: HistBin[];
  setHistBins: (histBins: HistBin[]) => void;
  timeWeighting: string;
  setTimeWeighting: (timeWeighting: string) => void;
  weightKInv: number;
  setWeightKInv: (weightInv: number) => void;
  weightKInvQuad: number;
  setWeightKInvQuad: (weightInv: number) => void;
}
