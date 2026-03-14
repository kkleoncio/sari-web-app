"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  Wallet,
  UtensilsCrossed,
  Sparkles,
  RotateCcw,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { HistoryItem } from "@/app/home/types";

export default function HistoryPage() {
  const [historyItems, setHistoryItems] = React.useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadHistory() {
      try {
        setHistoryLoading(true);

        const userId = localStorage.getItem("userId");
        if (!userId) {
          setHistoryItems([]);
          return;
        }

        const res = await fetch(
          `/api/mealplans/history?userId=${encodeURIComponent(userId)}`
        );
        const data = await res.json();

        if (data.ok && Array.isArray(data.history)) {
          const mapped: HistoryItem[] = data.history.map((item: any) => ({
            id: String(item._id),
            title: item.label || "Saved Meal Plan",
            date: new Date(item.createdAt).toLocaleString(),
            allowanceType: item.allowanceType,
            budget: item.budget,
            total: item.totalCost,
            remaining: item.remainingBudget,
            meals: (item.meals ?? []).map((meal: any) => meal.mealName),
            mood: item.label || "Saved",
          }));

          setHistoryItems(mapped);
        } else {
          setHistoryItems([]);
        }
      } catch (error) {
        console.error("Failed to load history:", error);
        setHistoryItems([]);
      } finally {
        setHistoryLoading(false);
      }
    }

    loadHistory();
  }, []);

  function formatPeso(n: number) {
    return `PHP ${n}`;
  }

  const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  const latestPlan = historyItems[0];
  const totalSaved = historyItems.length;
  const averageBudget =
    historyItems.length > 0
      ? Math.round(
          historyItems.reduce((sum, item) => sum + item.budget, 0) /
            historyItems.length
        )
      : 0;

  const averageRemaining =
    historyItems.length > 0
      ? Math.round(
          historyItems.reduce((sum, item) => sum + item.remaining, 0) /
            historyItems.length
        )
      : 0;

  return (
    <div
      className="min-h-screen text-[#023030]"
      style={{
        background:
          "radial-gradient(circle at top right, rgba(204,255,232,0.75) 0%, rgba(204,255,232,0) 26%), radial-gradient(circle at bottom left, rgba(227,242,253,0.85) 0%, rgba(227,242,253,0) 32%), linear-gradient(180deg, #f7fbfb 0%, #eef7f7 100%)",
      }}
    >
      <div className="mx-auto max-w-6xl px-6 py-8 md:px-10 lg:px-14">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mb-6"
        >
          <Link href="/home">
            <Button
              variant="outline"
              className="rounded-xl border-white/45 bg-white/60 text-[#023030] backdrop-blur-md hover:bg-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to home
            </Button>
          </Link>
        </motion.div>

        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="relative overflow-hidden rounded-[32px] border border-white/45 bg-[linear-gradient(135deg,rgba(255,255,255,0.62),rgba(227,242,253,0.34)_38%,rgba(204,255,232,0.28)_100%)] p-6 shadow-[0_14px_40px_rgba(2,48,48,0.10)] backdrop-blur-xl md:p-7"
        >
          <div className="pointer-events-none absolute -right-10 top-0 h-32 w-32 rounded-full bg-[#ccffe8]/35 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-28 w-28 rounded-full bg-[#E3F2FD]/60 blur-3xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/45 px-3 py-1.5 text-xs font-medium text-[#025a5a] backdrop-blur-md">
              <RotateCcw className="h-3.5 w-3.5" />
              Meal plan history
            </div>

            <h1 className="font-poppins mt-4 text-[28px] font-semibold tracking-tight text-[#025a5a] md:text-[34px]">
              Your saved plans
            </h1>

            <p className="font-helvetica mt-2 max-w-2xl text-sm font-light leading-6 text-[#023030]/72 md:text-[15px]">
              Review your previous meal combinations, compare spending patterns,
              and reuse the plans that worked best for your allowance.
            </p>
          </div>
        </motion.section>

        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <div className="rounded-[24px] border border-white/40 bg-white/55 p-4 shadow-[0_10px_24px_rgba(2,48,48,0.08)] backdrop-blur-xl">
            <div className="mb-3 inline-flex rounded-xl bg-[#E3F2FD] p-2 text-[#023030]">
              <CalendarDays className="h-4 w-4" />
            </div>
            <p className="font-helvetica text-xs text-[#023030]/60">
              Saved plans
            </p>
            <p className="font-poppins mt-1 text-lg font-semibold text-[#023030]">
              {totalSaved}
            </p>
          </div>

          <div className="rounded-[24px] border border-white/40 bg-white/55 p-4 shadow-[0_10px_24px_rgba(2,48,48,0.08)] backdrop-blur-xl">
            <div className="mb-3 inline-flex rounded-xl bg-[#E3F2FD] p-2 text-[#023030]">
              <Wallet className="h-4 w-4" />
            </div>
            <p className="font-helvetica text-xs text-[#023030]/60">
              Average budget
            </p>
            <p className="font-poppins mt-1 text-lg font-semibold text-[#023030]">
              {historyItems.length > 0 ? formatPeso(averageBudget) : "—"}
            </p>
          </div>

          <div className="rounded-[24px] border border-white/40 bg-white/55 p-4 shadow-[0_10px_24px_rgba(2,48,48,0.08)] backdrop-blur-xl">
            <div className="mb-3 inline-flex rounded-xl bg-[#E3F2FD] p-2 text-[#023030]">
              <Sparkles className="h-4 w-4" />
            </div>
            <p className="font-helvetica text-xs text-[#023030]/60">
              Average left
            </p>
            <p className="font-poppins mt-1 text-lg font-semibold text-[#026d6d]">
              {historyItems.length > 0 ? formatPeso(averageRemaining) : "—"}
            </p>
          </div>

          <div className="rounded-[24px] border border-white/40 bg-white/55 p-4 shadow-[0_10px_24px_rgba(2,48,48,0.08)] backdrop-blur-xl">
            <div className="mb-3 inline-flex rounded-xl bg-[#E3F2FD] p-2 text-[#023030]">
              <UtensilsCrossed className="h-4 w-4" />
            </div>
            <p className="font-helvetica text-xs text-[#023030]/60">
              Latest plan
            </p>
            <p className="font-poppins mt-1 truncate text-lg font-semibold text-[#023030]">
              {latestPlan?.title ?? "No saved plan yet"}
            </p>
          </div>
        </motion.section>

        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-8"
        >
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-poppins text-xl font-semibold text-[#023030]">
                Recent plans
              </h2>
              <p className="font-helvetica text-sm font-light text-[#023030]/68">
                Browse your previously chosen combinations
              </p>
            </div>

            <div className="rounded-full border border-white/40 bg-white/55 px-3 py-1 text-xs font-medium text-[#025a5a] backdrop-blur-md">
              {historyItems.length} total
            </div>
          </div>

          {historyLoading ? (
            <div className="rounded-[28px] border border-white/40 bg-white/55 p-6 shadow-[0_10px_30px_rgba(2,48,48,0.08)] backdrop-blur-xl">
              <p className="font-helvetica text-sm text-[#023030]/68">
                Loading saved plans...
              </p>
            </div>
          ) : historyItems.length === 0 ? (
            <div className="rounded-[28px] border border-white/40 bg-white/55 p-8 shadow-[0_10px_30px_rgba(2,48,48,0.08)] backdrop-blur-xl">
              <div className="mx-auto max-w-md text-center">
                <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E3F2FD] text-[#023030]">
                  <RotateCcw className="h-6 w-6" />
                </div>

                <h3 className="font-poppins text-xl font-semibold text-[#023030]">
                  No saved plans yet
                </h3>
                <p className="font-helvetica mt-2 text-sm font-light leading-6 text-[#023030]/68">
                  Once you choose and save a meal plan from the home page, it
                  will appear here.
                </p>

                <Link href="/home" className="mt-5 inline-block">
                  <Button className="font-poppins rounded-xl bg-[#023030] text-white hover:bg-[#034646]">
                    Go to home
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {historyItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="group rounded-[28px] border border-white/40 bg-white/55 p-5 shadow-[0_10px_30px_rgba(2,48,48,0.08)] backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(2,48,48,0.12)] md:p-6"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-poppins text-lg font-semibold text-[#023030]">
                          {item.title}
                        </h3>
                        <span className="rounded-full bg-[#E3F2FD] px-2.5 py-1 text-[11px] font-medium text-[#023030]">
                          {item.mood}
                        </span>
                        <span className="rounded-full border border-white/45 bg-white/65 px-2.5 py-1 text-[11px] text-[#023030]/75">
                          {item.allowanceType}
                        </span>
                      </div>

                      <p className="font-helvetica mt-1 text-xs font-light text-[#023030]/60">
                        {item.date}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
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

                    <div className="grid min-w-[220px] grid-cols-3 gap-3 lg:grid-cols-1">
                      <div className="rounded-2xl border border-white/35 bg-white/50 px-3 py-3 backdrop-blur-md">
                        <p className="font-helvetica text-[11px] text-[#023030]/55">
                          Budget
                        </p>
                        <p className="font-poppins mt-1 text-sm font-semibold text-[#023030]">
                          {formatPeso(item.budget)}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/35 bg-white/50 px-3 py-3 backdrop-blur-md">
                        <p className="font-helvetica text-[11px] text-[#023030]/55">
                          Used
                        </p>
                        <p className="font-poppins mt-1 text-sm font-semibold text-[#023030]">
                          {formatPeso(item.total)}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/35 bg-white/50 px-3 py-3 backdrop-blur-md">
                        <p className="font-helvetica text-[11px] text-[#023030]/55">
                          Left
                        </p>
                        <p className="font-poppins mt-1 text-sm font-semibold text-[#026d6d]">
                          {formatPeso(item.remaining)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      className="rounded-xl border-white/45 bg-white/60 text-[#023030] hover:bg-white"
                    >
                      View details
                    </Button>

                    <Button className="rounded-xl bg-[#023030] text-white hover:bg-[#034646]">
                      Use again
                    </Button>

                    <Button
                      variant="ghost"
                      className="rounded-xl text-[#026d6d] hover:bg-white/50 hover:text-[#023030]"
                    >
                      Open plan
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
}