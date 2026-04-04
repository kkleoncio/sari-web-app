"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Clock3,
  Plus,
  CheckCircle2,
  Store,
  Sparkles,
  UtensilsCrossed,
  Flame,
  Soup,
  Leaf,
  HeartPulse,
  Search,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ReplaceGeneratedPlanModal } from "@/components/home/modals/replace-generated-plan-modal";
import { useSession } from "next-auth/react";
import { GlassSelect } from "@/components/ui/glass-select";

type Establishment = {
  _id: string;
  name: string;
  location: string;
  openingHours: string;
  tags?: string[];
};

type Meal = {
  _id: string;
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

function formatLabel(value?: string) {
  if (!value) return "";
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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

function getBannerGradient(name: string) {
  const base = name.toLowerCase();

  if (base.includes("coffee") || base.includes("cafe")) {
    return "linear-gradient(135deg, rgba(2,48,48,0.78) 0%, rgba(4,109,109,0.68) 50%, rgba(153,102,51,0.42) 100%)";
  }

  if (base.includes("samgyup") || base.includes("grill")) {
    return "linear-gradient(135deg, rgba(2,48,48,0.82) 0%, rgba(120,53,15,0.58) 45%, rgba(4,109,109,0.62) 100%)";
  }

  return "linear-gradient(135deg, rgba(2,48,48,0.82) 0%, rgba(4,109,109,0.72) 50%, rgba(20,184,166,0.45) 100%)";
}

function getMealAccent(meal: Meal) {
  if (meal.isVegetarian) {
    return {
      iconBg:
        "bg-[linear-gradient(135deg,rgba(16,185,129,0.16),rgba(255,255,255,0.9))] text-emerald-700",
      ring: "ring-emerald-200/70",
    };
  }

  if (meal.isSoup) {
    return {
      iconBg:
        "bg-[linear-gradient(135deg,rgba(56,189,248,0.16),rgba(255,255,255,0.9))] text-sky-700",
      ring: "ring-sky-200/70",
    };
  }

  if (meal.isFried) {
    return {
      iconBg:
        "bg-[linear-gradient(135deg,rgba(251,191,36,0.16),rgba(255,255,255,0.9))] text-amber-700",
      ring: "ring-amber-200/70",
    };
  }

  return {
    iconBg:
      "bg-[linear-gradient(135deg,rgba(20,184,166,0.16),rgba(255,255,255,0.9))] text-teal-700",
    ring: "ring-teal-200/70",
  };
}

function StatPill({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/45 bg-white/72 px-3 py-1.5 text-xs text-[#023030]/78 shadow-[0_6px_18px_rgba(2,48,48,0.05)] backdrop-blur-md ring-1 ring-[#023030]/5">
      {icon}
      {children}
    </span>
  );
}

export default function EstablishmentMenuPage() {
  const params = useParams();
  const id = params.id as string;
  const { status } = useSession();

  const [loading, setLoading] = React.useState(true);
  const [establishment, setEstablishment] =
    React.useState<Establishment | null>(null);
  const [meals, setMeals] = React.useState<Meal[]>([]);
  const [openReplaceGeneratedPlanModal, setOpenReplaceGeneratedPlanModal] =
    React.useState(false);
  const [pendingMeal, setPendingMeal] = React.useState<Meal | null>(null);

  const [search, setSearch] = React.useState("");
  const [sortBy, setSortBy] = React.useState<
    "featured" | "price-low-high" | "price-high-low" | "name-asc" | "name-desc"
  >("featured");

  React.useEffect(() => {
    if (status !== "authenticated" || !id) return;

    async function loadData() {
      try {
        setLoading(true);

        const [estRes, menuRes] = await Promise.all([
          fetch(`/api/establishments/${id}`),
          fetch(`/api/establishments/${id}/menu`),
        ]);

        const estData = await estRes.json();
        const menuData = await menuRes.json();

        if (!estRes.ok) {
          toast.error(estData.message || "Failed to load establishment");
          return;
        }

        if (!menuRes.ok) {
          toast.error(menuData.message || "Failed to load menu");
          return;
        }

        setEstablishment(estData.establishment);
        setMeals(menuData.meals || []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load establishment page");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [status, id]);

  const addMealToManualPlan = (meal: Meal) => {
    const budget = Number(localStorage.getItem("currentBudget") || "0");

    const existingPlan: Meal[] = JSON.parse(
      localStorage.getItem("manualMealPlan") || "[]",
    );

    const currentTotal = existingPlan.reduce(
      (sum, item) => sum + item.price,
      0,
    );
    const newTotal = currentTotal + meal.price;

    if (budget > 0 && newTotal > budget) {
      toast.error("This meal goes over your current budget");
      return;
    }

    const updatedPlan = [...existingPlan, meal];
    localStorage.setItem("manualMealPlan", JSON.stringify(updatedPlan));
    localStorage.setItem("currentPlanSource", "manual");

    toast.success(`${meal.mealName} added to your plan`, {
      icon: <CheckCircle2 className="text-[#046d6d]" />,
    });
  };

  const handleAddToPlan = (meal: Meal) => {
    const currentPlanSource = localStorage.getItem("currentPlanSource");

    if (currentPlanSource === "generated") {
      setPendingMeal(meal);
      setOpenReplaceGeneratedPlanModal(true);
      return;
    }

    addMealToManualPlan(meal);
  };

  const handleConfirmReplaceGeneratedPlan = () => {
    if (!pendingMeal) return;

    const mealToAdd = pendingMeal;

    setPendingMeal(null);
    setOpenReplaceGeneratedPlanModal(false);

    localStorage.removeItem("manualMealPlan");
    localStorage.setItem("currentPlanSource", "manual");

    addMealToManualPlan(mealToAdd);
  };

  const displayedMeals = React.useMemo(() => {
    const searchText = search.trim().toLowerCase();

    const filtered = meals.filter((meal) => {
      if (!searchText) return true;

      return (
        meal.mealName.toLowerCase().includes(searchText) ||
        (meal.category ?? "").toLowerCase().includes(searchText) ||
        (meal.foodType ?? "").toLowerCase().includes(searchText) ||
        (meal.tags ?? []).some((tag) => tag.toLowerCase().includes(searchText))
      );
    });

    const sorted = [...filtered];

    switch (sortBy) {
      case "price-low-high":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-high-low":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        sorted.sort((a, b) => a.mealName.localeCompare(b.mealName));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.mealName.localeCompare(a.mealName));
        break;
      case "featured":
      default:
        break;
    }

    return sorted;
  }, [meals, search, sortBy]);

  if (status === "loading" || loading) {
    return (
      <div
        className="relative flex min-h-screen items-center justify-center overflow-hidden px-6"
        style={{
          background:
            "radial-gradient(circle at 10% 10%, rgba(45,212,191,0.18) 0%, transparent 24%), radial-gradient(circle at 85% 12%, rgba(56,189,248,0.14) 0%, transparent 25%), radial-gradient(circle at 20% 85%, rgba(167,243,208,0.22) 0%, transparent 28%), linear-gradient(180deg, #f7fcfb 0%, #edf8f7 100%)",
        }}
      >
        <div className="w-full max-w-sm rounded-[30px] border border-white/35 bg-white/50 p-8 shadow-[0_20px_60px_rgba(2,48,48,0.10)] backdrop-blur-2xl">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/40 bg-white/60">
              <UtensilsCrossed className="h-8 w-8 text-[#046d6d]" />
            </div>
            <h2 className="font-poppins text-xl font-semibold text-[#023030]">
              Loading menu
            </h2>
            <p className="mt-2 font-helvetica text-sm text-[#023030]/65">
              Checking what this food spot has for you...
            </p>
          </div>

          <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#023030]/8">
            <div className="h-full w-1/3 animate-[loading_1.2s_ease-in-out_infinite] rounded-full bg-[linear-gradient(90deg,#0b6b57_0%,#34d399_50%,#0b6b57_100%)]" />
          </div>
        </div>
      </div>
    );
  }

  if (!establishment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7fbfb] px-6 text-[#023030]">
        <div className="rounded-[28px] border border-white/40 bg-white/70 px-8 py-7 text-center shadow-[0_16px_40px_rgba(2,48,48,0.08)] backdrop-blur-xl">
          <p className="font-poppins text-lg font-semibold">
            Establishment not found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden text-[#023030]"
      style={{
        background: `
          radial-gradient(circle at 8% 12%, rgba(45, 212, 191, 0.18) 0%, transparent 24%),
          radial-gradient(circle at 82% 10%, rgba(20, 184, 166, 0.16) 0%, transparent 28%),
          radial-gradient(circle at 88% 72%, rgba(6, 182, 212, 0.10) 0%, transparent 26%),
          radial-gradient(circle at 18% 84%, rgba(167, 243, 208, 0.20) 0%, transparent 28%),
          linear-gradient(180deg, #f7fcfb 0%, #edf8f7 52%, #f8fcfb 100%)
        `,
      }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.7),transparent_60%)]" />

      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 lg:px-12 lg:py-10">
        <div className="relative overflow-hidden rounded-[34px] border border-white/50 bg-white/40 shadow-[0_18px_55px_rgba(2,48,48,0.08)] backdrop-blur-2xl">
          <div
            className="relative min-h-[220px] overflow-hidden md:min-h-[230px]"
            style={{
              background: getBannerGradient(establishment.name),
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.14),transparent_30%)]" />
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/15 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-teal-200/10 blur-3xl" />

            <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 lg:px-12 lg:py-10">
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <Link
                    href="/home"
                    className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/24 px-3.5 py-1.5 text-sm font-medium text-white shadow-[0_8px_20px_rgba(2,48,48,0.05)] backdrop-blur-md transition hover:text-[#023030]"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to home
                  </Link>

                  <h1 className="mt-6 font-poppins text-3xl font-semibold tracking-[-0.03em] text-white md:text-5xl">
                    {establishment.name}
                  </h1>
                  <p className="mb-5 mt-2 font-helvetica text-sm text-white/85 md:text-[15px]">
                    Browse available menu items and manually add meals to your
                    SARI plan. Great for quick picks, custom swaps, and
                    budget-friendly choices around Elbi.
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm font-helvetica">
                    <StatPill
                      icon={<MapPin className="h-3.5 w-3.5 text-[#026d6d]" />}
                    >
                      {formatLocation(establishment.location)}
                    </StatPill>

                    <StatPill
                      icon={<Clock3 className="h-3.5 w-3.5 text-[#026d6d]" />}
                    >
                      {establishment.openingHours || "10:00 AM – 8:00 PM"}
                    </StatPill>

                    <StatPill
                      icon={<Store className="h-3.5 w-3.5 text-[#026d6d]" />}
                    >
                      {meals.length} menu items
                    </StatPill>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative overflow-hidden rounded-[26px] border border-white/45 bg-white/25 px-5 py-4 shadow-[0_10px_28px_rgba(2,48,48,0.06)] backdrop-blur-xl">
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.45),rgba(255,255,255,0.08))]" />
                    <div className="relative">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-[#023030]/45">
                        Showing
                      </p>
                      <p className="mt-1 font-poppins text-2xl font-semibold text-[#026d6d]">
                        {displayedMeals.length}
                      </p>
                      <p className="text-sm text-[#023030]/60">meals</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-8">
          <div className="mb-5 flex flex-col gap-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/72 px-3.5 py-1.5 text-xs font-medium text-[#025a5a] shadow-[0_8px_20px_rgba(2,48,48,0.05)] backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5" />
                  Student-budget friendly picks
                </div>

                <h2 className="mt-3 font-poppins text-2xl font-semibold text-[#023030]">
                  Menu
                </h2>
                <p className="mt-1 font-helvetica text-sm text-[#023030]/65">
                  Add meals manually to your current plan.
                </p>
              </div>

              <div className="rounded-full border border-white/40 bg-white/72 px-3.5 py-2 text-sm font-medium text-[#023030]/70 shadow-[0_8px_20px_rgba(2,48,48,0.05)] backdrop-blur-md">
                Showing {displayedMeals.length} of {meals.length}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-[1fr_220px]">
              <div className="relative overflow-hidden rounded-2xl border border-white/45 bg-white/52 shadow-[0_10px_24px_rgba(2,48,48,0.06)] backdrop-blur-xl">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#023030]/45" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search meals, tags, or categories"
                  className="h-12 w-full bg-transparent pl-11 pr-4 text-sm text-[#023030] placeholder:text-[#023030]/42 focus:outline-none"
                />
              </div>

              <div className="relative">
                <div className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2">
                  <ArrowUpDown className="h-4 w-4 text-[#023030]/45" />
                </div>

                <GlassSelect
                  value={sortBy}
                  onValueChange={(value) =>
                    setSortBy(
                      value as
                        | "featured"
                        | "price-low-high"
                        | "price-high-low"
                        | "name-asc"
                        | "name-desc",
                    )
                  }
                  options={[
                    { value: "featured", label: "Sort: Featured" },
                    { value: "price-low-high", label: "Price: Low to High" },
                    { value: "price-high-low", label: "Price: High to Low" },
                    { value: "name-asc", label: "Name: A to Z" },
                    { value: "name-desc", label: "Name: Z to A" },
                  ]}
                  placeholder="Sort meals"
                  className="pl-11"
                />
              </div>
            </div>
          </div>

          {displayedMeals.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {displayedMeals.map((meal) => {
                const accent = getMealAccent(meal);

                return (
                  <div
                    key={meal._id}
                    className="group relative flex h-full overflow-hidden rounded-[30px] border border-white/50 bg-white/48 p-[1px] shadow-[0_16px_44px_rgba(2,48,48,0.08)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(2,48,48,0.12)]"
                  >
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.55),rgba(255,255,255,0.10))]" />

                    <div className="relative flex w-full flex-col overflow-hidden rounded-[29px] bg-white/62 backdrop-blur-2xl">
                      <div className="flex h-full flex-col">
                        <div className="relative h-32 w-full overflow-hidden border-b border-[#023030]/6 bg-[radial-gradient(circle_at_top_left,rgba(163,230,220,0.55),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(227,242,253,0.9),transparent_42%),linear-gradient(135deg,#f8fcfc_0%,#eef8f7_100%)]">
                          <div className="absolute right-[-18px] top-[-18px] h-24 w-24 rounded-full bg-white/30 blur-2xl" />
                          <div className="absolute bottom-[-24px] left-[-12px] h-20 w-20 rounded-full bg-[#ccffe8]/40 blur-2xl" />

                          <div className="flex h-full flex-col items-center justify-center text-center">
                            <p className="font-poppins text-xs font-semibold tracking-[0.2em] text-[#046d6d]/70">
                              IMAGE
                            </p>
                            <p className="mt-1 font-helvetica text-sm text-[#023030]/60">
                              Coming soon
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3.5 p-5">
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${accent.iconBg} ring-1 ${accent.ring} shadow-[0_10px_24px_rgba(2,48,48,0.08)]`}
                          >
                            <UtensilsCrossed className="h-5 w-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h3 className="truncate font-poppins text-lg font-semibold text-[#023030]">
                                  {meal.mealName}
                                </h3>
                                <p className="mt-1 font-helvetica text-sm text-[#023030]/60">
                                  {formatLabel(
                                    meal.category || meal.foodType || "Meal",
                                  )}
                                </p>
                              </div>

                              <div className="rounded-full border border-white/50 bg-white/80 px-3.5 py-1.5 text-sm font-semibold text-[#026d6d] shadow-[0_6px_18px_rgba(2,48,48,0.05)] ring-1 ring-[#026d6d]/8 backdrop-blur-md">
                                ₱{meal.price}
                              </div>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                              {meal.foodType ? (
                                <StatPill>
                                  {formatLabel(meal.foodType)}
                                </StatPill>
                              ) : null}

                              {meal.category ? (
                                <StatPill>
                                  {formatLabel(meal.category)}
                                </StatPill>
                              ) : null}

                              {typeof meal.healthScore === "number" ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 backdrop-blur-md bg-rose-50/90 text-rose-700 ring-rose-100">
                                  <HeartPulse className="h-3.5 w-3.5" />
                                  {meal.healthScore}
                                </span>
                              ) : null}

                              {meal.isFried ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 backdrop-blur-md bg-amber-50/90 text-amber-700 ring-amber-100">
                                  <Flame className="h-3.5 w-3.5" />
                                  Fried
                                </span>
                              ) : null}

                              {meal.isSoup ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 backdrop-blur-md bg-sky-50/90 text-sky-700 ring-sky-100">
                                  <Soup className="h-3.5 w-3.5" />
                                  Soup
                                </span>
                              ) : null}

                              {meal.isVegetarian ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 backdrop-blur-md bg-emerald-50/90 text-emerald-700 ring-emerald-100">
                                  <Leaf className="h-3.5 w-3.5" />
                                  Vegetarian
                                </span>
                              ) : null}

                              {(meal.tags ?? []).slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full border border-white/40 bg-[#edf9f7]/85 px-3 py-1.5 text-xs font-medium text-[#025a5a] ring-1 ring-[#025a5a]/8 backdrop-blur-md"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="mt-auto px-5 pb-5 pt-1">
                          <div className="flex items-end justify-between gap-3 border-t border-[#023030]/8 pt-4">
                            <div className="min-w-0">
                              <p className="text-[11px] uppercase tracking-[0.18em] text-[#023030]/40">
                                Best for
                              </p>
                              <p className="mt-1 text-sm font-medium text-[#023030]">
                                {meal.mealTime?.length
                                  ? meal.mealTime.map(formatLabel).join(" / ")
                                  : "Any time"}
                              </p>
                            </div>

                            <Button
                              onClick={() => handleAddToPlan(meal)}
                              className="shrink-0 rounded-2xl bg-[linear-gradient(135deg,#023030_0%,#046d6d_100%)] px-5 text-white shadow-[0_12px_24px_rgba(2,48,48,0.18)] hover:bg-[linear-gradient(135deg,#034646_0%,#046d6d_100%)]"
                            >
                              <Plus className="mr-1 h-4 w-4" />
                              Add
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[28px] border border-white/45 bg-white/58 p-8 text-center shadow-[0_14px_38px_rgba(2,48,48,0.07)] backdrop-blur-xl">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/35 bg-white/70">
                <UtensilsCrossed className="h-7 w-7 text-[#046d6d]" />
              </div>

              <h3 className="mt-4 font-poppins text-lg font-semibold text-[#023030]">
                {meals.length === 0
                  ? "No menu items available yet"
                  : "No meals matched your search"}
              </h3>
              <p className="mt-2 font-helvetica text-sm text-[#023030]/65">
                {meals.length === 0
                  ? "This establishment does not have uploaded menu items for now."
                  : "Try a different keyword or change the sorting option."}
              </p>
            </div>
          )}
        </section>

        <ReplaceGeneratedPlanModal
          open={openReplaceGeneratedPlanModal}
          onOpenChange={setOpenReplaceGeneratedPlanModal}
          onConfirm={handleConfirmReplaceGeneratedPlan}
          loading={false}
        />
      </div>
    </div>
  );
}
