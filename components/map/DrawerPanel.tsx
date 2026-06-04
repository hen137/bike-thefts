"use client";

import { useState } from "react";
import { Drawer } from "@base-ui/react";
import { DateRangePicker } from "./DateRangePicker";
import { HeatSlider } from "./HeatSlider";
import { CollapsibleSection } from "./CollapsibleSection";
import { SegmentedToggle } from "./SegmentedToggle";
import { WeightGraph } from "./WeightGraph";

type SectionId = "reported" | "predict";

interface DrawerPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sliderValues: number[];
  setSliderValue: (values: number[]) => void;
  commitSliderValues: (values: number[]) => void;
  byHood: boolean;
  setByHood: (val: boolean) => void;
  timeWeighting: string;
  setTimeWeighting: (val: string) => void;
  weightKInv: number;
  setWeightKInv: (k: number) => void;
  weightKInvQuad: number;
  setWeightKInvQuad: (k: number) => void;
  histBins?: number[];
}

export function DrawerPanel({
  open,
  onOpenChange,
  sliderValues,
  setSliderValue,
  commitSliderValues,
  byHood,
  setByHood,
  timeWeighting,
  setTimeWeighting,
  weightKInv,
  setWeightKInv,
  weightKInvQuad,
  setWeightKInvQuad,
  histBins
}: DrawerPanelProps) {
  const [openSection, setOpenSection] = useState<SectionId | null>("reported");
  const [poissonIndex, setPoissonIndex] = useState(0);

  const toggle = (id: SectionId) =>
    setOpenSection((prev) => (prev === id ? null : id));

  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      modal={false}
      disablePointerDismissal
      swipeDirection="right"
    >
      <Drawer.Portal>
        <Drawer.Viewport>
          <Drawer.Popup className="fixed inset-y-0 right-0 w-80 z-1200 bg-white dark:bg-slate-800 shadow-xl transition-transform duration-300 ease-in-out data-[starting-style]:translate-x-full data-[ending-style]:translate-x-full">
            <Drawer.Content className="h-full flex flex-col justify-between select-none">
              <div>
                {/* Header */}
                <div className="border-b-2 p-2">
                  <div className=" rounded-lg p-2 group hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <Drawer.Title className="text-2xl font-bold">
                      TObikethefts
                    </Drawer.Title>
                    <Drawer.Description className="text-sm text-slate-500 dark:text-slate-400 whitespace-pre-wrap">
                      <span className="group-hover:hidden">
                        for Toronto&apos;s bikers and commuters, because bike
                        thefts suck
                      </span>
                      <span className="hidden group-hover:inline ">
                        version: 1.0.0
                      </span>
                    </Drawer.Description>
                  </div>
                </div>
                {/* Range Settings */}
                <div className="flex min-h-[120px] flex-col items-center justify-around gap-2 border-b-2 px-4 pb-4 pt-2">
                  <DateRangePicker
                    sliderValues={sliderValues}
                    setSliderValue={setSliderValue}
                    commitSliderValues={commitSliderValues}
                  />
                  <div className="w-full">
                    <HeatSlider
                      values={sliderValues}
                      updateValues={setSliderValue}
                      commitValues={commitSliderValues}
                    />
                  </div>
                </div>
                {/* Data Modes */}
                <div className="overflow-y-auto border-b-2">
                  <CollapsibleSection
                    title="Reported Thefts"
                    open={openSection === "reported"}
                    onToggle={() => toggle("reported")}
                  >
                    <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        Local Scaling
                      </p>
                      <SegmentedToggle
                        options={["Municipal", "Neighbourhood"]}
                        activeIndex={byHood ? 1 : 0}
                        onChange={(_, i) => setByHood(i === 1)}
                      />
                      <div className="col-span-2 border-t border-slate-200 dark:border-slate-600" />
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
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
                      k={
                        timeWeighting === "InvQuad"
                          ? weightKInvQuad
                          : weightKInv
                      }
                      onKChange={
                        timeWeighting === "InvQuad"
                          ? setWeightKInvQuad
                          : setWeightKInv
                      }
                      histBins={histBins}
                    />
                  </CollapsibleSection>
                  <CollapsibleSection
                    title="Predict Future Thefts"
                    open={openSection === "predict"}
                    onToggle={() => toggle("predict")}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        Poisson
                      </p>
                      <SegmentedToggle
                        options={["Frequentist", "Bayesian"]}
                        activeIndex={poissonIndex}
                        onChange={(_, i) => setPoissonIndex(i)}
                      />
                    </div>
                  </CollapsibleSection>
                </div>
              </div>
              {/* Footer */}
              <div className="border-t-2 p-2">
                <div className="rounded-lg p-2 group hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <p>Less guessing. More Riding.</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Contains information licensed under the{" "}
                    <a
                      href="https://www.ontario.ca/page/open-government-licence-ontario"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-slate-700 dark:hover:text-slate-300"
                    >
                      Open Government Licence - Ontario
                    </a>
                  </p>
                </div>
              </div>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
