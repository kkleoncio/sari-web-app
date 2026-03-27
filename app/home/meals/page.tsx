"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
      bg: "from-emerald-100/80 to-white",
      iconBg: "bg-emerald-100 text-emerald-700",
      ring: "ring-emerald-100",
    };
  }

  if (meal.isSoup) {
    return {
      bg: "from-sky-100/80 to-white",
      iconBg: "bg-sky-100 text-sky-700",
      ring: "ring-sky-100",
    };
  }

  if (meal.isFried) {
    return {
      bg: "from-amber-100/80 to-white",
      iconBg: "bg-amber-100 text-amber-700",
      ring: "ring-amber-100",
    };
  }

  return {
    bg: "from-teal-100/80 to-white",
    iconBg: "bg-teal-100 text-teal-700",
    ring: "ring-teal-100",
  };
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
      <div className="group rounded-[24px] border border-white/60 bg-white/65 p-4 shadow-[0_12px_30px_rgba(2,48,48,0.06)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(2,48,48,0.09)]">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${accent.iconBg}`}
          >
            <UtensilsCrossed className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-poppins text-base font-semibold text-[#023030]">
                  {meal.mealName}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[#023030]/62">
                  <span className="inline-flex items-center gap-1">
                    <Store className="h-3.5 w-3.5" />
                    {meal.establishmentName}
                  </span>
                  <span className="text-[#023030]/28">•</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {formatLocation(meal.location)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="rounded-full bg-[#f4fbfb] px-3 py-1 text-sm font-semibold text-[#026d6d] ring-1 ring-[#026d6d]/10">
                  {formatPeso(meal.price)}
                </div>
                <Button
                  type="button"
                  onClick={() => onAddMeal(meal)}
                  className="h-9 rounded-xl bg-[#023030] px-3 text-white hover:bg-[#034646]"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-white px-2.5 py-1 text-xs text-[#023030]/72 ring-1 ring-[#023030]/8">
                {formatLabel(meal.foodType)}
              </span>

              <span className="rounded-full bg-white px-2.5 py-1 text-xs text-[#023030]/72 ring-1 ring-[#023030]/8">
                {formatLabel(meal.category)}
              </span>

              {meal.mealTime?.map((time, index) => (
                <span
                  key={`${meal._id}-${time}-${index}`}
                  className="inline-flex items-center gap-1 rounded-full bg-[#f7fcfb] px-2.5 py-1 text-xs text-[#023030]/75 ring-1 ring-[#023030]/8"
                >
                  <Clock3 className="h-3 w-3" />
                  {formatLabel(time)}
                </span>
              ))}

              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs text-rose-700 ring-1 ring-rose-100">
                <HeartPulse className="h-3 w-3" />
                {meal.healthScore}/10
              </span>

              {meal.isFried && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs text-amber-700 ring-1 ring-amber-100">
                  <Flame className="h-3 w-3" />
                  Fried
                </span>
              )}

              {meal.isSoup && (
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-xs text-sky-700 ring-1 ring-sky-100">
                  <Soup className="h-3 w-3" />
                  Soup
                </span>
              )}

              {meal.isVegetarian && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700 ring-1 ring-emerald-100">
                  <Leaf className="h-3 w-3" />
                  Vegetarian
                </span>
              )}

              {(meal.tags ?? []).slice(0, 3).map((tag, index) => (
                <span
                  key={`${meal._id}-tag-${index}`}
                  className="rounded-full bg-[#eef8f7] px-2.5 py-1 text-xs text-[#025a5a] ring-1 ring-[#025a5a]/8"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
  <div
    className={`group h-full rounded-[28px] border border-white/60 bg-gradient-to-br ${accent.bg} p-[1px] shadow-[0_14px_34px_rgba(2,48,48,0.07)] transition hover:-translate-y-1 hover:shadow-[0_20px_42px_rgba(2,48,48,0.10)]`}
  >
    <div className="flex h-full flex-col rounded-[27px] bg-white/80 p-5 backdrop-blur-2xl">
      <div className="flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${accent.iconBg} ring-1 ${accent.ring}`}
            >
              <UtensilsCrossed className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <h3
                title={meal.mealName}
                className="truncate font-poppins text-lg font-semibold leading-7 text-[#023030]"
              >
                {meal.mealName}
              </h3>

              <div className="mt-1 flex min-w-0 items-center gap-2 text-sm text-[#023030]/62">
                <Store className="h-3.5 w-3.5 shrink-0" />
                <p className="truncate">{meal.establishmentName}</p>
              </div>
            </div>
          </div>

          <div className="shrink-0 rounded-full bg-[#f4fbfb] px-3 py-1.5 text-sm font-semibold text-[#026d6d] ring-1 ring-[#026d6d]/10">
            {formatPeso(meal.price)}
          </div>
        </div>

        <div className="mt-4 min-h-[24px] flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-[#023030]/68">
          <span>{formatLabel(meal.foodType)}</span>
          <span className="text-[#023030]/25">•</span>
          <span>{formatLabel(meal.category)}</span>
          <span className="text-[#023030]/25">•</span>

          <div className="inline-flex items-center gap-1">
            <HoverTooltip content="Health Score is a simple guide based on the meals usually offered here. Higher scores suggest more balanced everyday options." />
            <span className="inline-flex cursor-help items-center gap-1 text-rose-700">
              <HeartPulse className="h-3.5 w-3.5" />
              {meal.healthScore}
            </span>
          </div>
        </div>

        <div className="mt-4 min-h-[64px] flex flex-wrap content-start gap-2">
          {meal.mealTime?.slice(0, 2).map((time, index) => (
            <span
              key={`${meal._id}-${time}-${index}`}
              className="inline-flex items-center gap-1 rounded-full bg-[#f7fcfb] px-3 py-1 text-xs text-[#023030]/75 ring-1 ring-[#023030]/8"
            >
              <Clock3 className="h-3 w-3" />
              {formatLabel(time)}
            </span>
          ))}

          {meal.isFried && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-700 ring-1 ring-amber-100">
              <Flame className="h-3 w-3" />
              Fried
            </span>
          )}

          {meal.isSoup && (
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-xs text-sky-700 ring-1 ring-sky-100">
              <Soup className="h-3 w-3" />
              Soup
            </span>
          )}

          {meal.isVegetarian && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700 ring-1 ring-emerald-100">
              <Leaf className="h-3 w-3" />
              Vegetarian
            </span>
          )}

          {(meal.tags ?? []).slice(0, 2).map((tag, index) => (
            <span
              key={`${meal._id}-tag-${index}`}
              className="rounded-full bg-[#eef8f7] px-3 py-1 text-xs text-[#025a5a] ring-1 ring-[#025a5a]/8"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <Button
        type="button"
        onClick={() => onAddMeal(meal)}
        className="mt-4 w-full rounded-2xl bg-[#023030] text-white hover:bg-[#034646]"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add to meal plan
      </Button>
    </div>
  </div>
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
  const [sortBy, setSortBy] = React.useState<SortOption>("name-asc");
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
          radial-gradient(circle at 12% 18%, rgba(167, 243, 208, 0.42) 0%, transparent 34%),
          radial-gradient(circle at 88% 14%, rgba(186, 230, 253, 0.30) 0%, transparent 32%),
          radial-gradient(circle at 18% 82%, rgba(254, 240, 138, 0.22) 0%, transparent 30%),
          radial-gradient(circle at 82% 78%, rgba(204, 251, 241, 0.26) 0%, transparent 34%),
          linear-gradient(180deg, #f9fdfc 0%, #eef8f7 52%, #f6fbf8 100%)
        `,
      }}
    >
      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 lg:px-12 lg:py-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[32px] border border-white/50 bg-white/50 p-6 shadow-[0_16px_50px_rgba(2,48,48,0.08)] backdrop-blur-2xl md:p-8"
        >
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.45),rgba(255,255,255,0.08))]" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <Link
                href="/home"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#026d6d] transition hover:text-[#023030]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </Link>

              {/* <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/50 bg-[#f8fffd]/75 px-3.5 py-1.5 text-xs font-medium text-[#025a5a] shadow-sm backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" />
                Discover meal options around Elbi
              </div> */}

              <h1 className="font-poppins mt-4 text-3xl font-semibold tracking-[-0.02em] text-[#023030] md:text-4xl">
                Browse all meals
              </h1>

              <p className="font-helvetica mt-3 max-w-xl text-sm leading-6 text-[#023030]/68 md:text-[15px]">
                Explore meals across campus, compare prices, and find options
                that fit your budget, cravings, and daily routine.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative rounded-[24px] border border-white/50 bg-white/60 px-5 py-4 shadow-[0_8px_24px_rgba(2,48,48,0.06)] backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.18em] text-[#023030]/45">
                  Showing
                </p>
                <p className="font-poppins mt-1 text-2xl font-semibold text-[#026d6d]">
                  {filteredMeals.length}
                </p>
                <p className="text-sm text-[#023030]/60">meals</p>
              </div>

              <div className="rounded-[24px] border border-white/50 bg-white/60 p-1.5 shadow-[0_8px_24px_rgba(2,48,48,0.06)] backdrop-blur-xl">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                      viewMode === "grid"
                        ? "bg-[#023030] text-white"
                        : "text-[#026d6d] hover:bg-white/60"
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("compact")}
                    className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                      viewMode === "compact"
                        ? "bg-[#023030] text-white"
                        : "text-[#026d6d] hover:bg-white/60"
                    }`}
                  >
                    Compact
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative mt-6 overflow-hidden rounded-[30px] border border-white/50 bg-white/48 p-4 shadow-[0_14px_40px_rgba(2,48,48,0.08)] backdrop-blur-2xl md:p-5"
        >
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.42),rgba(255,255,255,0.08))]" />

          <div className="relative">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#f6fbfb] px-3 py-1.5 text-sm font-medium text-[#023030]/75 ring-1 ring-[#023030]/6">
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
              <div className="relative h-12 overflow-hidden rounded-2xl border border-white/50 bg-white/55 shadow-[0_8px_24px_rgba(2,48,48,0.06)] backdrop-blur-xl transition hover:bg-white/62 focus-within:border-[#026d6d]/35">
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
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#f4fbfb] px-3 py-1.5 text-xs text-[#023030]/70 ring-1 ring-[#023030]/6">
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

        {loading ? (
          <div className="mt-6 rounded-[30px] border border-white/50 bg-white/50 p-8 shadow-[0_12px_32px_rgba(2,48,48,0.06)] backdrop-blur-2xl">
            <p className="font-poppins text-lg font-semibold text-[#023030]">
              Loading meals...
            </p>
            <p className="mt-2 text-sm text-[#023030]/60">
              Gathering meal options around campus for you.
            </p>
          </div>
        ) : filteredMeals.length === 0 ? (
          <div className="mt-6 rounded-[30px] border border-white/50 bg-white/50 p-10 text-center shadow-[0_12px_32px_rgba(2,48,48,0.06)] backdrop-blur-2xl">
            <p className="font-poppins text-xl font-semibold text-[#023030]">
              No meals found
            </p>
            <p className="mt-2 text-sm text-[#023030]/62">
              Try changing your search term, category, meal type, price, or sorting.
            </p>

            <Button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-2xl bg-[#023030] px-5 text-white hover:bg-[#034646]"
            >
              Reset filters
            </Button>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3"
                : "mt-6 grid gap-4"
            }
          >
            {filteredMeals.map((meal, index) => (
              <motion.div
                key={meal._id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <MealCard
                  meal={meal}
                  onAddMeal={handleAddMeal}
                  compact={viewMode === "compact"}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}