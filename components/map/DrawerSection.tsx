import { ReactNode } from "react";

interface DrawerSectionProps {
  title: ReactNode | string;
  children?: ReactNode;
}

export function DrawerSection({ title, children }: DrawerSectionProps) {
  return (
    <>
      <div className="flex items-center py-2 gap-2">
        <span className="text-nowrap text-sm">{title}</span>
        <div className="h-px bg-gray-200 w-full" />
      </div>
      {children}
    </>
  );
}
