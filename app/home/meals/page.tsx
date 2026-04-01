"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  MapPin,
  Store,
  Plus,
  Flame,
  Soup,
  Leaf,
  HeartPulse,
  Clock3,
  UtensilsCrossed,
  Sparkles,
  Grid2X2,
  Rows3,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GlassSelect } from "@/components/ui/glass-select";
import type { Meal } from "@/app/home/types";
import { toast } from "sonner";
import { HoverTooltip } from "@/components/ui/hover-tooltip";

type SortOption =
  | "name-asc"
  | "name-desc"
  | "price-low-high"
  | "price-high-low"
  | "establishment-asc";

type ViewMode = "grid" | "compact";

function formatLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatPeso(value: number) {
  return `₱${value}`;
}

function formatLocation(value?: string) {
  if (!value) return "Los Baños, Laguna";

  const locationMap: Record<string, string> = {
    lopez_ave: "Lopez Avenue, Los Baños",
    raymundo: "Raymundo, Los Baños",
    vega_centre: "Vega Centre, Los Baños",
    demarces: "Demarces, Los Baños",
    uplb: "UPLB, Los Baños",
    agapita: "Agapita, Los Baños",
    grove: "Grove, Los Baños",
    ruby: "Ruby St., Los Baños",
    es_plaza: "ES Plaza, Los Baños",
  };

  return locationMap[value] ?? `${formatLabel(value)}, Los Baños`;
}

function getMealAccent(meal: Meal) {
  if (meal.isVegetarian) {
    return {
      glow: "bg-emerald-300/30",
      pill: "bg-emerald-50/90 text-emerald-700 ring-emerald-100",
      iconBg:
        "bg-[linear-gradient(135deg,rgba(16,185,129,0.18),rgba(255,255,255,0.85))] text-emerald-700",
      ring: "ring-emerald-200/70",
    };
  }

  if (meal.isSoup) {
    return {
      glow: "bg-sky-300/30",
      pill: "bg-sky-50/90 text-sky-700 ring-sky-100",
      iconBg:
        "bg-[linear-gradient(135deg,rgba(56,189,248,0.18),rgba(255,255,255,0.85))] text-sky-700",
      ring: "ring-sky-200/70",
    };
  }

  if (meal.isFried) {
    return {
      glow: "bg-amber-300/30",
      pill: "bg-amber-50/90 text-amber-700 ring-amber-100",
      iconBg:
        "bg-[linear-gradient(135deg,rgba(251,191,36,0.18),rgba(255,255,255,0.85))] text-amber-700",
      ring: "ring-amber-200/70",
    };
  }

  return {
    glow: "bg-teal-300/30",
    pill: "bg-teal-50/90 text-teal-700 ring-teal-100",
    iconBg:
      "bg-[linear-gradient(135deg,rgba(20,184,166,0.18),rgba(255,255,255,0.85))] text-teal-700",
    ring: "ring-teal-200/70",
  };
}

