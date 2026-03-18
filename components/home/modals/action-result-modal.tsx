"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ActionResultModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  buttonLabel?: string;
  variant?: "success" | "error";
};

export function ActionResultModal({
  open,
  onOpenChange,
  title,
  message,
  buttonLabel = "Got it",
  variant = "success",
}: ActionResultModalProps) {
  const isSuccess = variant === "success";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden rounded-[30px] border border-white/50 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,251,251,0.96))] p-0 shadow-[0_24px_80px_rgba(2,48,48,0.16)] sm:max-w-lg">
        <div className="relative">
          <div className="pointer-events-none absolute -left-8 top-0 h-28 w-28 rounded-full bg-[#E3F2FD] blur-3xl" />
          <div className="pointer-events-none absolute -right-8 top-10 h-28 w-28 rounded-full bg-[#ccffe8] blur-3xl" />

          <DialogHeader className="relative px-6 pb-4 pt-6 sm:px-7">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/50 bg-white/70 px-3 py-1.5 text-xs font-medium text-[#025a5a] shadow-sm backdrop-blur-md">
                {isSuccess ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                <AlertCircle className="h-3.5 w-3.5" />
                )}
                {isSuccess ? "Action completed" : "Something went wrong"}
            </div>

            <DialogTitle className="mt-4 font-poppins text-2xl font-semibold tracking-tight text-[#023030]">
                {title}
            </DialogTitle>
            </DialogHeader>

          <div className="space-y-4 px-6 pb-6 sm:px-7">
            <div className="rounded-[24px] border border-white/40 bg-[linear-gradient(135deg,rgba(255,255,255,0.75),rgba(227,242,253,0.40),rgba(204,255,232,0.25))] p-4">
             <p className="font-poppins text-sm font-semibold text-[#023030]">
                {isSuccess ? "Plan status" : "Notice"}
                </p>
              <p className="mt-2 text-sm leading-6 text-[#023030]/68">
                {message}
              </p>
            </div>
          </div>

          <DialogFooter className="border-t border-[#edf3f3] bg-white/70 px-6 py-4 sm:px-7">
            <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                onClick={() => onOpenChange(false)}
                className="h-11 rounded-2xl bg-[linear-gradient(135deg,#022b2b_0%,#033f3f_45%,#046d6d_90%,#0a8f8f_100%)] px-5 text-white shadow-[0_10px_24px_rgba(2,48,48,0.16)] hover:opacity-95"
              >
                {buttonLabel}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}