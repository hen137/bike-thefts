import { Select } from "radix-ui";
import { ChevronDown } from "lucide-react";
interface SelectProps<Mode> {
  mode: Mode;
  setMode: (val: Mode) => void;
  options: { mode: Mode; text: string }[];
}

export function Selection<Mode extends string>({
  mode,
  setMode,
  options
}: SelectProps<Mode>) {
  return (
    <Select.Root value={mode} onValueChange={(val) => setMode(val as Mode)}>
      <Select.Trigger className="flex items-center border text-xs flex-between gap-2 rounded px-2 py-1 text-slate-600 hover:bg-slate-100 transition-colors">
        <Select.Value />
        <Select.Icon className=" border-slate-500">
          <ChevronDown className="size-3" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="z-1200 rounded border border-slate-200 bg-white shadow-lg">
          <Select.Viewport className="p-1">
            {options.map((option) => (
              <Select.Item
                key={option.mode}
                value={option.mode}
                className="flex items-center justify-between gap-2 rounded px-2 py-1 text-xs text-slate-600  outline-none cursor-default data-[highlighted]:bg-slate-100"
              >
                <Select.ItemText>{option.text}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
