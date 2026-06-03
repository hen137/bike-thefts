"use client";

interface SegmentedToggleProps {
  options: string[];
  activeIndex?: number;
  onChange?: (value: string, index: number) => void;
}

export function SegmentedToggle({
  options,
  activeIndex = 0,
  onChange
}: SegmentedToggleProps) {
  const active = activeIndex;

  const handleSelect = (index: number) => {
    onChange?.(options[index], index);
  };

  return (
    <div className="flex items-center rounded-md border border-slate-200 dark:border-slate-600 overflow-hidden w-full">
      {options.map((label, i) => (
        <div key={label} className="flex items-center flex-1">
          {i > 0 && (
            <div className="w-px self-stretch bg-slate-200 dark:bg-slate-600 shrink-0" />
          )}
          <button
            onClick={() => handleSelect(i)}
            className={`flex-1 px-2 py-1 text-xs font-medium transition-colors ${
              active === i
                ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
          >
            {label}
          </button>
        </div>
      ))}
    </div>
  );
}
