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
    <div className="gap-1">
      <button
        onClick={onToggle}
        className={`flex w-full items-center gap-2 mb-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors`}
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
        <span className="font-medium text-sm text-nowrap">{title}</span>
        <div className="h-px bg-gray-200 w-full translate-y-0.5" />
      </button>

      {open && (
        <div className="flex flex-col items-center gap-y-2 pb-2 text-sm text-slate-700 dark:text-slate-300">
          {children}
        </div>
      )}
      {/* <div
        style={{
          display: "grid",
          gridTemplateRows: open ? "1fr" : "0fr",
          transition: "grid-template-rows 300ms ease"
        }}
      >
        <div style={{ overflow: "hidden", minHeight: 0 }}>
          <div className="py-2 text-sm text-slate-700 dark:text-slate-300">
            {children}
          </div>
        </div>
      </div> */}
    </div>
  );
}
