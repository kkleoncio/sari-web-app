"use client";

import * as React from "react";
import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Wallet,
  UtensilsCrossed,
  Sparkles,
  ChevronRight,
  RotateCcw,
  Users,
  Trash2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

import type {
  AllowanceType,
  Meal,
  MealOption,
  NavKey,
  EstablishmentCard,
  HistoryItem,
  MealType,
  PreferenceMode,
} from "./types";

import { ExactSidebar } from "@/components/home/sidebar/exact-sidebar";
import { EstablishmentsSection } from "@/components/home/sections/establishments-section";
import { MealsSection } from "@/components/home/sections/meals-section";
import { BudgetModal } from "@/components/home/modals/budget-modal";
import { GenerationErrorModal } from "@/components/home/modals/generation-error-modal";
import { ConcludeDayModal } from "@/components/home/modals/conclude-day-modal";
import { ReplaceManualPlanModal } from "@/components/home/modals/replace-manual-plan-modal";
import { ReplaceGeneratedPlanModal } from "@/components/home/modals/replace-generated-plan-modal";

export default function HomePage() {  
  
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const userId = localStorage.getItem("userId");

    if (!isLoggedIn || !userId) {
      router.replace("/auth/login");
      return;
    }

    setAuthChecked(true);
  }, [router]);

  const [authChecked, setAuthChecked] = React.useState(false);
  const [allowanceType, setAllowanceType] = React.useState<AllowanceType>("daily");
  const [budget, setBudget] = React.useState<string>("");
  const [mealsPerDay, setMealsPerDay] = React.useState<number>(3);
  const [firstName, setFirstName] = React.useState("");
  const [options, setOptions] = React.useState<MealOption[]>([]);
  const [chosenIndex, setChosenIndex] = React.useState<number | null>(null);
  const [mealPlan, setMealPlan] = React.useState<Meal[]>([]);
  const [totalCost, setTotalCost] = React.useState(0);
  const [remaining, setRemaining] = React.useState(0);
  const [openBudgetModal, setOpenBudgetModal] = React.useState(false);
  const [openConcludeDayModal, setOpenConcludeDayModal] = React.useState(false);
  const [openGenerationErrorModal, setOpenGenerationErrorModal] = React.useState(false);
  const [openReplaceGeneratedPlanModal, setOpenReplaceGeneratedPlanModal] = React.useState(false);
  const [pendingManualMeal, setPendingManualMeal] = React.useState<Meal | null>(null);
  const [generationErrorMessage, setGenerationErrorMessage] = React.useState("");
  const [openReplaceManualPlanModal, setOpenReplaceManualPlanModal] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [savingIndex, setSavingIndex] = React.useState<number | null>(null);
  const [planSource, setPlanSource] = React.useState<"generated" | "manual" | null>(null);
  // const [selectedEstablishmentId, setSelectedEstablishmentId] = React.useState<string | null>(null);
  // const [selectedEstablishmentName, setSelectedEstablishmentName] = React.useState<string | null>(null);

  const [activeNav, setActiveNav] = React.useState<NavKey>("dashboard");

  const [meals, setMeals] = React.useState<Meal[]>([]);
  const [establishments, setEstablishments] = React.useState<
    EstablishmentCard[]
  >([]);
  const [historyItems, setHistoryItems] = React.useState<HistoryItem[]>([]);

  const [dataLoading, setDataLoading] = React.useState(true);

  const [showAllOptions, setShowAllOptions] = React.useState(false);
  const [showAllMeals, setShowAllMeals] = React.useState(false);
  const [showAllEstablishments, setShowAllEstablishments] =
    React.useState(false);

  const [showFloatingBudgetTracker, setShowFloatingBudgetTracker] =
    React.useState(false);

  const refDashboard = React.useRef<HTMLElement | null>(null);
  const refEstablishments = React.useRef<HTMLElement | null>(null);
  const refMenu = React.useRef<HTMLElement | null>(null);
  const refOptions = React.useRef<HTMLElement | null>(null);
  const refBudgetCard = React.useRef<HTMLElement | null>(null);
  const refHistory = React.useRef<HTMLDivElement | null>(null);
const refCommunity = React.useRef<HTMLDivElement | null>(null);

  const isAutoScrollingRef = React.useRef(false);
  const autoScrollTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const mainRef = React.useRef<HTMLElement | null>(null);

  const numericBudget = Number(budget || 0);

  const [preferenceMode, setPreferenceMode] =
  React.useState<PreferenceMode>("balanced");

