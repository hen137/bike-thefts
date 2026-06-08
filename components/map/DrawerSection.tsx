import { ReactNode } from "react";

interface DrawerSectionProps {
  className?: string;
  title: ReactNode | string;
  children?: ReactNode;
}

export function DrawerSection({
  className,
  title,
  children
}: DrawerSectionProps) {
  return (
    <div className={`${className}`}>
      <div className="flex items-center mb-2 gap-2">
        <span className="text-nowrap text-sm">{title}</span>
        <div className="h-px bg-gray-200 w-full translate-y-0.5" />
      </div>
      {children}
    </div>
  );
}