function StatPill({
  icon,
  children,
  className = "",
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-white/45 bg-white/72 px-3 py-1.5 text-xs text-[#023030]/78 shadow-[0_6px_18px_rgba(2,48,48,0.05)] backdrop-blur-md ring-1 ring-[#023030]/5 ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}

function MealCard({
  meal,
  onAddMeal,
  compact = false,
}: {
  meal: Meal;
  onAddMeal: (meal: Meal) => void;
  compact?: boolean;
}) {
  const accent = getMealAccent(meal);

  if (compact) {
    return (
      <motion.div
        layout
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 240, damping: 20 }}
        className="group relative overflow-hidden rounded-[28px] border border-white/45 bg-white/48 p-[1px] shadow-[0_14px_40px_rgba(2,48,48,0.08)] backdrop-blur-2xl"
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.55),rgba(255,255,255,0.1))]" />
        <div
          className={`pointer-events-none absolute -left-8 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full ${accent.glow} blur-3xl transition duration-500 group-hover:scale-125`}
        />
        <div className="pointer-events-none absolute right-0 top-0 h-16 w-24 rounded-full bg-white/35 blur-2xl" />

        <div className="relative rounded-[27px] bg-white/58 p-4 backdrop-blur-2xl md:p-5">
          <div className="flex items-start gap-3.5">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${accent.iconBg} ring-1 ${accent.ring} shadow-[0_10px_24px_rgba(2,48,48,0.08)]`}
            >
              <UtensilsCrossed className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-poppins text-base font-semibold text-[#023030]">
                    {meal.mealName}
                  </h3>

                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-[#023030]/62">
                    <span className="inline-flex items-center gap-1">
                      <Store className="h-3.5 w-3.5" />
                      {meal.establishmentName}
                    </span>
                    <span className="text-[#023030]/25">•</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {formatLocation(meal.location)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="rounded-full border border-white/50 bg-white/80 px-3.5 py-1.5 text-sm font-semibold text-[#026d6d] shadow-[0_6px_18px_rgba(2,48,48,0.05)] ring-1 ring-[#026d6d]/8 backdrop-blur-md">
                    {formatPeso(meal.price)}
                  </div>

                  <Button
                    type="button"
                    onClick={() => onAddMeal(meal)}
                    className="h-10 rounded-2xl border border-white/20 bg-[linear-gradient(135deg,#023030_0%,#035c5c_100%)] px-3.5 text-white shadow-[0_12px_24px_rgba(2,48,48,0.18)] transition hover:scale-[1.02] hover:bg-[linear-gradient(135deg,#034646_0%,#046d6d_100%)]"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-3.5 flex flex-wrap gap-2">
                <StatPill>{formatLabel(meal.foodType)}</StatPill>
                <StatPill>{formatLabel(meal.category)}</StatPill>

                {meal.mealTime?.map((time, index) => (
                  <StatPill
                    key={`${meal._id}-${time}-${index}`}
                    icon={<Clock3 className="h-3 w-3 text-[#026d6d]" />}
                  >
                    {formatLabel(time)}
                  </StatPill>
                ))}

                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 backdrop-blur-md bg-rose-50/90 text-rose-700 ring-rose-100">
                  <HeartPulse className="h-3.5 w-3.5" />
                  {meal.healthScore}
                </span>

                {meal.isFried && (
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 backdrop-blur-md bg-amber-50/90 text-amber-700 ring-amber-100">
                    <Flame className="h-3.5 w-3.5" />
                    Fried
                  </span>
                )}

                {meal.isSoup && (
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 backdrop-blur-md bg-sky-50/90 text-sky-700 ring-sky-100">
                    <Soup className="h-3.5 w-3.5" />
                    Soup
                  </span>
                )}

                {meal.isVegetarian && (
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 backdrop-blur-md bg-emerald-50/90 text-emerald-700 ring-emerald-100">
                    <Leaf className="h-3.5 w-3.5" />
                    Vegetarian
                  </span>
                )}

                {(meal.tags ?? []).slice(0, 3).map((tag, index) => (
                  <span
                    key={`${meal._id}-tag-${index}`}
                    className="rounded-full border border-white/40 bg-[#edf9f7]/85 px-3 py-1.5 text-xs font-medium text-[#025a5a] ring-1 ring-[#025a5a]/8 backdrop-blur-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
  <motion.div
    whileHover={{ y: -6 }}
    transition={{ type: "spring", stiffness: 220, damping: 18 }}
    className="group relative overflow-hidden rounded-[32px] border border-white/50 bg-white/40 p-[1px] shadow-[0_18px_50px_rgba(2,48,48,0.08)] backdrop-blur-2xl"
  >
    {/* glass border */}
    <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.55),rgba(255,255,255,0.1))]" />

    <div className="relative rounded-[31px] bg-white/60 backdrop-blur-2xl overflow-hidden">

      {/* 🔥 IMAGE HEADER */}
      <div className="relative h-40 w-full">
        {meal.imageUrl ? (
          <Image
            src={meal.imageUrl}
            alt={meal.mealName}
            fill
            className="object-cover transition duration-700 group-hover:scale-[1.05]"
          />
        ) : (
          <div className="h-full w-full bg-[linear-gradient(135deg,#0f766e,#14b8a6)]" />
        )}

        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-white/90" />

        {/* category */}
        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium backdrop-blur-md">
            {formatLabel(meal.category)}
          </span>
        </div>

        {/* price */}
        <div className="absolute right-4 top-4 rounded-2xl bg-white/85 px-4 py-2 text-sm font-semibold shadow backdrop-blur-md">
          ₱ {meal.price.toFixed(2)}
        </div>
      </div>

      {/* 🔥 CONTENT */}
      <div className="p-5">
        {/* title */}
        <h3 className="font-poppins text-xl font-semibold text-[#023030]">
          {meal.mealName}
        </h3>

        {/* establishment */}
        <div className="mt-1 flex items-center gap-2 text-sm text-[#023030]/60">
          <Store className="h-4 w-4" />
          {meal.establishmentName}
        </div>

        {/* description (optional if you have one) */}
        {/* <p className="mt-3 text-sm text-[#023030]/70">
          Easy to fit into a student budget and daily meal plan.
        </p> */}

        {/* badges */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700">
            Student-budget friendly
          </span>

          <span className="rounded-full bg-white px-3 py-1 text-xs text-[#023030]/70 ring-1 ring-[#023030]/10">
            Popular pick
          </span>

          {meal.isFried && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-700">
              Fried
            </span>
          )}
        </div>

        {/* divider */}
        <div className="my-4 h-px bg-[#023030]/10" />

        {/* footer */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] tracking-wider text-[#023030]/40">
              BEST FOR
            </p>
            <p className="text-sm font-medium text-[#023030]">
              {meal.mealTime?.join(" / ") || "Any time"}
            </p>
          </div>

          <Button
            onClick={() => onAddMeal(meal)}
            className="rounded-2xl bg-[#026d6d] px-5 text-white shadow-md hover:bg-[#025555]"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add
          </Button>
        </div>
      </div>
    </div>
  </motion.div>
);
}

export default function AllMealsPage() {
  const [meals, setMeals] = React.useState<Meal[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [selectedFoodType, setSelectedFoodType] = React.useState("all");
  const [selectedPrice, setSelectedPrice] = React.useState("all");
  const [selectedMealTime, setSelectedMealTime] = React.useState("all");
  const [sortBy, setSortBy] = React.useState<SortOption>("establishment-asc");
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid");

  function handleAddMeal(meal: Meal) {
    if (typeof window === "undefined") return;

    const existingManualMeals: Meal[] = JSON.parse(
      localStorage.getItem("manualMealPlan") || "[]"
    );

    const alreadyAdded = existingManualMeals.some(
      (item) => item._id === meal._id
    );

    if (alreadyAdded) {
      toast("Already added", {
        description: `${meal.mealName} is already in your meal plan.`,
        className:
          "border border-[#0b6b57]/20 bg-[#EAF8F4] text-[#023030] [&_[data-title]]:!text-[#0b6b57] [&_[data-description]]:!text-[#023030]/80 [&_[data-description]]:!opacity-100",
        classNames: {
          title: "!text-[#0b6b57] font-semibold",
          description: "!text-[#7a4b00]/90 text-sm !opacity-100",
        },
      });
      return;
    }

    const updatedMeals = [...existingManualMeals, meal];

    localStorage.setItem("manualMealPlan", JSON.stringify(updatedMeals));
    localStorage.setItem("currentPlanSource", "manual");
    window.dispatchEvent(new Event("manualMealPlanUpdated"));

    toast.success("Meal added", {
      description: `${meal.mealName} was added to your meal plan.`,
      className:
        "border border-[#0b6b57]/20 bg-[#EAF8F4] text-[#023030] [&_[data-title]]:!text-[#0b6b57] [&_[data-description]]:!text-[#023030]/80 [&_[data-description]]:!opacity-100",
      classNames: {
        title: "!text-[#0b6b57] font-semibold",
        description: "!text-[#023030]/80 text-sm !opacity-100",
      },
    });
  }

  React.useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/meals");
        const data = await res.json();

        if (data.ok) {
          setMeals(data.meals ?? []);
        }
      } catch (error) {
        console.error("Failed to load meals:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const categories = React.useMemo(() => {
    return Array.from(
      new Set(meals.map((meal) => meal.category).filter(Boolean))
    ).sort();
  }, [meals]);

  const foodTypes = React.useMemo(() => {
    return Array.from(
      new Set(meals.map((meal) => meal.foodType).filter(Boolean))
    ).sort();
  }, [meals]);

  const mealTimes = React.useMemo(() => {
    return Array.from(
      new Set(meals.flatMap((meal) => (meal.mealTime ?? []).filter(Boolean)))
    ).sort();
  }, [meals]);

  const categoryOptions = React.useMemo(
    () => [
      { value: "all", label: "All categories" },
      ...categories.map((category) => ({
        value: category,
        label: formatLabel(category),
      })),
    ],
    [categories]
  );

  const foodTypeOptions = React.useMemo(
    () => [
      { value: "all", label: "All meal types" },
      ...foodTypes.map((foodType) => ({
        value: foodType,
        label: formatLabel(foodType),
      })),
    ],
    [foodTypes]
  );

  const mealTimeOptions = React.useMemo(
    () => [
      { value: "all", label: "Any meal time" },
      ...mealTimes.map((mealTime) => ({
        value: mealTime,
        label: formatLabel(mealTime),
      })),
    ],
    [mealTimes]
  );

  const priceOptions = React.useMemo(
    () => [
      { value: "all", label: "All prices" },
      { value: "under50", label: "Under PHP 50" },
      { value: "50to99", label: "PHP 50–99" },
      { value: "100plus", label: "PHP 100+" },
    ],
    []
  );

  const sortOptions = React.useMemo(
    () => [
      { value: "name-asc", label: "Name: A to Z" },
      { value: "name-desc", label: "Name: Z to A" },
      { value: "price-low-high", label: "Price: Low to High" },
      { value: "price-high-low", label: "Price: High to Low" },
      { value: "establishment-asc", label: "Establishment: A to Z" },
    ],
    []
  );

  const filteredMeals = React.useMemo(() => {
    const filtered = meals.filter((meal) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        meal.mealName.toLowerCase().includes(searchText) ||
        meal.establishmentName.toLowerCase().includes(searchText) ||
        meal.foodType.toLowerCase().includes(searchText) ||
        meal.category.toLowerCase().includes(searchText) ||
        (meal.tags ?? []).some((tag) => tag.toLowerCase().includes(searchText));

      const matchesCategory =
        selectedCategory === "all" || meal.category === selectedCategory;

      const matchesFoodType =
        selectedFoodType === "all" || meal.foodType === selectedFoodType;

      const matchesMealTime =
        selectedMealTime === "all" ||
        (meal.mealTime ?? []).includes(selectedMealTime);

      const matchesPrice =
        selectedPrice === "all" ||
        (selectedPrice === "under50" && meal.price < 50) ||
        (selectedPrice === "50to99" && meal.price >= 50 && meal.price <= 99) ||
        (selectedPrice === "100plus" && meal.price >= 100);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesFoodType &&
        matchesMealTime &&
        matchesPrice
      );
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "name-asc") return a.mealName.localeCompare(b.mealName);
      if (sortBy === "name-desc") return b.mealName.localeCompare(a.mealName);
      if (sortBy === "price-low-high") return a.price - b.price;
      if (sortBy === "price-high-low") return b.price - a.price;
      if (sortBy === "establishment-asc") {
        return a.establishmentName.localeCompare(b.establishmentName);
      }
      return 0;
    });
  }, [
    meals,
    search,
    selectedCategory,
    selectedFoodType,
    selectedPrice,
    selectedMealTime,
    sortBy,
  ]);

  const hasActiveFilters =
    search.trim() !== "" ||
    selectedCategory !== "all" ||
    selectedFoodType !== "all" ||
    selectedPrice !== "all" ||
    selectedMealTime !== "all" ||
    sortBy !== "name-asc";

  function clearFilters() {
    setSearch("");
    setSelectedCategory("all");
    setSelectedFoodType("all");
    setSelectedPrice("all");
    setSelectedMealTime("all");
    setSortBy("name-asc");
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden text-[#023030]"
      style={{
        background: `
          radial-gradient(circle at 8% 12%, rgba(45, 212, 191, 0.20) 0%, transparent 24%),
          radial-gradient(circle at 82% 10%, rgba(20, 184, 166, 0.17) 0%, transparent 30%),
          radial-gradient(circle at 88% 72%, rgba(6, 182, 212, 0.12) 0%, transparent 28%),
          radial-gradient(circle at 18% 84%, rgba(167, 243, 208, 0.22) 0%, transparent 28%),
          radial-gradient(circle at 52% 30%, rgba(255,255,255,0.65) 0%, transparent 34%),
          linear-gradient(180deg, #f7fcfb 0%, #edf8f7 52%, #f8fcfb 100%)
        `,
      }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.7),transparent_60%)]" />
      <div className="pointer-events-none absolute left-[10%] top-32 h-28 w-28 rounded-full bg-white/30 blur-3xl" />
      <div className="pointer-events-none absolute right-[8%] top-24 h-36 w-36 rounded-full bg-teal-100/40 blur-3xl" />

      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 lg:px-12 lg:py-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative overflow-hidden rounded-[34px] border border-white/50 bg-white/44 p-6 shadow-[0_18px_55px_rgba(2,48,48,0.08)] backdrop-blur-2xl md:p-8"
        >
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.52),rgba(255,255,255,0.08))]" />
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-200/35 blur-3xl" />
          <div className="pointer-events-none absolute -left-12 bottom-0 h-32 w-32 rounded-full bg-cyan-200/20 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <Link
                href="/home"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/64 px-3.5 py-1.5 text-sm font-medium text-[#026d6d] shadow-[0_8px_20px_rgba(2,48,48,0.05)] backdrop-blur-md transition hover:text-[#023030]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </Link>

              {/* <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/68 px-3.5 py-1.5 text-xs font-medium text-[#025a5a] shadow-[0_8px_20px_rgba(2,48,48,0.05)] backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" />
                Student-friendly meal browsing around Elbi
              </div> */}

              <h1 className="mt-4 font-poppins text-3xl font-semibold tracking-[-0.03em] text-[#023030] md:text-4xl">
                Browse all meals
              </h1>

              <p className="font-helvetica mt-3 max-w-xl text-sm leading-6 text-[#023030]/68 md:text-[15px]">
                Explore meals across campus, compare prices, and find options
                that fit your budget, cravings, and routine.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative overflow-hidden rounded-[26px] border border-white/45 bg-white/58 px-5 py-4 shadow-[0_10px_28px_rgba(2,48,48,0.06)] backdrop-blur-xl">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.45),rgba(255,255,255,0.08))]" />
                <div className="relative">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[#023030]/45">
                    Showing
                  </p>
                  <p className="mt-1 font-poppins text-2xl font-semibold text-[#026d6d]">
                    {filteredMeals.length}
                  </p>
                  <p className="text-sm text-[#023030]/60">meals</p>
                </div>
              </div>

              {/* <div className="rounded-[26px] border border-white/45 bg-white/58 p-1.5 shadow-[0_10px_28px_rgba(2,48,48,0.06)] backdrop-blur-xl">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition ${
                      viewMode === "grid"
                        ? "bg-[linear-gradient(135deg,#023030_0%,#046d6d_100%)] text-white shadow-[0_10px_20px_rgba(2,48,48,0.18)]"
                        : "text-[#026d6d] hover:bg-white/65"
                    }`}
                  >
                    <Grid2X2 className="h-4 w-4" />
                    Grid
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode("compact")}
                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition ${
                      viewMode === "compact"
                        ? "bg-[linear-gradient(135deg,#023030_0%,#046d6d_100%)] text-white shadow-[0_10px_20px_rgba(2,48,48,0.18)]"
                        : "text-[#026d6d] hover:bg-white/65"
                    }`}
                  >
                    <Rows3 className="h-4 w-4" />
                    Compact
                  </button>
                </div>
              </div> */}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.45 }}
          className="relative mt-6 overflow-hidden rounded-[32px] border border-white/50 bg-white/44 p-4 shadow-[0_16px_44px_rgba(2,48,48,0.08)] backdrop-blur-2xl md:p-5"
        >
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.42),rgba(255,255,255,0.08))]" />
          <div className="pointer-events-none absolute right-0 top-0 h-24 w-32 rounded-full bg-white/30 blur-2xl" />

          <div className="relative">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/72 px-3.5 py-1.5 text-sm font-medium text-[#023030]/78 shadow-[0_8px_20px_rgba(2,48,48,0.05)] backdrop-blur-md">
                <SlidersHorizontal className="h-4 w-4 text-[#026d6d]" />
                Filters and sorting
              </div>

              <Button
                type="button"
                variant="ghost"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="rounded-2xl px-4 text-[#026d6d] hover:bg-white/50 hover:text-[#023030]"
              >
                Clear all
              </Button>
            </div>

            <div className="grid gap-3 xl:grid-cols-[1.45fr_0.62fr_0.62fr_0.62fr_0.62fr_0.72fr]">
              <div className="relative h-12 overflow-hidden rounded-2xl border border-white/50 bg-white/60 shadow-[0_8px_24px_rgba(2,48,48,0.06)] backdrop-blur-xl transition hover:bg-white/68 focus-within:border-[#026d6d]/35">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#023030]/45" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by meal, establishment, type, or tag"
                  className="h-full border-0 bg-transparent pl-11 pr-4 text-sm text-[#023030] placeholder:text-[#023030]/42 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>

              <GlassSelect
                value={selectedCategory}
                onValueChange={setSelectedCategory}
                options={categoryOptions}
                placeholder="All categories"
              />

              <GlassSelect
                value={selectedFoodType}
                onValueChange={setSelectedFoodType}
                options={foodTypeOptions}
                placeholder="All meal types"
              />

              <GlassSelect
                value={selectedMealTime}
                onValueChange={setSelectedMealTime}
                options={mealTimeOptions}
                placeholder="Any meal time"
              />

              <GlassSelect
                value={selectedPrice}
                onValueChange={setSelectedPrice}
                options={priceOptions}
                placeholder="All prices"
              />

              <GlassSelect
                value={sortBy}
                onValueChange={(value) => setSortBy(value as SortOption)}
                options={sortOptions}
                placeholder="Sort by"
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/72 px-3 py-1.5 text-xs text-[#023030]/72 shadow-[0_6px_18px_rgba(2,48,48,0.05)] ring-1 ring-[#023030]/5 backdrop-blur-md">
                <ArrowUpDown className="h-3.5 w-3.5 text-[#026d6d]" />
                Sorted by:
                <span className="font-medium text-[#023030]">
                  {sortBy === "name-asc" && "Name A–Z"}
                  {sortBy === "name-desc" && "Name Z–A"}
                  {sortBy === "price-low-high" && "Lowest price"}
                  {sortBy === "price-high-low" && "Highest price"}
                  {sortBy === "establishment-asc" && "Establishment A–Z"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="rounded-[26px] border border-white/45 bg-white/58 p-1.5 shadow-[0_10px_28px_rgba(2,48,48,0.06)] backdrop-blur-xl mt-4">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition ${
                      viewMode === "grid"
                        ? "bg-[linear-gradient(135deg,#023030_0%,#046d6d_100%)] text-white shadow-[0_10px_20px_rgba(2,48,48,0.18)]"
                        : "text-[#026d6d] hover:bg-white/65"
                    }`}
                  >
                    <Grid2X2 className="h-4 w-4" />
                    Grid
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode("compact")}
                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition ${
                      viewMode === "compact"
                        ? "bg-[linear-gradient(135deg,#023030_0%,#046d6d_100%)] text-white shadow-[0_10px_20px_rgba(2,48,48,0.18)]"
                        : "text-[#026d6d] hover:bg-white/65"
                    }`}
                  >
                    <Rows3 className="h-4 w-4" />
                    Compact
                  </button>
                </div>
              </div>

        {loading ? (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mt-6 overflow-hidden rounded-[32px] border border-white/50 bg-white/46 p-8 shadow-[0_14px_38px_rgba(2,48,48,0.06)] backdrop-blur-2xl"
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.45),rgba(255,255,255,0.08))]" />
            <div className="relative flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/45 bg-white/70 backdrop-blur-md">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.4,
                    ease: "linear",
                  }}
                >
                  <Sparkles className="h-5 w-5 text-[#026d6d]" />
                </motion.div>
              </div>
              <div>
                <p className="font-poppins text-lg font-semibold text-[#023030]">
                  Loading meals...
                </p>
                <p className="mt-1 text-sm text-[#023030]/60">
                  Gathering meal options around campus for you.
                </p>
              </div>
            </div>
          </motion.div>
        ) : filteredMeals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mt-6 overflow-hidden rounded-[32px] border border-white/50 bg-white/46 p-10 text-center shadow-[0_14px_38px_rgba(2,48,48,0.06)] backdrop-blur-2xl"
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.45),rgba(255,255,255,0.08))]" />
            <div className="relative">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] border border-white/45 bg-white/72 shadow-[0_10px_24px_rgba(2,48,48,0.06)] backdrop-blur-md">
                <Search className="h-6 w-6 text-[#026d6d]" />
              </div>

              <p className="mt-5 font-poppins text-xl font-semibold text-[#023030]">
                No meals found
              </p>
              <p className="mt-2 text-sm text-[#023030]/62">
                Try changing your search term, category, meal type, price, or
                sorting.
              </p>

              <Button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-2xl bg-[linear-gradient(135deg,#023030_0%,#046d6d_100%)] px-5 text-white shadow-[0_12px_24px_rgba(2,48,48,0.18)] hover:bg-[linear-gradient(135deg,#034646_0%,#057676_100%)]"
              >
                Reset filters
              </Button>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.24 }}
              className={
                viewMode === "grid"
                  ? "mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3"
                  : "mt-6 grid gap-4"
              }
            >
              {filteredMeals.map((meal, index) => (
                <motion.div
                  key={meal._id}
                  initial={{ opacity: 0, y: 22, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: index * 0.025,
                    duration: 0.34,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <MealCard
                    meal={meal}
                    onAddMeal={handleAddMeal}
                    compact={viewMode === "compact"}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}