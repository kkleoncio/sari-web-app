"use client";

import { AlertCircle, Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type GenerationErrorModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
  onAdjustBudget?: () => void;
};

export function GenerationErrorModal({
  open,
  onOpenChange,
  message,
  onAdjustBudget,
}: GenerationErrorModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden border-white/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(244,250,250,0.98))] p-0 shadow-[0_18px_50px_rgba(2,48,48,0.18)] sm:max-w-md">
        <div className="relative">
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#ccffe8]/50 blur-3xl" />
          <div className="pointer-events-none absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-[#E3F2FD]/70 blur-3xl" />

          <div className="relative px-6 pb-6 pt-8 sm:px-7 sm:pb-7">
            <DialogHeader className="items-center text-center">
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/50 bg-white/70 shadow-[0_10px_24px_rgba(2,48,48,0.08)] backdrop-blur-md">
                <AlertCircle className="h-6 w-6 text-[#026d6d]" />
              </div>

              <DialogTitle className="font-poppins text-2xl font-semibold tracking-tight text-[#025a5a]">
                Sorry!
              </DialogTitle>

              <DialogDescription className="mt-2 max-w-sm text-center font-helvetica text-sm leading-6 text-[#023030]/68">
                {message}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-6 flex-col gap-2 sm:flex-row sm:justify-center">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="font-poppins rounded-xl border-white/40 bg-white/55 text-[#023030] backdrop-blur-md hover:bg-white/80"
              >
                <X className="mr-2 h-4 w-4" />
                Close
              </Button>

              <Button
                onClick={() => {
                  onOpenChange(false);
                  onAdjustBudget?.();
                }}
                className="font-poppins rounded-xl bg-[linear-gradient(135deg,#022b2b_0%,#033f3f_45%,#046d6d_90%,#0a8f8f_100%)] text-white shadow-[0_12px_24px_rgba(2,48,48,0.16)] hover:opacity-95"
              >
                <Wallet className="mr-2 h-4 w-4" />
                Adjust budget
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}