import { ChevronDown } from "lucide-react";

interface DashboardToggleProps {
  className?: string;
}

export function DashboardToggle({ className }: DashboardToggleProps) {
  return (
    <div className={`${className} flex items-center justify-center`}>
      <ChevronDown />
    </div>
  );
}
