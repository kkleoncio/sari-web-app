"use client";

import * as React from "react";
import { LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type LogoutConfirmationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function LogoutConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
}: LogoutConfirmationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden rounded-[30px] border border-white/50 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,251,251,0.96))] p-0 shadow-[0_24px_80px_rgba(2,48,48,0.18)]">
        <div className="relative">
          <div className="pointer-events-none absolute -right-10 top-0 h-28 w-28 rounded-full bg-[#ccffe8]/40 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-24 w-24 rounded-full bg-[#E3F2FD]/60 blur-3xl" />

          <div className="relative px-6 pb-6 pt-7 sm:px-7">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#022b2b_0%,#033f3f_45%,#046d6d_90%,#0a8f8f_100%)] text-white shadow-[0_10px_24px_rgba(2,48,48,0.16)]">
              <LogOut className="h-5 w-5" />
            </div>

            <DialogHeader className="space-y-2 text-left">
              <DialogTitle className="font-poppins text-[22px] font-semibold text-[#023030]">
                Log out of SARI?
              </DialogTitle>

              <DialogDescription className="font-helvetica text-sm leading-6 text-[#023030]/68">
                You’re about to end your current session. You can always log in
                again anytime.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5 rounded-2xl border border-white/40 bg-[linear-gradient(135deg,rgba(255,255,255,0.64),rgba(227,242,253,0.32),rgba(204,255,232,0.18))] p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 text-[#026d6d]">
                  <ShieldCheck className="h-4 w-4" />
                </div>

                <div>
                  <p className="font-poppins text-sm font-semibold text-[#023030]">
                    Before you go
                  </p>
                  <p className="font-helvetica mt-1 text-sm leading-6 text-[#023030]/65">
                    Make sure your current work is saved. Logging out will clear
                    your active session on this device.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6 flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="font-poppins rounded-xl border-white/45 bg-white/65 text-[#023030] backdrop-blur-md hover:bg-white"
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={onConfirm}
                className="font-poppins rounded-xl bg-[linear-gradient(135deg,#022b2b_0%,#033f3f_45%,#046d6d_90%,#0a8f8f_100%)] text-white shadow-[0_10px_24px_rgba(2,48,48,0.14)] hover:opacity-95"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Yes, log me out
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}