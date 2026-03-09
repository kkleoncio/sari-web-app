"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Store,
  Wallet,
  RotateCcw,
  UtensilsCrossed,
} from "lucide-react";

import type {
  AllowanceType,
  EstablishmentCard,
  Meal,
  MealOption,
  NavKey,
} from "./types";
import { StatCard } from "@/components/home/cards/stat-card";
import { EstablishmentItem } from "@/components/home/cards/estab-item";
import { ExactSidebar } from "@/components/home/sidebar/exact-sidebar";
import { dummyMenu } from "@/components/home/data/dummy-menu";
import { MenuItemCard } from "@/components/home/cards/menu-item-card";

export default function HomePage() {
  const [allowanceType, setAllowanceType] =
    React.useState<AllowanceType>("daily");
  const [budget, setBudget] = React.useState<string>("500");
  const [mealsPerDay, setMealsPerDay] = React.useState<number>(3);

  const [options, setOptions] = React.useState<MealOption[]>([]);
  const [chosenIndex, setChosenIndex] = React.useState<number | null>(null);

  const [mealPlan, setMealPlan] = React.useState<Meal[]>([]);
  const [totalCost, setTotalCost] = React.useState(355);
  const [remaining, setRemaining] = React.useState(145);

  const [openBudgetModal, setOpenBudgetModal] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [activeNav, setActiveNav] = React.useState<NavKey>("dashboard");

  const refDashboard = React.useRef<HTMLDivElement | null>(null);
  const refEstablishments = React.useRef<HTMLDivElement | null>(null);
  const refMenu = React.useRef<HTMLDivElement | null>(null);
  const refHistory = React.useRef<HTMLDivElement | null>(null);
  const refCommunity = React.useRef<HTMLDivElement | null>(null);
  const refOptions = React.useRef<HTMLDivElement | null>(null);

  const isAutoScrollingRef = React.useRef(false);
  const autoScrollTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const mainRef = React.useRef<HTMLElement | null>(null);

  const glassCard =
  "rounded-3xl border border-white/40 bg-white/55 backdrop-blur-xl shadow-[0_10px_30px_rgba(2,48,48,0.10)]";

  const glassCardSoft =
    "rounded-2xl border border-white/35 bg-white/45 backdrop-blur-lg shadow-[0_8px_24px_rgba(2,48,48,0.08)]";

  const glassStat =
    "rounded-2xl border border-white/30 bg-white/18 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]";

  function formatPeso(n: number) {
    return `PHP ${n}`;
  }

  const refBudgetCard = React.useRef<HTMLDivElement | null>(null);

  const [showFloatingBudgetTracker, setShowFloatingBudgetTracker] = React.useState(false);

  React.useEffect(() => {
  const container = mainRef.current;
  const budgetEl = refBudgetCard.current;
  if (!container || !budgetEl) return;

  const checkBudgetVisibility = () => {
    const containerRect = container.getBoundingClientRect();
    const budgetRect = budgetEl.getBoundingClientRect();

    const isVisible =
      budgetRect.top < containerRect.bottom &&
      budgetRect.bottom > containerRect.top + 40;

    setShowFloatingBudgetTracker(!isVisible);
  };

  checkBudgetVisibility();
  container.addEventListener("scroll", checkBudgetVisibility, { passive: true });
  window.addEventListener("resize", checkBudgetVisibility);

  return () => {
    container.removeEventListener("scroll", checkBudgetVisibility);
    window.removeEventListener("resize", checkBudgetVisibility);
  };
}, []);

  const scrollToRef = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current || !mainRef.current) return;

    const container = mainRef.current;
    const target = ref.current;

    isAutoScrollingRef.current = true;

    if (autoScrollTimeoutRef.current) {
      clearTimeout(autoScrollTimeoutRef.current);
    }

    container.scrollTo({
      top: target.offsetTop - 24,
      behavior: "smooth",
    });

    autoScrollTimeoutRef.current = setTimeout(() => {
      isAutoScrollingRef.current = false;
    }, 500);
  };

  const sectionMap = React.useMemo(
    () => [
      { key: "dashboard" as NavKey, ref: refDashboard },
      { key: "establishments" as NavKey, ref: refEstablishments },
      { key: "menu" as NavKey, ref: refMenu },
      { key: "history" as NavKey, ref: refHistory },
      { key: "community" as NavKey, ref: refCommunity },
    ],
    []
  );

  React.useEffect(() => {
    const container = mainRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (isAutoScrollingRef.current) return;

      const scrollTop = container.scrollTop;
      const offset = 120;

      let current: NavKey = "dashboard";

      for (const section of sectionMap) {
        const el = section.ref.current;
        if (!el) continue;

        if (scrollTop >= el.offsetTop - offset) {
          current = section.key;
        }
      }

      setActiveNav((prev) => (prev === current ? prev : current));
    };

    handleScroll();
    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);

      if (autoScrollTimeoutRef.current) {
        clearTimeout(autoScrollTimeoutRef.current);
      }
    };
  }, [sectionMap, options.length, mealPlan.length]);

  const [establishments] = React.useState<EstablishmentCard[]>([
    {
      id: "1",
      name: "Aling Baby’s",
      address: "UPLB",
      distanceM: 150,
      rating: 4.4,
      priceMin: 70,
      priceMax: 160,
      hours: "8AM - 9PM",
      tags: ["Healthy", "Veg-friendly"],
      imageUrl:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop",
    },
    {
      id: "2",
      name: "Aling Baby’s",
      address: "UPLB",
      distanceM: 180,
      rating: 4.4,
      priceMin: 70,
      priceMax: 160,
      hours: "8AM - 9PM",
      tags: ["Healthy", "Veg-friendly"],
      imageUrl:
        "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1200&auto=format&fit=crop",
    },
    {
      id: "3",
      name: "Aling Baby’s",
      address: "UPLB",
      distanceM: 210,
      rating: 4.4,
      priceMin: 70,
      priceMax: 160,
      hours: "8AM - 9PM",
      tags: ["Healthy", "Veg-friendly"],
      imageUrl:
        "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?q=80&w=1200&auto=format&fit=crop",
    },
  ]);

  const numericBudget = Number(budget || 0);

  const resetAll = () => {
    setOptions([]);
    setChosenIndex(null);
    setMealPlan([]);
    setTotalCost(0);
    setRemaining(0);
  };

  const handleGenerate = async () => {
    if (!numericBudget || numericBudget <= 0) return;

    setLoading(true);
    setSaving(false);
    setChosenIndex(null);

    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        alert("Please login first");
        return;
      }

      const res = await fetch("/api/mealplans/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          budget: numericBudget,
          allowanceType,
          mealsPerDay,
          count: 6,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to generate meal plan options");
        return;
      }

      const opts: MealOption[] = data.options || [];
      setOptions(opts);

      const first = opts[0];
      setMealPlan(first?.meals || []);
      setTotalCost(first?.totalCost || 0);
      setRemaining(first?.remainingBudget ?? 0);

      setActiveNav("menu");
      scrollToRef(refOptions);
    } catch (err) {
      console.error(err);
      alert("Error generating meal plan options");
    } finally {
      setLoading(false);
    }
  };

  const handleChoose = async (index: number) => {
    const option = options[index];
    if (!option) return;

    setSaving(true);

    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        alert("Please login first");
        return;
      }

      setChosenIndex(index);
      setMealPlan(option.meals);
      setTotalCost(option.totalCost);
      setRemaining(option.remainingBudget);

      const res = await fetch("/api/mealplans/choose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          allowanceType,
          budget: numericBudget,
          mealsPerDay,
          selectedOption: option,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to save selected plan");
        return;
      }

      alert("Saved! ✅");
    } catch (err) {
      console.error(err);
      alert("Error saving selected plan");
    } finally {
      setSaving(false);
    }
  };

  const usedAmount = totalCost;
  const budgetAmount = numericBudget || 0;
  const remainingAmount = Math.max(0, remaining);

  const budgetProgress =
  budgetAmount > 0 ? Math.min((usedAmount / budgetAmount) * 100, 100) : 0;

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
        staggerChildren: 0.08,
      },
    },
  };


  return (
    <div
      className="h-screen overflow-hidden text-[#023030]"
      style={{
        background:
          "radial-gradient(circle at top right, rgba(204,255,232,0.75) 0%, rgba(204,255,232,0) 26%), radial-gradient(circle at bottom left, rgba(227,242,253,0.85) 0%, rgba(227,242,253,0) 32%), linear-gradient(180deg, #f7fbfb 0%, #eef7f7 100%)",
      }}
    >
      <div className="flex h-full">
        <ExactSidebar
          active={activeNav}
          onChange={(value) => {
            setActiveNav(value);

            if (value === "dashboard") scrollToRef(refDashboard);
            if (value === "establishments") scrollToRef(refEstablishments);
            if (value === "menu") scrollToRef(refMenu);
            if (value === "history") scrollToRef(refHistory);
            if (value === "community") scrollToRef(refCommunity);
          }}
        />

        <main
          ref={mainRef}
          className="scrollbar-thumb-rounded-full scrollbar-thin scrollbar-thumb-[#d9e4e4] scrollbar-track-transparent flex-1 overflow-y-auto px-6 py-8 md:px-15 lg:px-20"
        >
          <div className="mx-auto max-w-6xl space-y-8">
            <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_70%_20%,rgba(204,255,232,0.18),transparent_20%),radial-gradient(circle_at_30%_80%,rgba(227,242,253,0.22),transparent_24%)]" />

            <motion.section
              ref={refDashboard}
              className="scroll-mt-8"
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              <h1 className="font-poppins text-[28px] font-semibold tracking-tight text-[#025a5a]">
                Hello, Kathleen Kate!
              </h1>
            </motion.section>

            <motion.section
              ref={refBudgetCard}
              className="scroll-mt-8"
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              <div className={cn(
                glassCard,
                "relative overflow-hidden p-5 before:absolute before:inset-0 before:bg-[linear-gradient(135deg,rgba(255,255,255,0.18),transparent_45%)] before:pointer-events-none"
              )}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-0 rounded-xl border border-white/50 p-2 text-[#023030] backdrop-blur-md  font-light">
                      <Wallet className="h-8 w-8" />
                    </div>

                    <div>
                      <h2 className="font-poppins text-lg font-semibold text-[#023030]">
                        Current Budget
                      </h2>
                      <p className="font-helvetica text-sm font-light text-[#023030]/65">
                        {allowanceType === "daily"
                          ? "Daily allowance"
                          : "Weekly allowance"}{" "}
                        - {mealsPerDay} meals per day
                      </p>
                    </div>
                  </div>

                  <Dialog
                    open={openBudgetModal}
                    onOpenChange={setOpenBudgetModal}
                  >
                    <DialogTrigger asChild>
                      <Button className="font-poppins rounded-xl bg-[#E3F2FD] text-[#023030] hover:bg-[#d1eafb] focus-visible:ring-2 focus-visible:ring-[#023030] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                        <Wallet className="mr-2 h-4 w-4" />
                        Set Budget
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="rounded-3xl">
                      <DialogHeader>
                        <DialogTitle>Set your budget</DialogTitle>
                        <DialogDescription>
                          Update your allowance type, budget, and meals per day.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="grid gap-4 py-2">
                        <div className="grid gap-2">
                          <Label>Allowance type</Label>
                          <Select
                            value={allowanceType}
                            onValueChange={(v) =>
                              setAllowanceType(v as AllowanceType)
                            }
                          >
                            <SelectTrigger className="rounded-xl">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid gap-2">
                          <Label>Budget amount</Label>
                          <Input
                            type="number"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            placeholder="Enter your budget"
                            className="rounded-xl"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label>Meals per day</Label>
                          <Input
                            type="number"
                            min={1}
                            max={6}
                            value={mealsPerDay}
                            onChange={(e) =>
                              setMealsPerDay(
                                Math.min(6, Math.max(1, Number(e.target.value) || 1))
                              )
                            }
                            className="rounded-xl"
                          />
                        </div>
                      </div>

                      <DialogFooter>
                        <Button
                          variant="outline"
                          className="rounded-xl"
                          onClick={() => setOpenBudgetModal(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="rounded-xl bg-[#026d6d] text-white hover:bg-[#023030]"
                          onClick={() => setOpenBudgetModal(false)}
                        >
                          Save
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <motion.div
                  className="font-poppins mt-5 grid grid-cols-1 gap-3 md:grid-cols-3"
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                >
                  <motion.div variants={fadeUp}>
                    <StatCard label="Budget" value={formatPeso(numericBudget || 0)} />
                  </motion.div>
                  <motion.div variants={fadeUp}>
                    <StatCard label="Remaining" value={formatPeso(remaining)} />
                  </motion.div>
                  <motion.div variants={fadeUp}>
                    <StatCard label="Used" value={formatPeso(totalCost)} />
                  </motion.div>
                </motion.div>

                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-helvetica text-sm font-light text-[#023030]/70">
                    Set a budget to generate meal combinations.
                  </p>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      className="rounded-xl border-[#d9e4e4] bg-[#E3F2FD] text-[#023030] hover:bg-[#d4ebfb]"
                      onClick={resetAll}
                      disabled={loading || saving}
                    >
                      <RotateCcw className="font-poppins mr-2 h-4 w-4" />
                      Reset
                    </Button>

                    <Button
                      onClick={handleGenerate}
                      disabled={loading || saving || !numericBudget}
                      className="rounded-xl bg-[#FBE1AD] text-[#023030] hover:bg-[#f7d692]"
                    >
                      <UtensilsCrossed className="font-poppins mr-2 h-4 w-4" />
                      {loading ? "Generating..." : "Generate Options"}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.section>

            <section ref={refEstablishments} className="scroll-mt-8 space-y-4">
              <motion.div
                className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-lg bg-[#E3F2FD] p-2 text-[#023030]">
                    <Store className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="font-poppins text-xl font-semibold text-[#023030]">
                      Establishments
                    </h2>
                    <p className="font-helvetica text-sm font-light text-[#023030]/70">
                      Browse establishments
                    </p>
                  </div>
                </div>

                <p className="font-helvetica text-sm font-light text-[#023030]/70">
                  Showing {establishments.length} establishments near you
                </p>
              </motion.div>

              <motion.div
                className="font-poppins grid gap-1 md:grid-cols-2 xl:grid-cols-3"
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.15 }}
              >
                {establishments.map((item) => (
                  <motion.div key={item.id} variants={fadeUp}>
                    <EstablishmentItem item={item} />
                  </motion.div>
                ))}
              </motion.div>
            </section>

            <section ref={refMenu} className="scroll-mt-8 space-y-4">

              
      <motion.div
        className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="mt-1 flex items-start gap-3">
          <div className="mt-1 rounded-lg bg-[#E3F2FD] p-2 text-[#023030]">
            <Store className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-poppins text-xl font-semibold text-[#023030]">
              Meals
            </h2>
            <p className="font-helvetica text-sm font-light text-[#023030]/70">
              Browse meals from establishments
            </p>
          </div>
        </div>

        <p className="font-helvetica text-sm font-light text-[#023030]/70">
          Showing {dummyMenu.length} meals available
        </p>
      </motion.div>

      <motion.div
        className="grid gap-1 md:grid-cols-2 xl:grid-cols-3 font-poppins"
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
      >
        {dummyMenu.map((item) => (
          <motion.div key={item.id} variants={fadeUp}>
            <MenuItemCard item={item} />
          </motion.div>
        ))}
      </motion.div>
    </section>

            <section
              ref={refHistory}
              className="scroll-mt-8 rounded-2xl border border-dashed border-[#023030]/20 bg-white p-6"
            >
              <h2 className="font-poppins text-2xl font-bold text-[#023030]">
                History
              </h2>
              <p className="font-helvetica mt-2 text-sm font-light text-[#023030]/70">
                You can connect this section to previously saved meal plans later.
              </p>
            </section>

            <section
              ref={refCommunity}
              className="scroll-mt-8 rounded-2xl border border-dashed border-[#023030]/20 bg-white p-6"
            >
              <h2 className="font-poppins text-2xl font-bold text-[#023030]">
                Community
              </h2>
              <p className="font-helvetica mt-2 text-sm font-light text-[#023030]/70">
                You can use this for recommendations, reviews, or student food
                tips.
              </p>
            </section>
          </div>

          {showFloatingBudgetTracker && budgetAmount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="pointer-events-none sticky bottom-0 z-30 mt-6 flex justify-center"
            >
            <div className="pointer-events-auto w-full max-w-full rounded-2xl border border-white/50 bg-white/70 px-4 py-3 backdrop-blur-xl shadow-[0_12px_32px_rgba(2,48,48,0.14)]">
              <div className="flex items-center gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="rounded-xl bg-[#023030] p-2 text-white">
                    <Wallet className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between text-[12px]">
                      <span className="font-poppins font-semibold text-[#023030]">
                        {formatPeso(remainingAmount)} left
                      </span>
                      <span className="font-helvetica text-[#023030]/60">
                        {formatPeso(usedAmount)} / {formatPeso(budgetAmount)}
                      </span>
                    </div>

                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#dfeeed]">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(135deg,#022b2b_0%,#033f3f_45%,#046d6d_90%,#0a8f8f_100%)] transition-all duration-300"
                        style={{ width: `${budgetProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <Button
                  size="sm"
                  className="font-poppins h-9 shrink-0 rounded-lg bg-[#023030] px-3 text-xs text-white hover:bg-[#034646]"
                >
                  Add Meal
                </Button>
              </div>
            </div>
          </motion.div>
)}
        </main>
      </div>
    </div>
  );
}