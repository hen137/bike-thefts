"use client";

import { Drawer } from "@base-ui/react";
import { DateRangePicker } from "./DateRangePicker";
import { HeatSlider } from "./HeatSlider";

interface DrawerPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sliderValues: number[];
  setSliderValue: (values: number[]) => void;
  commitSliderValues: (values: number[]) => void;
}

export function DrawerPanel({
  open,
  onOpenChange,
  sliderValues,
  setSliderValue,
  commitSliderValues
}: DrawerPanelProps) {
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
                  <Drawer.Description>Panel Description</Drawer.Description>
                </div>
                {/* Range Settings */}
                <div className="flex min-h-[120px] flex-col items-center justify-around gap-2 border-b-2 px-4 py-4">
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
                {/* Reported Thefts */}
                <div className="border-b-2 p-4">Modes</div>
                {/* Theft Predictions */}
              </div>
              <div className="border-t-2 p-4">
                {/* Footer */}
                <div className="flex flex-col justify-center items-center">
                  <p>About</p>
                  <div>Contribute • Github</div>
                </div>
              </div>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
