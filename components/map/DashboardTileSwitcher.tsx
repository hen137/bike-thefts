import { ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemText,
  SelectPortal,
  SelectTrigger,
  SelectValue,
  SelectViewport
} from "../ui/select";
import { useContext, useState } from "react";
import Image from "next/image";
import { useTheme } from "@/hooks";
import { TILE_PROVIDERS } from "@/constants/tile-providers";
import { TileContext } from "@/contexts";

interface DashboardTileSwitcherProps {
  className?: string;
}

type TileMode = "default" | "satellite";

export function DashboardTileSwitcher({
  className
}: DashboardTileSwitcherProps) {
  const { theme } = useTheme();

  const [mode, setMode] = useState<TileMode>("default");

  const tileContext = useContext(TileContext);

  if (tileContext === undefined) {
    throw new Error("MapTileSwitcher must be used within a TileProvider");
  }

  const { setProviderId } = tileContext;

  const tileOptions = [
    {
      id: theme === "light" ? "osm" : "dark",
      label: "Default",
      image: theme === "light" ? "/map-basic.png" : "/map-dark.png"
    },
    {
      id: "satellite",
      label: "Satellite",
      image: "/map-satellite.jpg"
    }
  ];

  return (
    <div className={`${className} flex flex-col p-2`}>
      <div className="flex items-center gap-2">
        <Select
          value={mode}
          onValueChange={(val) => {
            const prov =
              val === "default" ? (theme === "light" ? "osm" : "dark") : val;
            if (TILE_PROVIDERS.find((p) => p.id === prov)) {
              setMode(val as TileMode);
              setProviderId(prov);
            }
          }}
        >
          <SelectTrigger className="flex items-center border text-sm flex-between gap-2 rounded px-2 py-1 text-slate-600 hover:bg-slate-100 transition-colors">
            <SelectValue />
            <SelectIcon className="border-slate-500">
              <ChevronDown className="size-3" />
            </SelectIcon>
          </SelectTrigger>
          <SelectPortal>
            <SelectContent className="z-1200 rounded border border-slate-200 bg-white shadow-lg">
              <SelectViewport className="p-1">
                {tileOptions.map((layer) => (
                  <SelectItem
                    key={layer.label}
                    value={layer.label.toLowerCase()}
                    className="flex items-center justify-between gap-2 rounded px-2 py-1 text-sm text-slate-600 outline-none cursor-default data-[highlighted]:bg-slate-100 "
                  >
                    <SelectItemText>{layer.label}</SelectItemText>
                  </SelectItem>
                ))}
              </SelectViewport>
            </SelectContent>
          </SelectPortal>
        </Select>
      </div>

      <div className="flex justify-center items-center h-full">
        {tileOptions.map(
          (layer) =>
            mode === layer.label.toLowerCase() && (
              <div
                key={layer.id}
                className="relative size-14 rounded overflow-hidden shadow-sm"
              >
                <Image
                  src={layer.image}
                  alt={`${layer.label} map preview`}
                  fill
                  sizes="(max-width: 640px) 40px, 48px"
                  className="object-cover"
                />
              </div>
            )
        )}
      </div>
    </div>
  );
}
