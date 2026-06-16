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
          className="fixed left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex flex-col bg-white rounded-xl p-4 shadow-lg z-3001"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogClose className="flex self-end items-center size-6 p-1 group rounded-sm bg-white border border-gray-300 hover:bg-gray-300 ">
            <X className="h-6 w-6 text-gray-200 group-hover:text-gray-700 " />
          </DialogClose>
          {content}
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  );
}
