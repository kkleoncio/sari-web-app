"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  CalendarDays,
  Wallet,
  UtensilsCrossed,
  Sparkles,
  RotateCcw,
  ChevronRight,
  MapPin,
  Trash2,
  Clock3,
  NotebookPen,
  BadgeDollarSign,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ActionResultModal } from "@/components/home/modals/action-result-modal";

type HistoryMeal = {
  _id?: string;
  mealName: string;
  price: number;
  establishmentName: string;
  establishmentCategory?: string;
  location?: string;
  foodType?: string;
  category?: string;
  mealTime?: string[];
  healthScore?: number;
  isFried?: boolean;
  isSoup?: boolean;
  isVegetarian?: boolean;
  tags?: string[];
  allergens?: string[];
};

type HistoryItem = {
  id: string;
  title: string;
  date: string;
  allowanceType: "daily" | "weekly";
  budget: number;
  total: number;
  remaining: number;
  meals: string[];
  mood: string;
  selected?: boolean;
  score?: number;
  mealsPerDay?: number;
  mealDetails: HistoryMeal[];
};

function formatPeso(n: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatLabel(value?: string) {
  if (!value) return "";
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getAllowanceLabel(value: "daily" | "weekly") {
  return value === "weekly" ? "Weekly plan" : "Daily plan";
}

export default function HistoryPage() {
  const router = useRouter();

  const { data: session, status } = useSession();
  const userId = session?.user?.id ?? "";
  const [historyItems, setHistoryItems] = React.useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = React.useState(true);

  const [selectedPlan, setSelectedPlan] = React.useState<HistoryItem | null>(null);
  const [openDetails, setOpenDetails] = React.useState(false);

  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null);

  const [openResultModal, setOpenResultModal] = React.useState(false);
  const [resultTitle, setResultTitle] = React.useState("");
  const [resultMessage, setResultMessage] = React.useState("");

  const [openClearAllDialog, setOpenClearAllDialog] = React.useState(false);
  const [clearingAll, setClearingAll] = React.useState(false);

  const showResultModal = React.useCallback((title: string, message: string) => {
    setResultTitle(title);
    setResultMessage(message);
    setOpenResultModal(true);
  }, []);

  const loadHistory = React.useCallback(async () => {
      try {
        setHistoryLoading(true);

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
          date: new Date(item.createdAt).toLocaleString("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          }),
          allowanceType: item.allowanceType,
          budget: Number(item.budget ?? 0),
          total: Number(item.totalCost ?? 0),
          remaining: Number(item.remainingBudget ?? 0),
          meals: (item.meals ?? []).map((meal: any) => meal.mealName).filter(Boolean),
          mood: item.allowanceType === "weekly" ? "Planned ahead" : "Quick and practical",
          selected: Boolean(item.selected),
          score: Number(item.score ?? 0),
          mealsPerDay: Number(item.mealsPerDay ?? 0),
          mealDetails: (item.meals ?? []).map((meal: any) => ({
            _id: meal._id,
            mealName: meal.mealName,
            price: Number(meal.price ?? 0),
            establishmentName:
              meal.establishmentName || meal.establishment || "Unknown establishment",
            establishmentCategory: meal.establishmentCategory,
            location: meal.location,
            foodType: meal.foodType,
            category: meal.category,
            mealTime: meal.mealTime ?? [],
            healthScore: meal.healthScore,
            isFried: meal.isFried,
            isSoup: meal.isSoup,
            isVegetarian: meal.isVegetarian,
            tags: meal.tags ?? [],
            allergens: meal.allergens ?? [],
          })),
        }));

        setHistoryItems(mapped);
      } else {
        setHistoryItems([]);
      }
    } catch (error) {
      console.error(error);
      setHistoryItems([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    if (status === "authenticated" && userId) {
      loadHistory();
    }
  }, [status, userId, loadHistory]);

  const openPlanDetails = (item: HistoryItem) => {
    setSelectedPlan(item);
    setOpenDetails(true);
  };

  const restorePlan = async (item: HistoryItem) => {

    if (!userId) {
      showResultModal("Please login first", "You must be logged in.");
      return;
    }

    try {
      setActionLoadingId(item.id);

      const res = await fetch("/api/mealplans/use-again", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          mealPlanId: item.id,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "Failed to restore meal plan");
      }

      toast.success("Meal plan restored");
      showResultModal(
        "Meal plan restored",
        "This saved meal plan is now your current selected plan."
      );

      await loadHistory();
    } catch (error) {
      console.error(error);
      showResultModal(
        "Something went wrong",
        "We couldn't restore that meal plan."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const totalSaved = historyItems.length;
  const selectedCount = historyItems.filter((item) => item.selected).length;
  const totalBudgetTracked = historyItems.reduce((sum, item) => sum + item.budget, 0);
  const averageRemaining =
    historyItems.length > 0
      ? Math.round(
          historyItems.reduce((sum, item) => sum + item.remaining, 0) /
            historyItems.length
        )
      : 0;

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

 async function handleClearAllConfirmed() {
  if (typeof window === "undefined") return;

  if (!userId) {
    showResultModal("Please login first", "You must be logged in.");
    return;
  }

  try {
    setClearingAll(true);

    const res = await fetch(
      `/api/mealplans/clear?userId=${encodeURIComponent(userId)}`,
      {
        method: "DELETE",
      }
    );

    const data = await res.json();

    if (!res.ok || !data.ok) {
      throw new Error(data.error || "Failed to clear history");
    }

    setHistoryItems([]);
    setSelectedPlan(null);
    setOpenDetails(false);
    setOpenClearAllDialog(false);

    toast.success("History cleared", {
      description: "All saved meal plans have been removed.",
    });
  } catch (error) {
    console.error(error);
    toast.error("Failed to clear history", {
      description: "Please try again.",
    });
  } finally {
    setClearingAll(false);
  }
}

if (status === "loading") {
  return (
    <div className="min-h-screen px-6 py-8 text-[#023030]">
      <p className="font-poppins text-sm">Loading history...</p>
    </div>
  );
}

  return (
    <div
      className="min-h-screen text-[#023030]"
      style={{
        background:
          "radial-gradient(circle at top left, rgba(204,255,232,0.72) 0%, rgba(204,255,232,0) 24%), radial-gradient(circle at top right, rgba(227,242,253,0.95) 0%, rgba(227,242,253,0) 30%), radial-gradient(circle at bottom left, rgba(255,243,224,0.60) 0%, rgba(255,243,224,0) 22%), linear-gradient(180deg, #f8fcfc 0%, #eef7f7 100%)",
      }}
    >
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-6 md:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mb-6"
        >
          <button
            type="button"
            onClick={() => router.push("/home")}
            className="inline-flex items-center gap-2 rounded-full border border-white/45 bg-white/60 px-3 py-2 text-sm font-medium text-[#025a5a] shadow-[0_8px_20px_rgba(2,48,48,0.08)] backdrop-blur-md transition hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </button>
        </motion.div>

        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="relative overflow-hidden rounded-[34px] border border-white/45 bg-white/62 p-6 shadow-[0_18px_48px_rgba(2,48,48,0.10)] backdrop-blur-2xl md:p-8"
        >
          <div className="absolute inset-x-0 top-0 h-60 bg-[radial-gradient(circle_at_top_left,rgba(163,230,220,0.55),transparent_38%),radial-gradient(circle_at_top_right,rgba(227,242,253,0.9),transparent_36%),linear-gradient(135deg,rgba(248,252,252,0.9)_0%,rgba(238,248,247,0.65)_100%)]" />
          <div className="absolute right-[-30px] top-[-30px] h-36 w-36 rounded-full bg-white/30 blur-3xl" />
          <div className="absolute bottom-[-36px] left-[-16px] h-8 w-28 rounded-full bg-[#ccffe8]/35 blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/55 px-3 py-1.5 text-xs font-medium text-[#025a5a] backdrop-blur-xl shadow-[0_8px_24px_rgba(2,48,48,0.10)]">
              <Sparkles className="h-3.5 w-3.5" />
              Your saved SARI picks
            </div>

            <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <h1 className="font-poppins text-3xl font-semibold tracking-[-0.02em] text-[#023030] md:text-[40px] md:leading-[1.05]">
                  Meal plan history
                </h1>
                <p className="font-helvetica mt-3 max-w-xl text-sm font-light leading-7 text-[#023030]/68 md:text-[15px]">
                  Revisit your previously saved meal combinations, compare your
                  budget usage, and quickly restore a plan you still want to use.
                </p>
              </div>

              <div className="rounded-[24px] border border-white/40 bg-white/58 px-4 py-3 shadow-[0_10px_26px_rgba(2,48,48,0.08)] backdrop-blur-md">
                <p className="font-helvetica text-[11px] uppercase tracking-[0.18em] text-[#023030]/45">
                  History overview
                </p>
                <p className="font-poppins mt-1 text-lg font-semibold text-[#023030]">
                  {totalSaved > 0 ? `${totalSaved} saved plan${totalSaved > 1 ? "s" : ""}` : "No saved plans yet"}
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        >
          <div className="rounded-[28px] border border-white/40 bg-white/58 p-5 shadow-[0_12px_32px_rgba(2,48,48,0.08)] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e8faf6] text-[#026d6d] ring-1 ring-[#026d6d]/10">
                <NotebookPen className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-medium text-[#025a5a] ring-1 ring-[#025a5a]/8">
                Total
              </span>
            </div>
            <p className="font-helvetica mt-4 text-xs uppercase tracking-[0.16em] text-[#023030]/45">
              Saved plans
            </p>
            <p className="font-poppins mt-1 text-2xl font-semibold text-[#023030]">
              {totalSaved}
            </p>
            <p className="font-helvetica mt-2 text-sm text-[#023030]/62">
              Plans you can open or use again anytime
            </p>
          </div>

          <div className="rounded-[28px] border border-white/40 bg-white/58 p-5 shadow-[0_12px_32px_rgba(2,48,48,0.08)] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf7ff] text-[#023030] ring-1 ring-[#023030]/8">
                <RotateCcw className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-medium text-[#025a5a] ring-1 ring-[#025a5a]/8">
                Current
              </span>
            </div>
            <p className="font-helvetica mt-4 text-xs uppercase tracking-[0.16em] text-[#023030]/45">
              Selected plans
            </p>
            <p className="font-poppins mt-1 text-2xl font-semibold text-[#023030]">
              {selectedCount}
            </p>
            <p className="font-helvetica mt-2 text-sm text-[#023030]/62">
              Saved plans currently marked as selected
            </p>
          </div>

          <div className="rounded-[28px] border border-white/40 bg-white/58 p-5 shadow-[0_12px_32px_rgba(2,48,48,0.08)] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#8b5e00] ring-1 ring-[#8b5e00]/10">
                <BadgeDollarSign className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-medium text-[#8b5e00] ring-1 ring-[#8b5e00]/8">
                Budget
              </span>
            </div>
            <p className="font-helvetica mt-4 text-xs uppercase tracking-[0.16em] text-[#023030]/45">
              Total tracked
            </p>
            <p className="font-poppins mt-1 text-2xl font-semibold text-[#023030]">
              {formatPeso(totalBudgetTracked)}
            </p>
            <p className="font-helvetica mt-2 text-sm text-[#023030]/62">
              Combined budget value across your saved plans
            </p>
          </div>

          <div className="rounded-[28px] border border-white/40 bg-white/58 p-5 shadow-[0_12px_32px_rgba(2,48,48,0.08)] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eafbf5] text-[#0a8f8f] ring-1 ring-[#0a8f8f]/10">
                <Wallet className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-medium text-[#0a8f8f] ring-1 ring-[#0a8f8f]/8">
                Avg.
              </span>
            </div>
            <p className="font-helvetica mt-4 text-xs uppercase tracking-[0.16em] text-[#023030]/45">
              Average left
            </p>
            <p className="font-poppins mt-1 text-2xl font-semibold text-[#023030]">
              {formatPeso(averageRemaining)}
            </p>
            <p className="font-helvetica mt-2 text-sm text-[#023030]/62">
              Average remaining budget after each saved plan
            </p>
          </div>
        </motion.section>

        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-8"
        >
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-poppins text-xl font-semibold text-[#023030]">
                Recent plans
              </h2>
              <p className="font-helvetica text-sm font-light text-[#023030]/68">
                Browse your previously chosen combinations
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-full border border-white/40 bg-white/55 px-3 py-1 text-xs font-medium text-[#025a5a] backdrop-blur-md">
                {historyItems.length} total
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenClearAllDialog(true)}
                disabled={historyItems.length === 0 || historyLoading}
                className="rounded-full border-rose-200 bg-white/70 px-3 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Clear all
              </Button>
            </div>
          </div>

          {historyLoading ? (
            <div className="rounded-[28px] border border-white/40 bg-white/58 p-8 shadow-[0_10px_30px_rgba(2,48,48,0.08)] backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 animate-pulse rounded-2xl bg-[#e8faf6]" />
                <div>
                  <p className="font-poppins text-sm font-semibold text-[#023030]">
                    Loading your saved plans...
                  </p>
                  <p className="font-helvetica text-sm text-[#023030]/65">
                    We’re preparing your meal plan history.
                  </p>
                </div>
              </div>
            </div>
          ) : historyItems.length === 0 ? (
            <div className="rounded-[28px] border border-white/40 bg-white/58 p-8 shadow-[0_10px_30px_rgba(2,48,48,0.08)] backdrop-blur-xl">
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
              {historyItems.map((item, index) => {
                const isRestoring = actionLoadingId === item.id;

                return (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.04 }}
    className={`group overflow-hidden rounded-[28px] border p-[1px] shadow-[0_12px_34px_rgba(2,48,48,0.08)] transition hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(2,48,48,0.12)] ${
      item.selected
        ? "border-[#0a8f8f]/25 bg-[linear-gradient(135deg,rgba(234,255,247,0.92),rgba(255,255,255,0.92))]"
        : "border-white/45 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(245,252,252,0.88))]"
    }`}
  >
    <div className="overflow-hidden rounded-[27px] bg-white/66 backdrop-blur-xl">
      {/* Header */}
      <div
        className={`relative border-b border-white/45 px-5 pt-4 pb-3 md:px-6 md:pt-5 md:pb-4 ${
          item.selected
            ? "bg-[radial-gradient(circle_at_top_left,rgba(110,231,183,0.22),transparent_50%),radial-gradient(circle_at_top_right,rgba(191,219,254,0.45),transparent_44%),linear-gradient(135deg,rgba(240,253,250,0.92)_0%,rgba(255,255,255,0.9)_100%)]"
            : "bg-[radial-gradient(circle_at_top_left,rgba(163,230,220,0.28),transparent_50%),radial-gradient(circle_at_top_right,rgba(227,242,253,0.62),transparent_44%),linear-gradient(135deg,rgba(248,252,252,0.94)_0%,rgba(255,255,255,0.88)_100%)]"
        }`}
      >
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-white/50 bg-white/80 px-2.5 py-1 text-[11px] font-medium text-[#025a5a] backdrop-blur-md">
                <CalendarDays className="h-3.5 w-3.5" />
                {getAllowanceLabel(item.allowanceType)}
              </span>

              {item.selected && (
                <span className="rounded-full border border-emerald-200/80 bg-emerald-50/90 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                  Currently selected
                </span>
              )}

              {item.mealsPerDay ? (
                <span className="rounded-full border border-white/50 bg-white/80 px-2.5 py-1 text-[11px] font-medium text-[#023030]/75 backdrop-blur-md">
                  {item.mealsPerDay} meals/day
                </span>
              ) : null}
            </div>

            <h3 className="font-poppins mt-2.5 text-lg font-semibold tracking-[-0.02em] text-[#023030] md:text-[20px]">
              {item.title}
            </h3>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-[#023030]/62">
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5" />
                {item.date}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                {item.mood}
              </span>
            </div>
          </div>

          {/* Compact stats */}
          <div className="grid grid-cols-3 gap-2 lg:min-w-[250px]">
            <div className="rounded-2xl border border-white/45 bg-white/72 px-3 py-2.5 backdrop-blur-md">
              <p className="font-helvetica text-[10px] uppercase tracking-[0.08em] text-[#023030]/45">
                Budget
              </p>
              <p className="font-poppins mt-1 text-sm font-semibold text-[#023030]">
                {formatPeso(item.budget)}
              </p>
            </div>

            <div className="rounded-2xl border border-white/45 bg-white/72 px-3 py-2.5 backdrop-blur-md">
              <p className="font-helvetica text-[10px] uppercase tracking-[0.08em] text-[#023030]/45">
                Used
              </p>
              <p className="font-poppins mt-1 text-sm font-semibold text-[#023030]">
                {formatPeso(item.total)}
              </p>
            </div>

            <div className="rounded-2xl border border-white/45 bg-white/72 px-3 py-2.5 backdrop-blur-md">
              <p className="font-helvetica text-[10px] uppercase tracking-[0.08em] text-[#023030]/45">
                Left
              </p>
              <p className="font-poppins mt-1 text-sm font-semibold text-[#026d6d]">
                {formatPeso(item.remaining)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pt-4 pb-5 md:px-6 md:pt-4.5 md:pb-6">
        <p className="font-helvetica text-sm leading-6 text-[#023030]/68">
          A saved combination with {item.meals.length} meal
          {item.meals.length > 1 ? "s" : ""} that you can open, review, or use
          again.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {item.meals.slice(0, 4).map((meal) => (
            <span
              key={`${item.id}-${meal}`}
              className="rounded-full border border-white/45 bg-white/75 px-2.5 py-1 text-[11px] text-[#023030]/75"
            >
              {meal}
            </span>
          ))}

          {item.meals.length > 4 && (
            <span className="rounded-full border border-white/45 bg-white/75 px-2.5 py-1 text-[11px] text-[#023030]/75">
              +{item.meals.length - 4} more
            </span>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="rounded-xl border-white/45 bg-white/70 text-[#023030] hover:bg-white"
            onClick={() => openPlanDetails(item)}
          >
            View details
          </Button>

          <Button
            className="rounded-xl bg-[#023030] text-white hover:bg-[#034646]"
            onClick={() => restorePlan(item)}
            disabled={isRestoring || item.selected}
          >
            {item.selected
              ? "Currently selected"
              : isRestoring
              ? "Restoring..."
              : "Use again"}
          </Button>
        </div>
      </div>
    </div>
  </motion.div>
);
              })}
            </div>
          )}
        </motion.section>
      </div>

      <Dialog open={openDetails} onOpenChange={setOpenDetails}>
        <DialogContent className="max-w-2xl rounded-[28px] border-white/40 bg-white/90 text-[#023030] backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="font-poppins text-xl text-[#023030]">
              {selectedPlan?.title ?? "Saved Meal Plan"}
            </DialogTitle>
            <DialogDescription className="font-helvetica text-[#023030]/65">
              {selectedPlan?.date}
            </DialogDescription>
          </DialogHeader>

          {selectedPlan && (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/40 bg-white/60 p-4">
                  <p className="font-helvetica text-xs text-[#023030]/55">
                    Budget
                  </p>
                  <p className="font-poppins mt-1 text-base font-semibold">
                    {formatPeso(selectedPlan.budget)}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/40 bg-white/60 p-4">
                  <p className="font-helvetica text-xs text-[#023030]/55">
                    Used
                  </p>
                  <p className="font-poppins mt-1 text-base font-semibold">
                    {formatPeso(selectedPlan.total)}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/40 bg-white/60 p-4">
                  <p className="font-helvetica text-xs text-[#023030]/55">
                    Left
                  </p>
                  <p className="font-poppins mt-1 text-base font-semibold text-[#026d6d]">
                    {formatPeso(selectedPlan.remaining)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-[#E3F2FD] px-3 py-1 text-xs font-medium">
                  {selectedPlan.allowanceType}
                </span>

                <span className="rounded-full border border-white/45 bg-white/65 px-3 py-1 text-xs">
                  {selectedPlan.mealDetails.length} meals
                </span>

                {selectedPlan.selected && (
                  <span className="rounded-full bg-[#ccffe8] px-3 py-1 text-xs font-medium text-[#025a5a]">
                    Current plan
                  </span>
                )}
              </div>

              <div className="max-h-[300px] space-y-3 overflow-y-auto pr-2">
                {selectedPlan.mealDetails.map((meal, index) => (
                  <div
                    key={`${meal.mealName}-${index}`}
                    className="rounded-2xl border border-white/40 bg-white/60 px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-poppins text-sm font-semibold">
                          {meal.mealName}
                        </p>
                        <p className="font-helvetica mt-1 text-xs text-[#023030]/60">
                          {meal.establishmentName}
                        </p>

                        {meal.location && (
                          <div className="mt-2 inline-flex items-center gap-1 text-xs text-[#023030]/55">
                            <MapPin className="h-3.5 w-3.5" />
                            {meal.location}
                          </div>
                        )}
                      </div>

                      <span className="shrink-0 rounded-full bg-[#E3F2FD] px-3 py-1 text-xs font-semibold">
                        {formatPeso(meal.price)}
                      </span>
                    </div>

                    {(meal.tags?.length ?? 0) > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {meal.tags!.map((tag) => (
                          <span
                            key={`${meal.mealName}-${tag}`}
                            className="rounded-full border border-white/45 bg-white/70 px-2.5 py-1 text-[11px] text-[#023030]/75"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="mt-2 flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="rounded-xl border-white/45 bg-white/60 text-[#023030] hover:bg-white"
              onClick={() => setOpenDetails(false)}
            >
              Close
            </Button>

            {selectedPlan && (
              <Button
                className="rounded-xl bg-[#023030] text-white hover:bg-[#034646]"
                onClick={() => restorePlan(selectedPlan)}
                disabled={actionLoadingId === selectedPlan.id || selectedPlan.selected}
              >
                {selectedPlan.selected
                  ? "Currently selected"
                  : actionLoadingId === selectedPlan.id
                  ? "Restoring..."
                  : "Use again"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openClearAllDialog} onOpenChange={setOpenClearAllDialog}>
  <DialogContent className="overflow-hidden rounded-[30px] border border-white/50 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,251,251,0.96))] p-0 text-[#023030] shadow-[0_24px_80px_rgba(2,48,48,0.16)] sm:max-w-md">
    <div className="relative">
      <div className="pointer-events-none absolute -left-8 top-0 h-28 w-28 rounded-full bg-[#FFE4E6] blur-3xl" />
      <div className="pointer-events-none absolute -right-8 top-10 h-28 w-28 rounded-full bg-[#FEE2E2] blur-3xl" />

      <DialogHeader className="relative px-6 pb-4 pt-6 sm:px-7">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/50 bg-white/70 px-3 py-1.5 text-xs font-medium text-rose-600 shadow-sm backdrop-blur-md">
          <Trash2 className="h-3.5 w-3.5" />
          Delete saved plans
        </div>

        <DialogTitle className="mt-4 font-poppins text-2xl font-semibold tracking-tight text-[#023030]">
          Clear all history?
        </DialogTitle>

        <DialogDescription className="mt-2 text-sm leading-6 text-[#023030]/65">
          This will remove all your saved meal plans from history. You will not
          be able to recover them after clearing.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 px-6 pb-6 sm:px-7">
        <div className="rounded-[22px] border border-white/40 bg-white/72 p-4 shadow-[0_10px_24px_rgba(2,48,48,0.05)]">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#023030]/45">
            Before you continue
          </p>
          <p className="mt-2 text-sm leading-6 text-[#023030]/68">
            Make sure there are no meal plans here that you still want to view,
            compare, or use again.
          </p>
        </div>
      </div>

      <DialogFooter className="border-t border-[#edf3f3] bg-white/70 px-6 py-4 sm:px-7">
        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpenClearAllDialog(false)}
            disabled={clearingAll}
            className="h-11 rounded-2xl border-[#d8e6e6] bg-white text-[#023030] hover:bg-[#f6fbfb]"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleClearAllConfirmed}
            disabled={clearingAll}
            className="h-11 rounded-2xl bg-[linear-gradient(135deg,#be123c_0%,#e11d48_48%,#f43f5e_100%)] px-5 text-white shadow-[0_10px_24px_rgba(244,63,94,0.18)] hover:opacity-95"
          >
            {clearingAll ? "Clearing..." : "Yes, clear all"}
          </Button>
        </div>
      </DialogFooter>
    </div>
  </DialogContent>
</Dialog>
      <ActionResultModal
        open={openResultModal}
        onOpenChange={setOpenResultModal}
        title={resultTitle}
        message={resultMessage}
        variant={resultTitle === "Meal plan restored" ? "success" : "error"}
        buttonLabel="Close"
      />
    </div>
  );
}