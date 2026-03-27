"use client";

import * as React from "react";
import { MoonStar, Wallet, UtensilsCrossed, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { Meal } from "@/app/home/types";

type ConcludeDayModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget: number;
  totalCost: number;
  remaining: number;
  meals: Meal[];
  planLabel?: string;
  onDone?: () => void;
};

function formatPeso(n: number) {
  return `PHP ${n}`;
}

function getDailyInsight(budget: number, totalCost: number, remaining: number) {
  if (budget <= 0 || totalCost <= 0) {
    return "You don’t have a completed meal plan yet for today.";
  }

  if (remaining === 0) {
    return "Perfect budgeting today — you used your full budget wisely.";
  }

  if (remaining > 0 && remaining <= budget * 0.15) {
    return "Nice job — you maximized your budget without going over.";
  }

  if (remaining > budget * 0.15) {
    return "Great job — you stayed comfortably under budget today.";
  }

  return "You wrapped up the day with a clear meal budget summary.";
}

export function ConcludeDayModal({
  open,
  onOpenChange,
  budget,
  totalCost,
  remaining,
  meals,
  planLabel,
  onDone,
}: ConcludeDayModalProps) {
  const insight = getDailyInsight(budget, totalCost, remaining);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden rounded-[30px] border border-white/50 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,251,251,0.96))] p-0 shadow-[0_24px_80px_rgba(2,48,48,0.16)] sm:max-w-lg">
        <div className="relative">
          <div className="pointer-events-none absolute -left-8 top-0 h-28 w-28 rounded-full bg-[#E3F2FD] blur-3xl" />
          <div className="pointer-events-none absolute -right-8 top-10 h-28 w-28 rounded-full bg-[#ccffe8] blur-3xl" />

          <DialogHeader className="relative px-6 pb-4 pt-6 sm:px-7">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/50 bg-white/70 px-3 py-1.5 text-xs font-medium text-[#025a5a] shadow-sm backdrop-blur-md">
              <MoonStar className="h-3.5 w-3.5" />
              Daily wrap-up
            </div>

            <DialogTitle className="mt-4 font-poppins text-2xl font-semibold tracking-tight text-[#023030]">
              Today’s Summary
            </DialogTitle>

            <DialogDescription className="mt-2 text-sm leading-6 text-[#023030]/65">
              A quick look at how your meal budget went today.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-6 pb-6 sm:px-7">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[22px] border border-white/40 bg-white/70 p-4 shadow-[0_10px_24px_rgba(2,48,48,0.06)]">
                <div className="mb-2 inline-flex rounded-xl bg-[#E3F2FD] p-2 text-[#023030]">
                  <Wallet className="h-4 w-4" />
                </div>
                <p className="text-[11px] text-[#023030]/55">Budget</p>
                <p className="font-poppins mt-1 text-sm font-semibold text-[#023030]">
                  {formatPeso(budget)}
                </p>
              </div>

              <div className="rounded-[22px] border border-white/40 bg-white/70 p-4 shadow-[0_10px_24px_rgba(2,48,48,0.06)]">
                <div className="mb-2 inline-flex rounded-xl bg-[#E3F2FD] p-2 text-[#023030]">
                  <UtensilsCrossed className="h-4 w-4" />
                </div>
                <p className="text-[11px] text-[#023030]/55">Planned spend</p>
                <p className="font-poppins mt-1 text-sm font-semibold text-[#023030]">
                  {formatPeso(totalCost)}
                </p>
              </div>

              <div className="rounded-[22px] border border-white/40 bg-white/70 p-4 shadow-[0_10px_24px_rgba(2,48,48,0.06)]">
                <div className="mb-2 inline-flex rounded-xl bg-[#E3F2FD] p-2 text-[#023030]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <p className="text-[11px] text-[#023030]/55">Remaining</p>
                <p className="font-poppins mt-1 text-sm font-semibold text-[#026d6d]">
                  {formatPeso(Math.max(0, remaining))}
                </p>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/40 bg-[linear-gradient(135deg,rgba(255,255,255,0.75),rgba(227,242,253,0.40),rgba(204,255,232,0.25))] p-4">
              <p className="font-poppins text-sm font-semibold text-[#023030]">
                Daily insight
              </p>
              <p className="mt-2 text-sm leading-6 text-[#023030]/68">
                {insight}
              </p>
            </div>
          </div>

          <DialogFooter className="border-t border-[#edf3f3] bg-white/70 px-6 py-4 sm:px-7">
            <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-11 rounded-2xl border-[#d8e6e6] bg-white text-[#023030] hover:bg-[#f6fbfb]"
              >
                Close
              </Button>

              <Button
                onClick={() => {
                    onDone?.();
                    onOpenChange(false);
                }}
                className="h-11 rounded-2xl bg-[linear-gradient(135deg,#022b2b_0%,#033f3f_45%,#046d6d_90%,#0a8f8f_100%)] px-5 text-white shadow-[0_10px_24px_rgba(2,48,48,0.16)] hover:opacity-95"
                >
                Done
            </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}