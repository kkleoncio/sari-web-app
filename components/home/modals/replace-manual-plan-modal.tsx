"use client";

import { AlertTriangle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ReplaceManualPlanModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading?: boolean;
};

export function ReplaceManualPlanModal({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
}: ReplaceManualPlanModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden rounded-[28px] border border-white/45 bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(227,242,253,0.72),rgba(204,255,232,0.60))] p-0 shadow-[0_20px_60px_rgba(2,48,48,0.18)] backdrop-blur-2xl sm:max-w-lg">
        <div className="relative p-6 sm:p-7">
          <div className="pointer-events-none absolute -right-10 top-0 h-28 w-28 rounded-full bg-[#ccffe8]/50 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-24 w-24 rounded-full bg-[#E3F2FD]/60 blur-3xl" />

          <DialogHeader className="relative z-10 text-left">
            {/* <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/40 bg-[#FBE1AD] px-3 py-1.5 text-xs font-medium text-[#025a5a]">
              <Sparkles className="h-3.5 w-3.5" />
              Replace current manual plan
            </div> */}

            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#022b2b_0%,#033f3f_45%,#046d6d_90%,#0a8f8f_100%)] text-white shadow-[0_10px_24px_rgba(2,48,48,0.18)]">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <DialogTitle className="font-poppins text-[22px] font-semibold text-[#023030]">
              Generate a new meal plan?
            </DialogTitle>

            <DialogDescription className="font-helvetica mt-2 text-sm font-light leading-6 text-[#023030]/72">
              You already have manually added meals in your current plan.
              Generating a new meal plan will replace those meals.
            </DialogDescription>
          </DialogHeader>

          <div className="relative z-10 mt-5 rounded-2xl border border-white/35 bg-white/55 px-4 py-3 backdrop-blur-md">
            <p className="font-poppins text-sm font-medium text-[#023030]">
              Your manual entries will be cleared
            </p>
            <p className="font-helvetica mt-1 text-xs text-[#023030]/60">
              Continue only if you want SARI to generate a fresh set of meal
              options for your current budget.
            </p>
          </div>

          <DialogFooter className="relative z-10 mt-6 flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="font-poppins rounded-xl border-white/45 bg-white/60 text-[#023030] backdrop-blur-md hover:bg-white/80"
            >
              Keep manual plan
            </Button>

            <Button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="font-poppins rounded-xl bg-[linear-gradient(135deg,#022b2b_0%,#033f3f_45%,#046d6d_90%,#0a8f8f_100%)] text-white shadow-[0_12px_24px_rgba(2,48,48,0.18)] hover:opacity-95"
            >
              {loading ? "Generating..." : "Replace and generate"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}