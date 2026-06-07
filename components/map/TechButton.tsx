import { ReactNode } from "react";
import Image from "next/image";

interface TechButtonProps {
  title: string;
  icon: ReactNode | string;
  link?: string;
}

export function TechButton({ title, icon, link }: TechButtonProps) {
  return (
    <a
      className="flex items-center gap-1 px-2 py-1 text-slate-500 dark:text-slate-400 rounded bg-slate-900 hover:bg-slate-700"
      href={link}
      target="_blank"
      rel="noopener noreferrer"
    >
      {typeof icon === "string" ? (
        <Image src={icon} alt={title} width={12} height={12} />
      ) : (
        icon
      )}
      {title}
    </a>
  );
}
