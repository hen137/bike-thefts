"use client";

import { useState } from "react";
import { Drawer } from "@base-ui/react";
import { DateRangePicker } from "./DateRangePicker";
import { HeatSlider } from "./HeatSlider";
import { CollapsibleSection } from "./CollapsibleSection";
import { SegmentedToggle } from "./SegmentedToggle";

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
  setTimeWeighting
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
            <Drawer.Content className="h-full flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="border-b-2 p-4">
                  <Drawer.Title className="text-lg font-bold">
                    Toronto Bike Thefts
                  </Drawer.Title>
                  <Drawer.Description>
                    <a href="https://data.tps.ca/datasets/TorontoPS::bicycle-thefts-open-data/about">
                      Bike Thefts Open Data from{" "}
                    </a>
                    Toronto Police Service
                  </Drawer.Description>
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
              <div className="border-t-2 p-4">
                {/* Footer */}
                <div className="flex flex-col justify-center items-center">
                  <p>
                    <a href="/about">About</a>
                  </p>
                  <div>
                    <a href="/contribute">Contribute</a> •{" "}
                    <a href="https://github.com/hen137/bike-thefts">Github</a>
                  </div>
                </div>
              </div>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
