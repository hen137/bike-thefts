"use client";

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  open: boolean;
  onToggle: () => void;
}

export function CollapsibleSection({
  title,
  children,
  open,
  onToggle
}: CollapsibleSectionProps) {
  return (
    <div className="border-b-2 last:border-b-0">
      <button
        onClick={onToggle}
        className={`flex w-full items-center gap-2 px-4 py-3 text-left ${open && "border-b-2"} hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors`}
        aria-expanded={open}
      >
        <svg
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? "rotate-90" : "rotate-0"}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span className="font-medium text-sm">{title}</span>
      </button>
      {open && (
        <div className="px-4 pb-3 pt-2 text-sm text-slate-700 dark:text-slate-300">
          {children}
        </div>
      )}
    </div>
  );
}
