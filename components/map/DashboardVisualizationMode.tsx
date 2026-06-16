"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectIcon,
  SelectPortal,
  SelectContent,
  SelectViewport,
  SelectItem,
  SelectItemText
} from "../ui/select";
import { SegmentedToggle } from "./SegmentedToggle";
import { WeightGraph } from "./WeightGraph";

type VisualizationMode = "reported" | "predict";

interface DashboardVisualizationModeProps {
  className?: string;
  byHood: boolean;
  setByHood: (val: boolean) => void;
  timeWeighting: string;
  setTimeWeighting: (val: string) => void;
  weightKInv: number;
  setWeightKInv: (k: number) => void;
  weightKInvQuad: number;
  setWeightKInvQuad: (k: number) => void;
  weightFlipped: boolean;
  onWeightFlipToggle: () => void;
  histBins?: number[];
  poissonIndex: number;
  setPoissonIndex: (i: number) => void;
}

export function DashboardVisualizationMode({
  className,
  byHood,
  setByHood,
  timeWeighting,
  setTimeWeighting,
  weightKInv,
  setWeightKInv,
  weightKInvQuad,
  setWeightKInvQuad,
  weightFlipped,
  onWeightFlipToggle,
  histBins,
  poissonIndex,
  setPoissonIndex
}: DashboardVisualizationModeProps) {
  const [mode, setMode] = useState<VisualizationMode>("reported");

  return (
    <div className={`${className} flex flex-col p-2`}>
      <div className="flex items-center gap-2">
        <Select
          value={mode}
          onValueChange={(val) => setMode(val as VisualizationMode)}
        >
          <SelectTrigger className="flex items-center border text-sm flex-between gap-2 rounded px-2 py-1 text-slate-600 hover:bg-slate-100 transition-colors">
            <SelectValue />
            <SelectIcon className=" border-slate-500">
              <ChevronDown className="size-3" />
            </SelectIcon>
          </SelectTrigger>
          <SelectPortal>
            <SelectContent className="z-1200 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg">
              <SelectViewport className="p-1">
                <SelectItem
                  value="reported"
                  className="flex items-center justify-between gap-2 rounded px-2 py-1 text-sm text-slate-600 dark:text-slate-300 outline-none cursor-default data-[highlighted]:bg-slate-100 dark:data-[highlighted]:bg-slate-700"
                >
                  {/* <SelectItemIndicator>
                    <Check className="size-3" />
                  </SelectItemIndicator> */}
                  <SelectItemText>Reported Thefts</SelectItemText>
                </SelectItem>
                <SelectItem
                  value="predict"
                  className="flex items-center justify-between gap-2 rounded px-2 py-1 text-sm text-slate-600 dark:text-slate-300 outline-none cursor-default data-[highlighted]:bg-slate-100 dark:data-[highlighted]:bg-slate-700"
                >
                  {/* <SelectItemIndicator>
                    <Check className="size-3" />
                  </SelectItemIndicator> */}
                  <SelectItemText>Predict Thefts</SelectItemText>
                </SelectItem>
              </SelectViewport>
            </SelectContent>
          </SelectPortal>
        </Select>
      </div>

      <div className="flex flex-col justify-around grow px-8 py-5">
        {mode === "reported" ? (
          <>
            {/* Local Scaling */}
            <div className="flex flex-row items-center w-full gap-3">
              <p className="text-xs text-nowrap font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Local Scaling
              </p>
              <SegmentedToggle
                options={["Municipal", "Neighbourhood"]}
                activeIndex={byHood ? 1 : 0}
                onChange={(_, i) => setByHood(i === 1)}
              />
            </div>

            {/* Time Weighting */}
            <div className="flex flex-col gap-1">
              <div className="flex flex-row items-center justify-between gap-3">
                <p className="text-xs text-nowrap font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Time Weighting
                </p>
                <SegmentedToggle
                  options={["None", "Lin", "Inv", "InvQuad"]}
                  activeIndex={["None", "Lin", "Inv", "InvQuad"].indexOf(
                    timeWeighting
                  )}
                  onChange={(val) => setTimeWeighting(val)}
                />
              </div>
              <WeightGraph
                mode={timeWeighting}
                k={timeWeighting === "InvQuad" ? weightKInvQuad : weightKInv}
                onKChange={
                  timeWeighting === "InvQuad"
                    ? setWeightKInvQuad
                    : setWeightKInv
                }
                flipped={weightFlipped}
                onFlipToggle={onWeightFlipToggle}
                histBins={histBins}
              />
            </div>
          </>
        ) : (
          /* Poisson */
          <div className="flex flex-row items-center w-full gap-3">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Poisson
            </p>
            <SegmentedToggle
              options={["Frequentist", "Bayesian"]}
              activeIndex={poissonIndex}
              onChange={(_, i) => setPoissonIndex(i)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
