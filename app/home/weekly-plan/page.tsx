"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  ChevronLeft,
  Wallet,
  UtensilsCrossed,
  Sparkles,
  MapPin,
  ArrowRight,
  CircleDollarSign,
  CheckCircle2,
} from "lucide-react";

type Meal = {
  _id?: string;
  mealName: string;
  price: number;
  establishmentName?: string;
};

type WeeklyDay = {
  day: number;
  label: string;
  budget?: number;
  meals: Meal[];
  totalCost: number;
  remainingBudget: number;
};

type WeeklyPlan = {
  label?: string;
  totalCost: number;
  remainingBudget: number;
  days: WeeklyDay[];
};

export default function WeeklyPlanPage() {
  const router = useRouter();
  const [plan, setPlan] = React.useState<WeeklyPlan | null>(null);

  function formatPeso(n: number) {
    return `PHP ${n}`;
  }

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const saved =
      sessionStorage.getItem("selectedWeeklyPlan") ||
      sessionStorage.getItem("selectedWeeklyPreview");

    if (!saved) {
      router.replace("/home");
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      if (!parsed?.days || !Array.isArray(parsed.days)) {
        router.replace("/home");
        return;
      }
      setPlan(parsed);
    } catch {
      router.replace("/home");
    }
  }, [router]);

  const totalMeals =
    plan?.days?.reduce((sum, day) => sum + day.meals.length, 0) ?? 0;

  const averagePerDay =
    plan && plan.days.length > 0 ? Math.round(plan.totalCost / plan.days.length) : 0;

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

  const stagger = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.07,
      },
    },
  };

  if (!plan) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#dff7ef_0%,#f7fbfb_45%,#eef8f4_100%)] px-6">
        <div className="w-full max-w-sm rounded-[30px] border border-white/60 bg-white/25 p-7 shadow-[0_24px_80px_rgba(2,48,48,0.12)] backdrop-blur-2xl">
          <div className="mb-5 flex flex-col items-center text-center">
            <h2 className="font-poppins text-lg font-semibold text-[#023030]">
              Loading weekly plan
            </h2>
            <p className="mt-1 font-helvetica text-sm text-[#023030]/65">
              Preparing your meal breakdown...
            </p>
          </div>

          <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#023030]/8">
            <div className="h-full w-1/3 animate-[loading_1.1s_ease-in-out_infinite] rounded-full bg-[linear-gradient(90deg,#0b6b57_0%,#34d399_55%,#0b6b57_100%)]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen text-[#023030]"
      style={{
        background:
          "radial-gradient(circle at top right, rgba(204,255,232,0.78) 0%, rgba(204,255,232,0) 24%), radial-gradient(circle at bottom left, rgba(227,242,253,0.88) 0%, rgba(227,242,253,0) 30%), linear-gradient(180deg, #f8fcfc 0%, #eef7f7 100%)",
      }}
    >
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[10%] top-[10%] h-40 w-40 rounded-full bg-[#ccffe8]/35 blur-3xl" />
        <div className="absolute right-[8%] top-[20%] h-52 w-52 rounded-full bg-[#E3F2FD]/60 blur-3xl" />
        <div className="absolute bottom-[10%] left-[20%] h-56 w-56 rounded-full bg-[#d9fff1]/30 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 md:px-10 lg:px-14">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mb-6"
        >
          <button
            onClick={() => router.push("/home")}
            className="font-poppins inline-flex items-center gap-2 text-sm font-medium text-[#026d6d] transition hover:text-[#023030]"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to home
          </button>
        </motion.div>

        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="relative overflow-hidden rounded-[34px] border border-white/45 bg-[linear-gradient(135deg,rgba(255,255,255,0.62),rgba(227,242,253,0.34)_38%,rgba(204,255,232,0.28)_100%)] p-6 shadow-[0_18px_48px_rgba(2,48,48,0.10)] backdrop-blur-xl md:p-8"
        >
          <div className="pointer-events-none absolute -right-10 top-0 h-36 w-36 rounded-full bg-[#ccffe8]/35 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 rounded-full bg-[#E3F2FD]/55 blur-3xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/55 px-3 py-1.5 text-xs font-medium text-[#025a5a] backdrop-blur-md">
              <CalendarDays className="h-3.5 w-3.5" />
              Weekly meal breakdown
            </div>

            <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="font-poppins text-3xl font-semibold tracking-tight text-[#023030] md:text-4xl">
                  {plan.label || "Your weekly meal plan"}
                </h1>
                <p className="font-helvetica mt-2 max-w-2xl text-sm font-light leading-6 text-[#023030]/72 md:text-[15px]">
                  Here’s your full weekly guide, organized day by day so it feels
                  easier to follow, budget, and actually use as a student.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="rounded-full border border-white/40 bg-white/50 px-3 py-1.5 text-xs text-[#023030]/80 backdrop-blur-md">
                    7-day plan
                  </div>
                  <div className="rounded-full border border-white/40 bg-white/50 px-3 py-1.5 text-xs text-[#023030]/80 backdrop-blur-md">
                    {totalMeals} meals total
                  </div>
                  <div className="rounded-full border border-white/40 bg-white/50 px-3 py-1.5 text-xs text-[#023030]/80 backdrop-blur-md">
                    Student-friendly picks
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => router.push("/home")}
                  variant="outline"
                  className="font-poppins rounded-xl border-white/45 bg-white/55 text-[#023030] backdrop-blur-md hover:bg-white/75"
                >
                  Back to dashboard
                </Button>

                <Button
                  onClick={() => router.push("/home/history")}
                  className="font-poppins rounded-xl bg-[#023030] text-white hover:bg-[#034646]"
                >
                  View history
                </Button>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          variants={stagger}
          initial="hidden"
          animate="show"
          className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <motion.div
            variants={fadeUp}
            className="rounded-[26px] border border-white/40 bg-[linear-gradient(135deg,#022b2b_0%,#033f3f_45%,#046d6d_90%,#0a8f8f_100%)] p-5 text-white shadow-[0_12px_28px_rgba(2,48,48,0.10)] backdrop-blur-xl"
          >
            <div className="mb-3 inline-flex rounded-xl bg-[#E3F2FD] p-2 text-[#023030]">
              <Wallet className="h-4 w-4" />
            </div>
            <p className="font-helvetica text-xs font-light text-white/80">
              Weekly total
            </p>
            <p className="font-poppins mt-1 text-2xl font-semibold">
              {formatPeso(plan.totalCost)}
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="rounded-[26px] border border-white/40 bg-[linear-gradient(135deg,#022b2b_0%,#033f3f_45%,#046d6d_90%,#0a8f8f_100%)] p-5 text-white shadow-[0_12px_28px_rgba(2,48,48,0.10)] backdrop-blur-xl"
          >
            <div className="mb-3 inline-flex rounded-xl bg-[#E3F2FD] p-2 text-[#023030]">
              <CircleDollarSign className="h-4 w-4" />
            </div>
            <p className="font-helvetica text-xs font-light text-white/80">
              Budget left
            </p>
            <p className="font-poppins mt-1 text-2xl font-semibold">
              {formatPeso(plan.remainingBudget)}
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="rounded-[26px] border border-white/40 bg-white/58 p-5 shadow-[0_12px_28px_rgba(2,48,48,0.08)] backdrop-blur-xl"
          >
            <div className="mb-3 inline-flex rounded-xl bg-[#E3F2FD] p-2 text-[#023030]">
              <UtensilsCrossed className="h-4 w-4" />
            </div>
            <p className="font-helvetica text-xs font-light text-[#023030]/60">
              Total meals
            </p>
            <p className="font-poppins mt-1 text-2xl font-semibold text-[#023030]">
              {totalMeals}
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="rounded-[26px] border border-white/40 bg-white/58 p-5 shadow-[0_12px_28px_rgba(2,48,48,0.08)] backdrop-blur-xl"
          >
            <div className="mb-3 inline-flex rounded-xl bg-[#E3F2FD] p-2 text-[#023030]">
              <Sparkles className="h-4 w-4" />
            </div>
            <p className="font-helvetica text-xs font-light text-[#023030]/60">
              Average per day
            </p>
            <p className="font-poppins mt-1 text-2xl font-semibold text-[#023030]">
              {formatPeso(averagePerDay)}
            </p>
          </motion.div>
        </motion.section>

        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-6 rounded-[30px] border border-white/40 bg-white/52 p-5 shadow-[0_10px_30px_rgba(2,48,48,0.08)] backdrop-blur-xl"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-poppins text-xl font-semibold text-[#023030] md:text-2xl">
                Your week at a glance
              </h2>
              <p className="font-helvetica mt-1 text-sm font-light text-[#023030]/68">
                Each card shows the meals planned for that day, the total spent,
                and what remains from your daily allocation.
              </p>
            </div>

            <div className="rounded-full bg-[#E3F2FD] px-4 py-2 text-xs font-medium text-[#023030]">
              Planned for 7 days
            </div>
          </div>
        </motion.section>

        <motion.section
          variants={stagger}
          initial="hidden"
          animate="show"
          className="mt-6 grid gap-5 lg:grid-cols-2"
        >
          {plan.days.map((day) => (
            <motion.div
              key={day.day}
              variants={fadeUp}
              className="group relative overflow-hidden rounded-[30px] border border-white/40 bg-[linear-gradient(135deg,rgba(255,255,255,0.72),rgba(227,242,253,0.30),rgba(204,255,232,0.16))] p-5 shadow-[0_12px_28px_rgba(2,48,48,0.06)] backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(2,48,48,0.10)]"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#ccffe8]/25 blur-3xl" />

              <div className="relative z-10">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/55 px-3 py-1 text-[11px] font-medium text-[#025a5a] backdrop-blur-md">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Day {day.day}
                    </div>

                    <h3 className="font-poppins mt-3 text-xl font-semibold text-[#023030]">
                      {day.label}
                    </h3>

                    <p className="font-helvetica mt-1 text-xs text-[#023030]/60">
                      {day.meals.length} meal
                      {day.meals.length !== 1 ? "s" : ""}
                      {typeof day.budget === "number"
                        ? ` • Budget ${formatPeso(day.budget)}`
                        : ""}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/65 px-3 py-2 text-right backdrop-blur-md">
                    <p className="font-helvetica text-[11px] text-[#023030]/55">
                      Day total
                    </p>
                    <p className="font-poppins text-sm font-semibold text-[#023030]">
                      {formatPeso(day.totalCost)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {day.meals.map((meal: Meal, index: number) => (
                    <div
                      key={`${day.day}-${meal._id || meal.mealName}-${index}`}
                      className="rounded-[22px] border border-white/35 bg-white/62 p-3 backdrop-blur-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#dff7ef_0%,#E3F2FD_100%)] text-[#026d6d]">
                              <UtensilsCrossed className="h-4 w-4" />
                            </div>

                            <div className="min-w-0">
                              <p className="font-poppins truncate text-sm font-medium text-[#023030]">
                                {meal.mealName}
                              </p>

                              <div className="mt-1 flex items-center gap-1 text-xs text-[#023030]/55">
                                <MapPin className="h-3 w-3 shrink-0" />
                                <span className="truncate">
                                  {meal.establishmentName || "UPLB area"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <span className="ml-3 shrink-0 rounded-full bg-[#E3F2FD] px-2.5 py-1 text-xs font-semibold text-[#023030]">
                          {formatPeso(Number(meal.price || 0))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/35 bg-white/55 px-4 py-3">
                    <p className="font-helvetica text-[11px] text-[#023030]/55">
                      Spent today
                    </p>
                    <p className="font-poppins mt-1 text-sm font-semibold text-[#023030]">
                      {formatPeso(day.totalCost)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/35 bg-white/55 px-4 py-3">
                    <p className="font-helvetica text-[11px] text-[#023030]/55">
                      Left for today
                    </p>
                    <p className="font-poppins mt-1 text-sm font-semibold text-[#026d6d]">
                      {formatPeso(day.remainingBudget)}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.section>

        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-8 rounded-[30px] border border-white/40 bg-[linear-gradient(135deg,rgba(255,255,255,0.60),rgba(227,242,253,0.30),rgba(204,255,232,0.20))] p-5 shadow-[0_10px_30px_rgba(2,48,48,0.08)] backdrop-blur-xl"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/55 px-3 py-1.5 text-xs font-medium text-[#025a5a] backdrop-blur-md">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Weekly plan ready
              </div>

              <h3 className="font-poppins mt-3 text-lg font-semibold text-[#023030]">
                You now have a clearer guide for the whole week
              </h3>
              <p className="font-helvetica mt-1 text-sm font-light leading-6 text-[#023030]/68">
                You can go back to your dashboard, generate a different weekly
                option, or save this as your basis for daily choices.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/home")}
                className="font-poppins rounded-xl border-white/45 bg-white/55 text-[#023030] backdrop-blur-md hover:bg-white/75"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to home
              </Button>

              <Button
                onClick={() => router.push("/home/history")}
                className="font-poppins rounded-xl bg-[#023030] text-white hover:bg-[#034646]"
              >
                Go to history
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}