import type { ReactNode } from "react";
import { X } from "lucide-react";
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTrigger
} from "../ui/dialog";

interface DrawerDialogProps {
  trigger: ReactNode;
  content: ReactNode;
}

export function DrawerDialog({ trigger, content }: DrawerDialogProps) {
  return (
    <DialogRoot>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black/30 z-3000" />
        <DialogContent
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-2 bg-white dark:bg-slate-800 rounded-lg p-4 shadow-lg z-3001"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogClose className="absolute flex flex-col items-center size-6 right-2 top-2 p-1 group rounded-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-500 hover:bg-gray-300 dark:hover:bg-slate-500">
            <X className="size-6 text-gray-200 dark:text-gray-600 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
          </DialogClose>
          {content}
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  );
}
