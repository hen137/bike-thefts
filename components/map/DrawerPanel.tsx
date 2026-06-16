"use client";

import { useState } from "react";
import { Drawer } from "@base-ui/react";
import StackIcon from "tech-stack-icons";
import { DateRangePicker } from "./DateRangePicker";
import { HeatSlider } from "./HeatSlider";
import { CollapsibleSection } from "./CollapsibleSection";
import { SegmentedToggle } from "./SegmentedToggle";
import { WeightGraph } from "./WeightGraph";
import { DrawerDialog } from "./DrawerDialog";
import { DialogDescription, DialogTitle } from "../ui/dialog";
import { MapThemeSwitcher } from "./MapThemeSwitcher";
import { TechButton } from "./TechButton";
import { DrawerSection } from "./DrawerSection";
import { GitCommitHorizontal } from "lucide-react";

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
  weightFlipped: boolean;
  onWeightFlipToggle: () => void;
  histBins?: number[];
  poissonIndex: number;
  setPoissonIndex: (i: number) => void;
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
  weightFlipped,
  onWeightFlipToggle,
  histBins,
  poissonIndex,
  setPoissonIndex
}: DrawerPanelProps) {
  const [openSection, setOpenSection] = useState<SectionId | null>("reported");

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
          <Drawer.Popup className="fixed inset-y-0 right-0 w-80 z-1200 bg-white shadow-xl transition-transform duration-300 ease-in-out data-[starting-style]:translate-x-full data-[ending-style]:translate-x-full">
            <Drawer.Content className="h-full flex flex-col justify-between select-none px-2">
              {/* Header */}
              <div className="relative py-2">
                <MapThemeSwitcher className="absolute top-1/2 right-6 -translate-y-1/2 flex size-7 items-center justify-center rounded bg-white shadow-lg hover:bg-gray-50 transition-colors" />
                <DrawerDialog
                  trigger={
                    <div className="rounded-lg p-2 hover:bg-slate-50  transition-colors">
                      <Drawer.Title className="text-2xl font-bold">
                        TObikethefts
                      </Drawer.Title>
                    </div>
                  }
                  content={
                    <div className="flex flex-col gap-2 select-none">
                      {/* About */}
                      <DrawerSection
                        title={
                          <DialogTitle className="px-2 text-base">
                            About biketheftsTO
                          </DialogTitle>
                        }
                      >
                        <DialogDescription className="text-sm px-2 text-slate-500 ">
                          biketheftsTO is a tool for analyzing bike theft data
                          in Toronto.
                        </DialogDescription>
                      </DrawerSection>

                      {/* Statistics Disclosure */}
                      <DrawerSection
                        title={
                          <DialogTitle className="px-2 text-base">
                            Responsible Statistics
                          </DialogTitle>
                        }
                      >
                        <DialogDescription className="text-sm px-2 text-slate-500 ">
                          something
                        </DialogDescription>
                      </DrawerSection>

                      {/* Data Sources */}
                      <DrawerSection
                        title={
                          <DialogTitle className="px-2 text-base">
                            Data Sources
                          </DialogTitle>
                        }
                      >
                        <DialogDescription className="text-sm px-2 text-slate-500 ">
                          The data used in this tool is sourced from the City of
                          Toronto&apos;s open data portal.
                        </DialogDescription>
                      </DrawerSection>
                      <DialogDescription
                        asChild
                        className="text-center text-xs text-slate-500 "
                      >
                        <p>
                          Contains information licensed under the{" "}
                          <a
                            href="https://www.ontario.ca/page/open-government-licence-ontario"
                            target="_blank"
                            rel="liscense noreferrer"
                            className="underline hover:text-slate-700 "
                          >
                            Open Government Licence - Ontario
                          </a>
                        </p>
                      </DialogDescription>
                    </div>
                  }
                />
              </div>

              <div className="flex-1 overflow-y-auto">
                {/* Range Settings */}
                <div className="px-2">
                  <DrawerSection title="Date Range">
                    <div className="flex min-h-30 flex-col items-center justify-around px-2 border-t">
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
                  </DrawerSection>
                </div>

                {/* Report Thefts */}
                <CollapsibleSection
                  title="Visualize Reported Thefts"
                  open={openSection === "reported"}
                  onToggle={() => toggle("reported")}
                >
                  {/* Local Scaling */}
                  <div className="border-t flex flex-row items-center w-full gap-3 pt-2">
                    <p className="text-xs text-nowrap font-semibold text-slate-500 uppercase tracking-wide">
                      Local Scaling
                    </p>
                    <SegmentedToggle
                      options={["Municipal", "Neighbourhood"]}
                      activeIndex={byHood ? 1 : 0}
                      onChange={(_, i) => setByHood(i === 1)}
                    />
                  </div>

                  {/* Time Weighting */}
                  <div className="border-t flex flex-col gap-1 pt-2">
                    <div className="flex flex-row items-center justify-between gap-3">
                      <p className="text-xs text-nowrap font-semibold text-slate-500 uppercase tracking-wide">
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
                      flipped={weightFlipped}
                      onFlipToggle={onWeightFlipToggle}
                      histBins={histBins}
                    />
                  </div>
                </CollapsibleSection>
                {/* </div> */}

                {/* Predict Thefts */}
                <CollapsibleSection
                  title="Predict Future Thefts"
                  open={openSection === "predict"}
                  onToggle={() => toggle("predict")}
                >
                  {/* Poisson */}
                  <div className="border-t flex flex-row items-center w-full gap-3 pt-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
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

              {/* Footer */}
              <div className="py-2">
                <div className="mx-2 border-t" />
                <div className="p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <DrawerDialog
                    trigger={
                      <div className=" ">
                        <p className="text-lg font-semibold text-slate-700 ">
                          Worry less, ride more.
                        </p>
                        <p className="text-sm text-slate-500 ">
                          Statistical analysis tools for Toronto&apos;s bikers
                          and commuters because bike thefts suck
                        </p>
                      </div>
                    }
                    content={
                      <div className="flex flex-col gap-2 select-none">
                        {/* Community */}
                        <DrawerSection
                          title={
                            <DialogTitle className="px-2 text-base">
                              Toronto Biking Community
                            </DialogTitle>
                          }
                        >
                          <DialogDescription
                            asChild
                            className="text-sm px-2 text-slate-500 "
                          >
                            <ul className="list-disc list-inside">
                              <li>The Bike Lawyer</li>
                              <li>Bike Pirates</li>
                              <li>Bike Brigade</li>
                            </ul>
                          </DialogDescription>
                        </DrawerSection>

                        {/* Contributors */}
                        <DrawerSection
                          title={
                            <DialogTitle className="px-2 text-base">
                              Contributors
                            </DialogTitle>
                          }
                        >
                          <DialogDescription className="flex text-sm px-2 gap-x-2 text-slate-500 ">
                            <a
                              href="https://www.linkedin.com/in/henry-abramovich/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 text-slate-500 rounded bg-slate-900 hover:bg-slate-700"
                            >
                              Henry Abramovich
                            </a>
                            <a
                              href=""
                              className="px-2 py-1 text-slate-500 rounded bg-slate-900 hover:bg-slate-700"
                            >
                              Claude
                            </a>
                          </DialogDescription>
                        </DrawerSection>

                        {/* Special Thanks */}
                        <DrawerSection
                          title={
                            <DialogTitle className="px-2 text-base">
                              Special Thanks
                            </DialogTitle>
                          }
                        >
                          <DialogDescription className="flex text-sm px-2 gap-x-2 text-slate-500 ">
                            <a
                              href="https://www.linkedin.com/in/mhaya/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 text-slate-500 rounded bg-slate-900 hover:bg-slate-700"
                            >
                              Haya Mohamed
                            </a>
                          </DialogDescription>
                        </DrawerSection>

                        {/* Source and Version */}
                        <div className="flex gap-5 text-nowrap">
                          <div>
                            <DrawerSection
                              title={
                                <DialogTitle className="px-2 text-base">
                                  Source
                                </DialogTitle>
                              }
                            >
                              <DialogDescription className="text-sm px-2 text-slate-500 ">
                                <a
                                  href="https://github.com/hen137/bike-thefts"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-slate-700 "
                                >
                                  hen137/biketheftsTO
                                </a>
                              </DialogDescription>
                            </DrawerSection>
                          </div>
                          <div className="w-full">
                            <DrawerSection
                              title={
                                <DialogTitle className="px-2 text-base">
                                  Version
                                </DialogTitle>
                              }
                            >
                              <DialogDescription className="flex gap-2 items-center text-sm px-2 text-slate-500 hover:text-slate-700 ">
                                <GitCommitHorizontal className="size-5" />
                                <a
                                  href=""
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  COMMIT HASH
                                </a>
                              </DialogDescription>
                            </DrawerSection>
                          </div>
                        </div>

                        {/* Tech Stack */}
                        <DrawerSection
                          title={
                            <DialogTitle className="px-2 text-base">
                              Built With
                            </DialogTitle>
                          }
                        >
                          <DialogDescription
                            asChild
                            className="text-sm px-2 text-slate-500 "
                          >
                            <div className="flex flex-row gap-4">
                              <div className="flex flex-col gap-1">
                                <TechButton
                                  title="NextJS"
                                  icon={
                                    <StackIcon
                                      name="nextjs2"
                                      className="w-3 h-3"
                                    />
                                  }
                                  link="https://nextjs.org/"
                                />
                                <TechButton
                                  title="React"
                                  icon={
                                    <StackIcon
                                      name="react"
                                      className="w-3 h-3"
                                    />
                                  }
                                  link="https://reactjs.org/"
                                />
                                <TechButton
                                  title="Tailwind CSS"
                                  icon={
                                    <StackIcon
                                      name="tailwindcss"
                                      className="w-3 h-3"
                                    />
                                  }
                                  link="https://tailwindcss.com/"
                                />
                                <TechButton
                                  title="SQLite"
                                  icon={
                                    <StackIcon
                                      name="sqlite"
                                      className="w-3 h-3"
                                    />
                                  }
                                  link="https://www.sqlite.org/index.html"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <TechButton
                                  title="Leaflet"
                                  icon={
                                    "https://raw.githubusercontent.com/Leaflet/Leaflet/refs/heads/main/docs/docs/images/favicon.ico"
                                  }
                                  link="https://leafletjs.com/"
                                />
                                <TechButton
                                  title="Leaflet.heat"
                                  icon={
                                    "https://raw.githubusercontent.com/Leaflet/Leaflet/refs/heads/main/docs/docs/images/favicon.ico"
                                  }
                                  link="https://github.com/Leaflet/Leaflet.heat"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <TechButton
                                  title="Radix UI"
                                  icon={
                                    <StackIcon
                                      name="radixui"
                                      className="w-3 h-3"
                                    />
                                  }
                                  link="https://www.radix-ui.com/"
                                />
                                <TechButton
                                  title="Base UI"
                                  icon={
                                    <StackIcon
                                      name="baseui"
                                      className="w-3 h-3"
                                    />
                                  }
                                  link="https://baseui.com/"
                                />
                                <TechButton
                                  title="shadcn/ui"
                                  icon={
                                    <StackIcon
                                      name="shadcnui"
                                      className="w-3 h-3"
                                    />
                                  }
                                  link="https://ui.shadcn.com/"
                                />
                                <TechButton
                                  title="Lucide"
                                  icon="https://raw.githubusercontent.com/lucide-icons/lucide/423afc6d03c1fb1b86090aa14b13f7f2fa6296e4/docs/public/logo-icon.svg"
                                  link="https://lucide.dev/"
                                />
                              </div>
                            </div>
                          </DialogDescription>
                        </DrawerSection>
                      </div>
                    }
                  />
                </div>
              </div>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