const [mealType, setMealType] =
  React.useState<MealType>("full-meals");

  function formatPeso(n: number) {
    return `PHP ${n}`;
  }

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
    container.addEventListener("scroll", checkBudgetVisibility, {
      passive: true,
    });
    window.addEventListener("resize", checkBudgetVisibility);

    return () => {
      container.removeEventListener("scroll", checkBudgetVisibility);
      window.removeEventListener("resize", checkBudgetVisibility);
    };
  }, []);

  React.useEffect(() => {
    localStorage.setItem("currentBudget", String(numericBudget || 0));
  }, [numericBudget]);

  const scrollToRef = (ref: React.RefObject<HTMLElement | null>) => {
    if (!ref.current || !mainRef.current) return;

    const container = mainRef.current;
    const target = ref.current;

    isAutoScrollingRef.current = true;

    if (autoScrollTimeoutRef.current) {
      clearTimeout(autoScrollTimeoutRef.current);
    }

    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    const top = targetRect.top - containerRect.top + container.scrollTop - 24;

    container.scrollTo({
      top,
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

      const containerRect = container.getBoundingClientRect();

      let bestKey: NavKey = "dashboard";
      let bestVisibleHeight = 0;

      for (const section of sectionMap) {
        const el = section.ref.current;
        if (!el) continue;

        const rect = el.getBoundingClientRect();

        const visibleTop = Math.max(rect.top, containerRect.top);
        const visibleBottom = Math.min(rect.bottom, containerRect.bottom);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);

        if (visibleHeight > bestVisibleHeight) {
          bestVisibleHeight = visibleHeight;
          bestKey = section.key;
        }
      }

      setActiveNav((prev) => (prev === bestKey ? prev : bestKey));
    };

    handleScroll();
    container.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);

      if (autoScrollTimeoutRef.current) {
        clearTimeout(autoScrollTimeoutRef.current);
      }
    };
  }, [sectionMap]);

  React.useEffect(() => {
    if (!authChecked) return;

    async function loadInitialData() {
      try {
        setDataLoading(true);

        const userId = localStorage.getItem("userId");

        const [userRes, mealsRes, estRes, latestPlanRes, historyRes] = await Promise.all([
          userId
            ? fetch(`/api/users/${encodeURIComponent(userId)}`)
            : Promise.resolve(null),
          fetch("/api/meals"),
          fetch("/api/establishments"),
          userId
            ? fetch(`/api/mealplans/latest?userId=${encodeURIComponent(userId)}`)
            : Promise.resolve(null),
          userId
            ? fetch(`/api/mealplans/history?userId=${encodeURIComponent(userId)}`)
            : Promise.resolve(null),
        ]);

        if (userRes) {
          const userData = await userRes.json();

          if (userData.ok && userData.user?.firstName) {
            setFirstName(userData.user.firstName);
          }
        }

        const mealsData = await mealsRes.json();
        const estData = await estRes.json();

        if (mealsData.ok) {
          setMeals(mealsData.meals);
        }

        if (estData.ok) {
          const mappedEstablishments: EstablishmentCard[] =
            estData.establishments.map((est: {
              _id: string;
              name: string;
              location: string;
              priceRange: string;
              openingHours: string;
              tags: string[];
            }) => ({
              id: est._id,
              name: est.name,
              address: est.location,
              hours: est.openingHours,
              tags: est.tags ?? [],
              imageUrl: "/default-img.jpg",
              distanceM: 150,
              rating: 4.5,
              priceMin:
                est.priceRange === "budget"
                  ? 50
                  : est.priceRange === "mid"
                  ? 80
                  : 120,
              priceMax:
                est.priceRange === "budget"
                  ? 120
                  : est.priceRange === "mid"
                  ? 180
                  : 250,
            }));

          setEstablishments(mappedEstablishments);
        }

        if (latestPlanRes) {
          const latestPlanData = await latestPlanRes.json();

          if (latestPlanData.ok && latestPlanData.mealPlan) {
            const savedPlan = latestPlanData.mealPlan;

            setMealPlan(savedPlan.meals ?? []);
            setTotalCost(savedPlan.totalCost ?? 0);
            setRemaining(savedPlan.remainingBudget ?? 0);
            setPlanSource("generated");
            localStorage.setItem("currentPlanSource", "generated");

            if (savedPlan.budget) setBudget(String(savedPlan.budget));
            if (savedPlan.allowanceType) setAllowanceType(savedPlan.allowanceType);
            if (savedPlan.mealsPerDay) setMealsPerDay(savedPlan.mealsPerDay);
          }
        }

        if (historyRes) {
          const historyData = await historyRes.json();

          if (historyData.ok && Array.isArray(historyData.history)) {
            const mappedHistory: HistoryItem[] = historyData.history.map(
              (item: any) => ({
                id: String(item._id),
                title: item.label || "Saved Meal Plan",
                date: new Date(item.createdAt).toLocaleString(),
                allowanceType: item.allowanceType,
                budget: item.budget,
                total: item.totalCost,
                remaining: item.remainingBudget,
                meals: (item.meals ?? []).map((meal: any) => meal.mealName),
                mood: item.label || "Saved",
              })
            );

            setHistoryItems(mappedHistory);
          }
        }

        const manualMealPlanRaw = localStorage.getItem("manualMealPlan");
          if (manualMealPlanRaw) {
            const manualMeals = JSON.parse(manualMealPlanRaw);

            if (Array.isArray(manualMeals) && manualMeals.length > 0) {
              const manualTotal = manualMeals.reduce(
                (sum: number, meal: any) => sum + Number(meal.price || 0),
                0
              );

              const currentBudget = Number(localStorage.getItem("currentBudget") || 0);

              setMealPlan(manualMeals);
              setTotalCost(manualTotal);
              setRemaining(Math.max(0, currentBudget - manualTotal));
              setPlanSource("manual");
              localStorage.setItem("currentPlanSource", "manual");
            }
          }

      } catch (error) {
        console.error("Failed to load initial data:", error);
        toast.error("Failed to load app data");
      } finally {
        setDataLoading(false);
      }
    }

    loadInitialData();

    
  }, [authChecked]);

  const resetAll = () => {
    setOptions([]);
    setChosenIndex(null);
    setMealPlan([]);
    setTotalCost(0);
    setRemaining(0);
    setPlanSource(null);
    localStorage.removeItem("currentPlanSource");
  };

  const runGenerateMealPlans = async () => {
    setLoading(true);
    setSaving(false);
    setChosenIndex(null);
    setMealPlan([]);
    setTotalCost(0);
    setRemaining(0);

    const toastId = toast.loading("Generating meal plans...");

    try { 
      const userId = localStorage.getItem("userId");
      if (!userId) {
        toast.error("Please login first", { id: toastId });
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
          preferenceMode,
          mealType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.dismiss(toastId);
        setGenerationErrorMessage(
          `We couldn’t find a meal plan within PHP ${numericBudget} yet. Try adjusting your budget or meals per day.`
        );
        setOpenGenerationErrorModal(true);
        return;
      }

      const opts: MealOption[] = data.options || [];
      setOptions(opts);
      setShowAllOptions(false);

      setMealPlan([]);
      setTotalCost(0);
      setRemaining(numericBudget);
      setPlanSource(null);
      localStorage.removeItem("currentPlanSource");

      toast.success("Meal plans ready", {
        id: toastId,
        description: `${opts.length} option${opts.length > 1 ? "s" : ""} generated for you.`,
         icon: <CheckCircle2 className="text-[#046d6d]" />,
      });

      scrollToRef(refOptions);
    } catch (err) {
      console.error(err);
      toast.error("Generation failed", {
        id: toastId,
        description: "Something went wrong. Please try again.",
         icon: <AlertCircle className="text-red-500" />,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!numericBudget || numericBudget <= 0) {
      toast.error("Enter a valid budget", {
        description: "Please set your budget first before generating a plan.",
      });
      return;
    }

    const manualMealPlanRaw = localStorage.getItem("manualMealPlan");
    const manualMeals = manualMealPlanRaw ? JSON.parse(manualMealPlanRaw) : [];

    if (Array.isArray(manualMeals) && manualMeals.length > 0) {
      setOpenReplaceManualPlanModal(true);
      return;
    }

    await runGenerateMealPlans();
  };

  

  const handleConfirmReplaceManualPlan = async () => {
    localStorage.removeItem("manualMealPlan");
    setOpenReplaceManualPlanModal(false);
    await runGenerateMealPlans();
  };

  const addManualMealToPlan = (meal: Meal) => {
    const manualMealPlanRaw = localStorage.getItem("manualMealPlan");
    const existingManualMeals = manualMealPlanRaw
      ? JSON.parse(manualMealPlanRaw)
      : [];

    const updatedMeals = [...existingManualMeals, meal];
    localStorage.setItem("manualMealPlan", JSON.stringify(updatedMeals));

    const updatedTotal = updatedMeals.reduce(
      (sum: number, item: Meal) => sum + Number(item.price || 0),
      0
    );

    setMealPlan(updatedMeals);
    setTotalCost(updatedTotal);
    setRemaining(Math.max(0, numericBudget - updatedTotal));
    setChosenIndex(null);
    setOptions([]);
    setPlanSource("manual");
    localStorage.setItem("currentPlanSource", "manual");

    toast.success("Meal added manually", {
      icon: <CheckCircle2 className="text-[#046d6d]" />,
    });

  };

  const handleManualAdd = (meal: Meal) => {
    if (planSource === "generated" && mealPlan.length > 0) {
      setPendingManualMeal(meal);
      setOpenReplaceGeneratedPlanModal(true);
      return;
    }

    addManualMealToPlan(meal);
  };

  const handleConfirmReplaceGeneratedPlan = () => {
  if (!pendingManualMeal) return;

  const mealToAdd = pendingManualMeal;

  setPendingManualMeal(null);
  setOpenReplaceGeneratedPlanModal(false);

  localStorage.removeItem("manualMealPlan");
  localStorage.removeItem("currentPlanSource");

  setChosenIndex(null);
  setOptions([]);
  setMealPlan([]);
  setTotalCost(0);
  setRemaining(numericBudget);
  setPlanSource(null);

  addManualMealToPlan(mealToAdd);
};

  const handleOpenChangeReplaceGeneratedPlan = (open: boolean) => {
    setOpenReplaceGeneratedPlanModal(open);

    if (!open) {
      setPendingManualMeal(null);
    }
  };

  const refreshUserMealPlanData = React.useCallback(async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    try {
      const [latestPlanRes, historyRes] = await Promise.all([
        fetch(`/api/mealplans/latest?userId=${encodeURIComponent(userId)}`),
        fetch(`/api/mealplans/history?userId=${encodeURIComponent(userId)}`),
      ]);

      const latestPlanData = await latestPlanRes.json();
      const historyData = await historyRes.json();

      if (latestPlanData.ok && latestPlanData.mealPlan) {
        const savedPlan = latestPlanData.mealPlan;
        const savedMeals = savedPlan.meals ?? [];

        setMealPlan(savedMeals);
        setTotalCost(savedPlan.totalCost ?? 0);
        setRemaining(savedPlan.remainingBudget ?? 0);

        if (savedMeals.length > 0) {
          setPlanSource("generated");
          localStorage.setItem("currentPlanSource", "generated");
        } else {
          setPlanSource(null);
          localStorage.removeItem("currentPlanSource");
        }

        if (savedPlan.budget) setBudget(String(savedPlan.budget));
        if (savedPlan.allowanceType) setAllowanceType(savedPlan.allowanceType);
        if (savedPlan.mealsPerDay) setMealsPerDay(savedPlan.mealsPerDay);
      }

      if (historyData.ok && Array.isArray(historyData.history)) {
        const mappedHistory: HistoryItem[] = historyData.history.map((item: any) => ({
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

        setHistoryItems(mappedHistory);
      }
    } catch (error) {
      console.error("Failed to refresh meal plan data:", error);
    }
  }, []);

  const handleChoose = async (index: number) => {
    const option = options[index];
    if (!option) return;

    setSaving(true);
    setSavingIndex(index);

    const toastId = toast.loading("Saving meal plan...");

    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        toast.error("Please login first", { id: toastId });
        return;
      }

      setChosenIndex(index);
      setMealPlan(option.meals);
      setTotalCost(option.totalCost);
      setRemaining(option.remainingBudget);
      setPlanSource("generated");
      localStorage.setItem("currentPlanSource", "generated");

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
        toast.error(data.message || "Failed to save selected plan", {
          id: toastId,
        });
        return;
      }

      toast.success("Meal plan saved!", {
        id: toastId,
        description: "Your plan is now in history.",
        icon: <CheckCircle2 className="text-[#046d6d]" />,
      });

      await refreshUserMealPlanData();
    } catch (err) {
      console.error(err);
      toast.error("Save failed", {
        id: toastId,
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setSaving(false);
      setSavingIndex(null);
    }
  };

  const handleRemoveMeal = async (index: number) => {
  const updatedMeals = mealPlan.filter((_, i) => i !== index);

  const updatedTotal = updatedMeals.reduce(
    (sum, meal) => sum + Number(meal.price || 0),
    0
  );

  const updatedRemaining = Math.max(0, numericBudget - updatedTotal);

  if (planSource === "manual") {
    setMealPlan(updatedMeals);
    setTotalCost(updatedTotal);
    setRemaining(updatedRemaining);

    if (updatedMeals.length > 0) {
      localStorage.setItem("manualMealPlan", JSON.stringify(updatedMeals));
      localStorage.setItem("currentPlanSource", "manual");
    } else {
      localStorage.removeItem("manualMealPlan");
      localStorage.removeItem("currentPlanSource");
      setPlanSource(null);
    }

    toast.success("Meal removed", {
      icon: <CheckCircle2 className="text-[#046d6d]" />,
    });
    return;
  }

  if (planSource === "generated") {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      toast.error("Please login first");
      return;
    }

    const previousMeals = mealPlan;
    const previousTotal = totalCost;
    const previousRemaining = remaining;

    setMealPlan(updatedMeals);
    setTotalCost(updatedTotal);
    setRemaining(updatedRemaining);

    if (updatedMeals.length === 0) {
      setPlanSource(null);
    }

    const toastId = toast.loading("Removing meal...");

    try {
      const res = await fetch("/api/mealplans/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          meals: updatedMeals,
          totalCost: updatedTotal,
          remainingBudget: updatedRemaining,
          isCustomized: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update meal plan");
      }

      if (updatedMeals.length > 0) {
        setPlanSource("generated");
        localStorage.setItem("currentPlanSource", "generated");
      } else {
        localStorage.removeItem("currentPlanSource");
      }

      toast.success("Meal removed", { id: toastId, icon: <CheckCircle2 className="text-[#046d6d]" /> });
      await refreshUserMealPlanData();
    } catch (error) {
      console.error(error);

      setMealPlan(previousMeals);
      setTotalCost(previousTotal);
      setRemaining(previousRemaining);
      setPlanSource(previousMeals.length > 0 ? "generated" : null);

      toast.error("Failed to remove meal", {
        id: toastId,
        description: "Please try again.",
      });
    }

    return;
  }

  setMealPlan(updatedMeals);
  setTotalCost(updatedTotal);
  setRemaining(updatedRemaining);

  if (updatedMeals.length === 0) {
    setPlanSource(null);
    localStorage.removeItem("manualMealPlan");
    localStorage.removeItem("currentPlanSource");
  }

  toast.success("Meal removed", {
    icon: <CheckCircle2 className="text-[#046d6d]" />,
  }); 
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

  if (!authChecked || dataLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[#023030]">
        Loading SARI...
      </div>
    );
  }

  const visibleOptions = (showAllOptions ? options : options.slice(0, 3)).map(
    (option, index) => ({
      option,
      originalIndex: index,
    })
  );

  // const filteredMeals = selectedEstablishmentId
  // ? meals.filter((meal) => meal.establishmentName === selectedEstablishmentId)
  // : meals;

  // const visibleMeals = showAllMeals ? filteredMeals : filteredMeals.slice(0, 6);
  const visibleMeals = showAllMeals ? meals : meals.slice(0, 6);
  const visibleEstablishments = showAllEstablishments
    ? establishments
    : establishments.slice(0, 6);
  

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
            if (value === "menu") scrollToRef(refMenu);
            if (value === "establishments") scrollToRef(refEstablishments);
            if (value === "history") scrollToRef(refHistory);
            if (value === "community") scrollToRef(refCommunity);
          }}
        />

        <main
          ref={mainRef}
          className="scrollbar-thumb-rounded-full scrollbar-thin scrollbar-thumb-[#d9e4e4] scrollbar-track-transparent flex-1 overflow-y-auto px-6 py-8 md:px-10 lg:px-14"
        >
          <div className="mx-auto max-w-6xl space-y-8">
            <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_70%_20%,rgba(204,255,232,0.18),transparent_20%),radial-gradient(circle_at_30%_80%,rgba(227,242,253,0.22),transparent_24%)]" />

            <motion.section
              ref={(el) => {
                refDashboard.current = el;
                refBudgetCard.current = el;
              }}
              className="scroll-mt-8"
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="relative overflow-hidden rounded-[32px] border border-white/45 bg-[linear-gradient(135deg,rgba(255,255,255,0.58),rgba(227,242,253,0.34)_38%,rgba(204,255,232,0.28)_100%)] p-6 shadow-[0_14px_40px_rgba(2,48,48,0.10)] backdrop-blur-xl md:p-7">
                  <div className="pointer-events-none absolute -right-10 top-0 h-32 w-32 rounded-full bg-[#ccffe8]/35 blur-3xl" />
                  <div className="pointer-events-none absolute bottom-0 left-0 h-28 w-28 rounded-full bg-[#E3F2FD]/60 blur-3xl" />

                  <div className="relative z-10 ">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-[#FBE1AD] px-3 py-1.5 text-xs font-medium text-[#025a5a] backdrop-blur-md]">
                      <Sparkles className="h-3.5 w-3.5" />
                      Student-friendly meal planning
                    </div>

                    <h1 className="font-poppins mt-4 text-[28px] font-semibold tracking-tight text-[#025a5a] md:text-[34px]">
                      {firstName ? `Good day, ${firstName} 👋` : "Welcome back 👋"}
                    </h1>

                    <p className="font-helvetica mt-2 max-w-xl text-sm font-light leading-6 text-[#023030]/72 md:text-[15px]">
                      Here’s a quick look at your budget and current plan.
                      Generate more options anytime and choose the one that
                      works best for you.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <div className="rounded-full border border-white/40 bg-white/45 px-3 py-1.5 text-xs text-[#023030]/80 backdrop-blur-md">
                        {allowanceType === "daily"
                          ? "Daily budget"
                          : "Weekly budget"}
                      </div>
                      <div className="rounded-full border border-white/40 bg-white/45 px-3 py-1.5 text-xs text-[#023030]/80 backdrop-blur-md">
                        {mealsPerDay} meals/day
                      </div>
                      <div className="rounded-full border border-white/40 bg-white/45 px-3 py-1.5 text-xs text-[#023030]/80 backdrop-blur-md">
                        UPLB area
                      </div>
                    {/* NEW — Preference Style */}
                      <div className="rounded-full border border-white/40 bg-white/45 px-3 py-1.5 text-xs text-[#023030]/80 backdrop-blur-md">
                        {preferenceMode === "cheapest"
                          ? "Cheapest picks"
                          : preferenceMode === "balanced"
                          ? "Balanced picks"
                          : "More variety"}
                      </div>

                      {/* NEW — Meal Type */}
                      <div className="rounded-full border border-white/40 bg-white/45 px-3 py-1.5 text-xs text-[#023030]/80 backdrop-blur-md">
                        {mealType === "full-meals"
                          ? "Full meals"
                          : mealType === "snacks"
                          ? "Snacks"
                          : "Mixed meal types"}
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <Button
                        onClick={handleGenerate}
                        disabled={loading || saving || !numericBudget}
                        className="font-poppins rounded-xl bg-[linear-gradient(135deg,#022b2b_0%,#033f3f_45%,#046d6d_90%,#0a8f8f_100%)] px-5 text-white shadow-[0_12px_24px_rgba(2,48,48,0.18)] hover:opacity-95"
                      >
                        <UtensilsCrossed className="mr-2 h-4 w-4" />
                        {loading ? "Generating..." : "Generate meal plans"}
                      </Button>

                      <Button
                        variant="outline"
                        className="font-poppins rounded-xl border-white/45 bg-white/50 text-[#023030] backdrop-blur-md hover:bg-white/70"
                        onClick={() => setOpenBudgetModal(true)}
                      >
                        <Wallet className="mr-2 h-4 w-4" />
                        Adjust budget
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-3">
                    <div className="rounded-[24px] border border-white/40 bg-[linear-gradient(135deg,#022b2b_0%,#033f3f_45%,#046d6d_90%,#0a8f8f_100%)] p-6 shadow-[0_14px_40px_rgba(2,48,48,0.10)] p-4 backdrop-blur-xl shadow-[0_10px_24px_rgba(2,48,48,0.08)]">
                      <div className="mb-3 inline-flex rounded-xl bg-[#E3F2FD] p-2 text-[#023030]">
                        <Wallet className="h-4 w-4" />
                      </div>
                      <p className="font-helvetica text-xs font-light text-[#023030]/60 text-white">
                        Budget
                      </p>
                      <p className="mt-1 text-2xl font-semibold font-poppins text-[#023030] text-white">
                        {formatPeso(budgetAmount)}
                      </p>
                    </div>

                    <div className="rounded-[24px] border border-white/40 bg-[linear-gradient(135deg,#022b2b_0%,#033f3f_45%,#046d6d_90%,#0a8f8f_100%)] p-6 backdrop-blur-xl shadow-[0_10px_24px_rgba(2,48,48,0.08)]">
                      <div className="mb-3 inline-flex rounded-xl bg-[#E3F2FD] p-2 text-[#023030]">
                        <UtensilsCrossed className="h-4 w-4" />
                      </div>
                      <p className="font-helvetica text-xs font-light text-[#023030]/60 text-white">
                        Used
                      </p>
                      <p className="font-poppins mt-1 text-2xl font-semibold text-[#023030] text-white">
                        {formatPeso(usedAmount)}
                      </p>
                    </div>

                    <div className="rounded-[24px] border border-white/40 bg-[linear-gradient(135deg,#022b2b_0%,#033f3f_45%,#046d6d_90%,#0a8f8f_100%)] p-6 backdrop-blur-xl shadow-[0_10px_24px_rgba(2,48,48,0.08)]">
                      <div className="mb-3 inline-flex rounded-xl bg-[#E3F2FD] p-2 text-[#023030]">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <p className="font-helvetica text-xs font-light text-[#023030]/60 text-white">
                        Remaining
                      </p>
                      <p className="font-poppins mt-1 text-2xl font-semibold text-[#026d6d] text-white">
                        {formatPeso(remainingAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-white/40 bg-white/52 p-5 backdrop-blur-xl shadow-[0_10px_24px_rgba(2,48,48,0.08)]">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="font-poppins text-base font-semibold text-[#023030]">
                          Current meal plan
                        </p>
                        <p className="font-helvetica text-xs font-light text-[#023030]/60">
                          Your selected or latest generated plan
                        </p>
                      </div>

                      <div className="rounded-full bg-[#E3F2FD] px-3 py-1 text-xs font-medium text-[#023030]">
                        {mealPlan.length === 0
                          ? "No plan yet"
                          : planSource === "manual"
                          ? "Manual plan"
                          : "Chosen plan"}
                      </div>
                    </div>

                    {mealPlan.length > 0 ? (
                      <div className="space-y-2.5">
                        {mealPlan.slice(0, 3).map((meal, index) => (
                          <div
                            key={`${meal.mealName}-${index}`}
                            className="flex items-center justify-between rounded-2xl border border-white/35 bg-white/55 px-3 py-3 backdrop-blur-md"
                          >
                            <div className="min-w-0">
                              <p className="font-poppins truncate text-sm font-medium text-[#023030]">
                                {meal.mealName}
                              </p>
                              <p className="font-helvetica truncate text-xs text-[#023030]/55">
                                {meal.establishmentName}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-[#E3F2FD] px-2.5 py-1 text-xs font-semibold text-[#023030]">
                                {formatPeso(meal.price)}
                              </span>

                              <button
                                onClick={() => handleRemoveMeal(index)}
                                className="rounded-lg p-1.5 text-[#023030]/60 hover:bg-[#ffecec] hover:text-red-500 transition"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}

                        <div className="mt-3 flex items-center justify-between rounded-2xl bg-[linear-gradient(135deg,rgba(255,255,255,0.55),rgba(227,242,253,0.32),rgba(204,255,232,0.20))] px-4 py-3">
                          <div>
                            <p className="font-helvetica text-[11px] text-[#023030]/55">
                              Plan total
                            </p>
                            <p className="font-poppins text-sm font-semibold text-[#023030]">
                              {formatPeso(totalCost)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-helvetica text-[11px] text-[#023030]/55">
                              Budget left
                            </p>
                            <p className="font-poppins text-sm font-semibold text-[#026d6d]">
                              {formatPeso(remainingAmount)}
                            </p>
                          </div>
                        </div>
                        {mealPlan.length > 0 && (
                          <div className="mt-4">
                            <Button
                              onClick={() => setOpenConcludeDayModal(true)}
                              className="font-poppins w-full rounded-xl bg-[#023030] text-white hover:bg-[#034646]"
                            >
                              🌙 Conclude my day
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-[22px] border border-white/35 bg-[linear-gradient(135deg,rgba(255,255,255,0.50),rgba(227,242,253,0.30),rgba(204,255,232,0.18))] p-4 backdrop-blur-lg">
                        <p className="font-poppins text-sm font-medium text-[#023030]">
                          No chosen meal plan yet
                        </p>
                        <p className="font-helvetica mt-1 text-sm font-light leading-6 text-[#023030]/65">
                          Generate meal plans below, then choose one to make it your current plan.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.section>

            <motion.section
              ref={refOptions}
              className="scroll-mt-8"
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              <div className="rounded-[30px] border border-white/40 bg-white/50 p-5 shadow-[0_10px_30px_rgba(2,48,48,0.08)] backdrop-blur-xl md:p-6">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-[#FBE1AD] px-3 py-1.5 text-xs font-medium text-[#025a5a] backdrop-blur-md">
                      <Sparkles className="h-3.5 w-3.5" />
                      Personalized picks
                    </div>

                    <h2 className="font-poppins mt-3 text-xl font-semibold text-[#023030] md:text-2xl">
                      Suggested for you
                    </h2>
                    <p className="font-helvetica mt-1 text-sm font-light text-[#023030]/68">
                      Meal combos that fit your budget and feel easier to choose
                      from
                    </p>
                  </div>

                  <button
                    onClick={() => scrollToRef(refMenu)}
                    className="font-poppins inline-flex items-center gap-1 text-sm font-medium text-[#026d6d] transition hover:text-[#023030]"
                  >
                    Browse all meals
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {options.length > 0 ? (
                  <div className="grid gap-4 xl:grid-cols-3">
                    {visibleOptions.map(({ option, originalIndex }) => {
                      const isSelected = chosenIndex === originalIndex;
                      const highlight =
                        option.label || `Option ${originalIndex + 1}`;
                      const isSavingThis = savingIndex === originalIndex;

                      return (
                        <motion.div
                          key={originalIndex}
                          variants={fadeUp}
                          whileHover={{ y: -4 }}
                          transition={{ duration: 0.18 }}
                          className={`group relative overflow-hidden rounded-[28px] border p-4 shadow-[0_10px_24px_rgba(2,48,48,0.06)] backdrop-blur-xl transition md:p-5 ${
                            isSelected
                              ? "border-[#0a8f8f]/45 bg-[linear-gradient(135deg,rgba(234,255,247,0.88),rgba(255,255,255,0.72))] shadow-[0_16px_34px_rgba(10,143,143,0.14)]"
                              : "border-white/40 bg-[linear-gradient(135deg,rgba(255,255,255,0.68),rgba(227,242,253,0.30),rgba(204,255,232,0.18))]"
                          }`}
                        >
                          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#ccffe8]/30 blur-3xl" />

                          <div className="relative z-10">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="inline-flex rounded-full border border-white/40 bg-white/65 px-2.5 py-1 text-[11px] font-medium text-[#023030] backdrop-blur-md">
                                  Option {originalIndex + 1}
                                </div>
                                <p className="font-poppins mt-3 text-lg font-semibold text-[#023030]">
                                  {highlight}
                                </p>
                                <p className="font-helvetica mt-1 text-sm font-light text-[#023030]/62">
                                  {option.meals.length} meals included
                                </p>
                              </div>

                              <div className="rounded-2xl bg-white/70 p-2.5 text-[#026d6d] backdrop-blur-md">
                                <Sparkles className="h-4 w-4" />
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3">
                              <div className="rounded-2xl border border-white/35 bg-white/50 p-3 backdrop-blur-md">
                                <p className="font-helvetica text-[11px] text-[#023030]/55">
                                  Total
                                </p>
                                <p className="font-poppins mt-1 text-base font-semibold text-[#023030]">
                                  {formatPeso(option.totalCost)}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-white/35 bg-white/50 p-3 backdrop-blur-md">
                                <p className="font-helvetica text-[11px] text-[#023030]/55">
                                  Left
                                </p>
                                <p className="font-poppins mt-1 text-base font-semibold text-[#026d6d]">
                                  {formatPeso(option.remainingBudget)}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 space-y-2.5">
                              {option.meals.slice(0, 3).map((meal, i) => (
                                <div
                                  key={`${meal.mealName}-${i}`}
                                  className="flex items-center justify-between rounded-2xl border border-white/30 bg-white/55 px-3 py-3 backdrop-blur-md"
                                >
                                  <div className="min-w-0">
                                    <p className="font-poppins truncate text-sm font-medium text-[#023030]">
                                      {meal.mealName}
                                    </p>
                                    <p className="font-helvetica truncate text-xs text-[#023030]/55">
                                      {meal.establishmentName}
                                    </p>
                                  </div>

                                  <span className="ml-3 shrink-0 rounded-full bg-[#E3F2FD] px-2.5 py-1 text-xs font-semibold text-[#023030]">
                                    {formatPeso(meal.price)}
                                  </span>
                                </div>
                              ))}
                            </div>

                            <Button
                              onClick={() => handleChoose(originalIndex)}
                              disabled={saving}
                              className={`font-poppins mt-5 w-full rounded-xl ${
                                isSelected
                                  ? "bg-[#026d6d] text-white hover:bg-[#025555]"
                                  : "bg-[#023030] text-white hover:bg-[#034646]"
                              }`}
                            >
                              {isSavingThis
                                ? "Saving..."
                                : isSelected
                                ? "Chosen plan"
                                : "Choose this plan"}
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-[26px] border border-white/35 bg-[linear-gradient(135deg,rgba(255,255,255,0.52),rgba(227,242,253,0.36),rgba(204,255,232,0.24))] p-5 backdrop-blur-xl">
                    <div className="inline-flex rounded-full bg-white/60 px-3 py-1 text-xs text-[#025a5a]">
                      Waiting for your pick
                    </div>

                    <h3 className="font-poppins mt-4 text-xl font-semibold text-[#023030]">
                      No meal plan yet
                    </h3>

                    <p className="font-helvetica mt-2 max-w-md text-sm font-light leading-6 text-[#023030]/68">
                      Generate options to get several meal plans based on your
                      budget, meals per day, and allowance type.
                    </p>
                  </div>
                )}
              </div>

              {options.length > 3 && (
                <div className="mt-5 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowAllOptions((prev) => !prev)}
                    className="font-poppins rounded-xl border-white/45 bg-white/55 text-[#023030] backdrop-blur-md hover:bg-white/75"
                  >
                    {showAllOptions
                      ? "Show less"
                      : `View all ${options.length} options`}
                  </Button>
                </div>
              )}
            </motion.section>

            <EstablishmentsSection
              innerRef={refEstablishments}
              fadeUp={fadeUp}
              stagger={stagger}
              establishments={visibleEstablishments}
              totalCount={establishments.length}
              showAll={showAllEstablishments}
              onToggleShowAll={() => setShowAllEstablishments((prev) => !prev)} 
            />

            <MealsSection
              innerRef={refMenu}
              fadeUp={fadeUp}
              stagger={stagger}
              meals={visibleMeals}
              totalCount={meals.length}
              showAll={showAllMeals}
              onToggleShowAll={() => setShowAllMeals((prev) => !prev)}
              onAddMeal={handleManualAdd}
            />

            <section className="grid gap-4 lg:grid-cols-2">
              <motion.div
                ref={refHistory}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                className="rounded-[28px] border border-white/40 bg-white/55 p-5 shadow-[0_10px_30px_rgba(2,48,48,0.08)] backdrop-blur-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-[#FBE1AD] px-3 py-1.5 text-xs font-medium text-[#025a5a]">
                      <RotateCcw className="h-3.5 w-3.5" />
                      History
                    </div>
                    <h3 className="font-poppins mt-4 text-xl font-semibold text-[#023030]">
                      Saved plans
                    </h3>
                    <p className="font-helvetica mt-1 text-sm font-light text-[#023030]/68">
                      Review your previous picks and reuse your favorites.
                    </p>
                  </div>

                  <div className="rounded-full bg-[#E3F2FD] px-3 py-1 text-xs font-medium text-[#023030]">
                    {historyItems.length} saved
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {historyItems.slice(0, 2).map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-white/35 bg-white/55 px-4 py-3"
                    >
                      <p className="font-poppins text-sm font-semibold text-[#023030]">
                        {item.title}
                      </p>
                      <p className="font-helvetica mt-1 text-xs text-[#023030]/60">
                        {item.date}
                      </p>
                    </div>
                  ))}

                  {historyItems.length === 0 && (
                    <div className="rounded-2xl border border-white/35 bg-white/55 px-4 py-3">
                      <p className="font-poppins text-sm font-medium text-[#023030]">
                        No saved plans yet
                      </p>
                    </div>
                  )}
                </div>

                <Link href="/home/history" className="mt-5 inline-block">
                  <Button className="font-poppins rounded-xl bg-[#023030] text-white hover:bg-[#034646]">
                    View history
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                ref={refCommunity}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                className="rounded-[28px] border border-white/40 bg-white/55 p-5 shadow-[0_10px_30px_rgba(2,48,48,0.08)] backdrop-blur-xl"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-[#FBE1AD] px-3 py-1.5 text-xs font-medium text-[#025a5a]">
                  <Users className="h-3.5 w-3.5" />
                  Community
                </div>

                <h3 className="font-poppins mt-4 text-xl font-semibold text-[#023030]">
                  Student tips and picks
                </h3>
                <p className="font-helvetica mt-1 text-sm font-light text-[#023030]/68">
                  See meal hacks, budget tips, and recommendations from other
                  students.
                </p>

                <div className="mt-5 space-y-3">
                  {[
                    "Budget-friendly lunch ideas near campus",
                    "Most sulit rice meals this week",
                    "Quick snacks under PHP 50",
                  ].map((tip) => (
                    <div
                      key={tip}
                      className="rounded-2xl border border-white/35 bg-white/55 px-4 py-3"
                    >
                      <p className="font-poppins text-sm font-medium text-[#023030]">
                        {tip}
                      </p>
                    </div>
                  ))}
                </div>

                <Link href="/home/community" className="mt-5 inline-block">
                  <Button className="font-poppins rounded-xl bg-[#023030] text-white hover:bg-[#034646]">
                    Open community
                  </Button>
                </Link>
              </motion.div>
            </section>
          </div>

          <BudgetModal
            open={openBudgetModal}
            onOpenChange={setOpenBudgetModal}
            allowanceType={allowanceType}
            setAllowanceType={setAllowanceType}
            budget={budget}
            setBudget={setBudget}
            mealsPerDay={mealsPerDay}
            setMealsPerDay={setMealsPerDay}
            preferenceMode={preferenceMode}
            setPreferenceMode={setPreferenceMode}
            mealType={mealType}
            setMealType={setMealType}
            onSave={resetAll}
          />

          <ConcludeDayModal
            open={openConcludeDayModal}
            onOpenChange={setOpenConcludeDayModal}
            budget={budgetAmount}
            totalCost={totalCost}
            remaining={remainingAmount}
            meals={mealPlan}
            
            planLabel={
              chosenIndex !== null
                ? options[chosenIndex]?.label || `Option ${chosenIndex + 1}`
                : "Selected plan"
            }
            onDone={async () => {
              try {
                const userId = localStorage.getItem("userId");

                if (userId) {
                  const res = await fetch("/api/mealplans/conclude", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId }),
                  });

                  const data = await res.json();

                  if (!res.ok) {
                    toast.error(data.message || "Failed to conclude day");
                    return;
                  }
                }

                localStorage.removeItem("manualMealPlan");

                setBudget("0");
                setOptions([]);
                setChosenIndex(null);
                setMealPlan([]);
                setTotalCost(0);
                setRemaining(0);
                setPlanSource(null);

                toast.success("Day concluded", {
                  description: "Your current plan has been cleared.",
                  icon: <CheckCircle2 className="text-[#046d6d]" />, 
                });
              } catch (error) {
                console.error(error);
                toast.error("Failed to conclude day");
              }
            }}
          />

          <GenerationErrorModal
            open={openGenerationErrorModal}
            onOpenChange={setOpenGenerationErrorModal}
            message={generationErrorMessage}
            onAdjustBudget={() => setOpenBudgetModal(true)}
          />

          <ReplaceManualPlanModal
            open={openReplaceManualPlanModal}
            onOpenChange={setOpenReplaceManualPlanModal}
            onConfirm={handleConfirmReplaceManualPlan}
            loading={loading}
          />

          <ReplaceGeneratedPlanModal
            open={openReplaceGeneratedPlanModal}
            onOpenChange={handleOpenChangeReplaceGeneratedPlan}
            onConfirm={handleConfirmReplaceGeneratedPlan}
            loading={loading}
          />

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
                    onClick={handleGenerate}
                    disabled={loading || saving || !numericBudget}
                  >
                    <UtensilsCrossed className="mr-1.5 h-3.5 w-3.5" />
                    Find meals
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