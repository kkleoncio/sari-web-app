"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import type { AllowanceType, HistoryItem } from "@/app/home/types";
type HistorySectionProps = {
  innerRef?: React.RefObject<HTMLElement | null>;
  fadeUp: {
    hidden: { opacity: number; y: number };
    show: {
      opacity: number;
      y: number;
      transition: {
        duration: number;
        ease: readonly [number, number, number, number];
      };
    };
  };
  stagger: {
    hidden: Record<string, never>;
    show: {
      transition: {
        staggerChildren: number;
      };
    };
  };
  glassCard: string;
  glassCardSoft: string;
  glassStat: string;
  formatPeso: (n: number) => string;
  historyItems: HistoryItem[];
  historyLoading?: boolean;
};

export function HistorySection({
  innerRef,
  fadeUp,
  stagger,
  glassCard,
  glassCardSoft,
  glassStat,
  formatPeso,
  historyItems,
  historyLoading = false,
}: HistorySectionProps) {
  return (
    <section ref={innerRef} className="scroll-mt-8 space-y-4">
      <motion.div
        className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="flex items-start gap-3">
          <div className="mt-1 rounded-lg bg-[#E3F2FD] p-2 text-[#023030]">
            <RotateCcw className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-poppins text-xl font-semibold text-[#023030]">
              History
            </h2>
            <p className="font-helvetica text-sm font-light text-[#023030]/70">
              Your previously generated and saved meal plans
            </p>
          </div>
        </div>

        <p className="font-helvetica text-sm font-light text-[#023030]/70">
          {historyItems.length} saved plans
        </p>
      </motion.div>

      <motion.div
        className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]"
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
      >
        <motion.div variants={fadeUp} className={cn(glassCard, "p-5 md:p-6")}>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-poppins text-lg font-semibold text-[#023030]">
                Recent plans
              </h3>
              <p className="font-helvetica text-sm font-light text-[#023030]/65">
                Review your previous combinations and reuse your favorites
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {historyLoading ? (
              <div className={cn(glassCardSoft, "p-4")}>
                <p className="font-helvetica text-sm text-[#023030]/65">
                  Loading saved plans...
                </p>
              </div>
            ) : historyItems.length === 0 ? (
              <div className={cn(glassCardSoft, "p-4")}>
                <p className="font-poppins text-sm font-medium text-[#023030]">
                  No saved plans yet
                </p>
                <p className="font-helvetica mt-1 text-sm font-light text-[#023030]/65">
                  Your chosen meal plans will appear here once you save them.
                </p>
              </div>
            ) : (
              historyItems.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.18 }}
                  className={cn(
                    glassCardSoft,
                    "group p-4 transition-shadow hover:shadow-[0_14px_34px_rgba(2,48,48,0.12)]"
                  )}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-poppins text-base font-semibold text-[#023030]">
                          {item.title}
                        </h4>
                        <span className="rounded-full bg-[#E3F2FD] px-2.5 py-1 text-[11px] font-medium text-[#023030]">
                          {item.mood}
                        </span>
                      </div>

                      <p className="font-helvetica mt-1 text-xs font-light text-[#023030]/60">
                        {item.date} • {item.allowanceType} budget
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.meals.map((meal) => (
                          <span
                            key={meal}
                            className="rounded-full border border-white/45 bg-white/55 px-3 py-1 text-xs text-[#023030]/80"
                          >
                            {meal}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid min-w-[170px] grid-cols-3 gap-2 sm:grid-cols-1">
                      <div className={cn(glassStat, "px-3 py-2")}>
                        <p className="font-helvetica text-[11px] text-[#023030]/55">
                          Budget
                        </p>
                        <p className="font-poppins text-sm font-semibold text-[#023030]">
                          {formatPeso(item.budget)}
                        </p>
                      </div>
                      <div className={cn(glassStat, "px-3 py-2")}>
                        <p className="font-helvetica text-[11px] text-[#023030]/55">
                          Used
                        </p>
                        <p className="font-poppins text-sm font-semibold text-[#023030]">
                          {formatPeso(item.total)}
                        </p>
                      </div>
                      <div className={cn(glassStat, "px-3 py-2")}>
                        <p className="font-helvetica text-[11px] text-[#023030]/55">
                          Left
                        </p>
                        <p className="font-poppins text-sm font-semibold text-[#026d6d]">
                          {formatPeso(item.remaining)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      className="rounded-xl border-[#d9e4e4] bg-white/60 text-[#023030] hover:bg-white"
                    >
                      View Details
                    </Button>
                    <Button className="rounded-xl bg-[#023030] text-white hover:bg-[#034646]">
                      Regenerate Plan
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <div className="space-y-4">
            {historyItems.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.18 }}
                className={cn(
                  glassCardSoft,
                  "group p-4 transition-shadow hover:shadow-[0_14px_34px_rgba(2,48,48,0.12)]"
                )}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-poppins text-base font-semibold text-[#023030]">
                        {item.title}
                      </h4>
                      <span className="rounded-full bg-[#E3F2FD] px-2.5 py-1 text-[11px] font-medium text-[#023030]">
                        {item.mood}
                      </span>
                    </div>

                    <p className="font-helvetica mt-1 text-xs font-light text-[#023030]/60">
                      {item.date} • {item.allowanceType} budget
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.meals.map((meal) => (
                        <span
                          key={meal}
                          className="rounded-full border border-white/45 bg-white/55 px-3 py-1 text-xs text-[#023030]/80"
                        >
                          {meal}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid min-w-[170px] grid-cols-3 gap-2 sm:grid-cols-1">
                    <div className={cn(glassStat, "px-3 py-2")}>
                      <p className="font-helvetica text-[11px] text-[#023030]/55">
                        Budget
                      </p>
                      <p className="font-poppins text-sm font-semibold text-[#023030]">
                        {formatPeso(item.budget)}
                      </p>
                    </div>
                    <div className={cn(glassStat, "px-3 py-2")}>
                      <p className="font-helvetica text-[11px] text-[#023030]/55">
                        Used
                      </p>
                      <p className="font-poppins text-sm font-semibold text-[#023030]">
                        {formatPeso(item.total)}
                      </p>
                    </div>
                    <div className={cn(glassStat, "px-3 py-2")}>
                      <p className="font-helvetica text-[11px] text-[#023030]/55">
                        Left
                      </p>
                      <p className="font-poppins text-sm font-semibold text-[#026d6d]">
                        {formatPeso(item.remaining)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    className="rounded-xl border-[#d9e4e4] bg-white/60 text-[#023030] hover:bg-white"
                  >
                    View Details
                  </Button>
                  <Button className="rounded-xl bg-[#023030] text-white hover:bg-[#034646]">
                    Regenerate Plan
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className={cn(
            glassCard,
            "relative overflow-hidden p-5 md:p-6 before:absolute before:inset-0 before:bg-[linear-gradient(135deg,rgba(255,255,255,0.16),transparent_45%)] before:pointer-events-none"
          )}
        >
          <div className="relative z-10">
            <h3 className="font-poppins text-lg font-semibold text-[#023030]">
              History insights
            </h3>
            <p className="font-helvetica mt-1 text-sm font-light text-[#023030]/65">
              A quick look at your recent budgeting patterns
            </p>

            <div className="mt-5 space-y-4">
              <div className={cn(glassCardSoft, "p-4")}>
                <p className="font-helvetica text-xs text-[#023030]/60">
                  Most common budget
                </p>
                <p className="font-poppins mt-1 text-2xl font-semibold text-[#023030]">
                  PHP 500
                </p>
              </div>

              <div className={cn(glassCardSoft, "p-4")}>
                <p className="font-helvetica text-xs text-[#023030]/60">
                  Favorite style
                </p>
                <p className="font-poppins mt-1 text-lg font-semibold text-[#023030]">
                  Balanced meal combos
                </p>
              </div>

              <div className={cn(glassCardSoft, "p-4")}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-helvetica text-xs text-[#023030]/60">
                    Budget usage trend
                  </p>
                  <span className="font-poppins text-xs font-medium text-[#026d6d]">
                    Efficient
                  </span>
                </div>

                <div className="flex h-28 items-end gap-2">
                  {[68, 82, 74, 88, 71, 79, 84].map((height, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center gap-2">
                      <div
                        className="w-full rounded-full bg-[linear-gradient(180deg,#0a8f8f,#023030)] opacity-85"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}