"use client";

import { useState } from "react";
import { Drawer } from "@base-ui/react";
import { DateRangePicker } from "./DateRangePicker";
import { HeatSlider } from "./HeatSlider";
import { CollapsibleSection } from "./CollapsibleSection";
import { SegmentedToggle } from "./SegmentedToggle";
import { WeightGraph } from "./WeightGraph";
import { DrawerDialog } from "./DrawerDialog";
import { DialogDescription, DialogTitle } from "../ui/dialog";
import { MapThemeSwitcher } from "./MapThemeSwitcher";

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
                <div className="relative border-b-2 p-2">
                  <MapThemeSwitcher className="absolute top-1/2 right-6 -translate-y-1/2 flex size-7 items-center justify-center rounded bg-white dark:bg-slate-700 shadow-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors" />
                  <DrawerDialog
                    trigger={
                      <div className=" rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <Drawer.Title className="text-2xl font-bold">
                          biketheftsTO
                        </Drawer.Title>
                      </div>
                    }
                    content={
                      <div className="flex flex-col gap-2">
                        {/* About */}
                        <DialogTitle className="px-2">
                          About biketheftsTO
                        </DialogTitle>
                        <DialogDescription className="text-sm px-2 text-slate-500 dark:text-slate-400">
                          <p>
                            biketheftsTO is a tool for analyzing bike theft data
                            in Toronto.
                          </p>
                        </DialogDescription>

                        <div className="border-t-2" />

                        {/* Statistics Disclosure */}
                        <DialogTitle className="px-2">
                          Responsible Statistics
                        </DialogTitle>
                        <DialogDescription className="text-sm px-2 text-slate-500 dark:text-slate-400">
                          <p>something</p>
                        </DialogDescription>

                        <div className="border-t-2" />

                        {/* Data Sources */}
                        <DialogTitle className="px-2">Data Sources</DialogTitle>
                        <DialogDescription className="text-sm px-2 text-slate-500 dark:text-slate-400">
                          <p>
                            The data used in this tool is sourced from the City
                            of Toronto&apos;s open data portal.
                          </p>
                        </DialogDescription>
                        <DialogDescription className="text-center text-xs text-slate-500 dark:text-slate-400">
                          <p>
                            Contains information licensed under the{" "}
                            <a
                              href="https://www.ontario.ca/page/open-government-licence-ontario"
                              target="_blank"
                              rel="liscense noreferrer"
                              className="underline hover:text-slate-700 dark:hover:text-slate-300"
                            >
                              Open Government Licence - Ontario
                            </a>
                          </p>
                        </DialogDescription>
                      </div>
                    }
                  />
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

                {/* Report Thefts */}
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

                  {/* Predict Thefts */}
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
                <DrawerDialog
                  trigger={
                    <div className="rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                      <p className="text-md font-semibold text-slate-700 dark:text-slate-300">
                        worry less, ride more.
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        statistical analysis tools for Toronto&apos;s bikers and
                        commuters, because bike thefts suck
                      </p>
                    </div>
                  }
                  content={
                    <div className="flex flex-col gap-2">
                      {/* Community */}
                      <DialogTitle className="px-2">
                        Toronto&apos;s Bike Community
                      </DialogTitle>
                      <DialogDescription className="text-sm px-2 text-slate-500 dark:text-slate-400">
                        <ul className="list-disc list-inside">
                          <li>The Bike Lawyer</li>
                          <li>Bike Pirates</li>
                          <li>Bike Brigade</li>
                        </ul>
                      </DialogDescription>

                      <div className="border-t-2" />

                      {/* Contributors */}
                      <DialogTitle className="px-2">Contributors</DialogTitle>
                      <DialogDescription className="text-sm px-2 text-slate-500 dark:text-slate-400">
                        <ul className="list-disc list-inside">
                          <li>Henry Abramovich</li>
                          <li>Claude</li>
                        </ul>
                      </DialogDescription>

                      <div className="border-t-2" />

                      {/* Special Thanks */}
                      <DialogTitle className="px-2">Special Thanks</DialogTitle>
                      <DialogDescription className="text-sm px-2 text-slate-500 dark:text-slate-400">
                        <ul className="list-disc list-inside">
                          <li>Haya Mohammed - Muse</li>
                        </ul>
                      </DialogDescription>

                      <div className="border-t-2" />

                      {/* Source and Version */}
                      <div className="flex flex-row gap-4">
                        <div>
                          <DialogTitle className="px-2">Source</DialogTitle>
                          <DialogDescription className="text-sm px-2 text-slate-500 dark:text-slate-400">
                            hen137/biketheftsTO
                          </DialogDescription>
                        </div>
                        <div>
                          <DialogTitle className="px-2">Version</DialogTitle>
                          <DialogDescription className="text-sm px-2 text-slate-500 dark:text-slate-400">
                            COMMIT HASH
                          </DialogDescription>
                        </div>
                      </div>

                      <div className="border-t-2" />

                      {/* Tech Stack */}
                      <DialogTitle className="px-2">Built With</DialogTitle>
                      <DialogDescription className="text-sm px-2 text-slate-500 dark:text-slate-400">
                        <div className="flex flex-row gap-4">
                          <ul>
                            <li>NextJS</li>
                            <li>React</li>
                            <li>Tailwind CSS</li>
                          </ul>
                          <ul>
                            <li>Leaflet</li>
                            <li>Leaflet.heat</li>
                          </ul>
                          <ul>
                            <li>Radix UI</li>
                            <li>Base UI</li>
                            <li>shadcn/ui</li>
                            <li>Lucide</li>
                          </ul>
                        </div>
                      </DialogDescription>
                    </div>
                  }
                />
              </div>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
