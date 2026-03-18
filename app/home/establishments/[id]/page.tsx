"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Clock3, Plus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ReplaceGeneratedPlanModal } from "@/components/home/modals/replace-generated-plan-modal";

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

export default function EstablishmentMenuPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [authChecked, setAuthChecked] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [establishment, setEstablishment] = React.useState<Establishment | null>(null);
  const [meals, setMeals] = React.useState<Meal[]>([]);
  const [openReplaceGeneratedPlanModal, setOpenReplaceGeneratedPlanModal] =
  React.useState(false);
const [pendingMeal, setPendingMeal] = React.useState<Meal | null>(null);

  React.useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const userId = localStorage.getItem("userId");

    if (!isLoggedIn || !userId) {
      router.replace("/auth/login");
      return;
    }

    setAuthChecked(true);
  }, [router]);

  React.useEffect(() => {
    if (!authChecked || !id) return;

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
  }, [authChecked, id]);

  const addMealToManualPlan = (meal: Meal) => {
  const budget = Number(localStorage.getItem("currentBudget") || "0");

  const existingPlan: Meal[] = JSON.parse(
    localStorage.getItem("manualMealPlan") || "[]"
  );

  const currentTotal = existingPlan.reduce((sum, item) => sum + item.price, 0);
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
  } 
  );
};

  const handleAddToPlan = (meal: Meal) => {
    const manualPlan: Meal[] = JSON.parse(
      localStorage.getItem("manualMealPlan") || "[]"
    );

    const hasManualPlan = manualPlan.length > 0;
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

  if (!authChecked || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[#023030]">
        Loading menu...
      </div>
    );
  }

  if (!establishment) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[#023030]">
        Establishment not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7fbfb_0%,#eef7f7_100%)] px-6 py-8 md:px-10 lg:px-14">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/home"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#026d6d] hover:text-[#023030]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="rounded-[30px] border border-white/40 bg-white/60 p-6 shadow-[0_10px_30px_rgba(2,48,48,0.08)] backdrop-blur-xl">
          <h1 className="font-poppins text-3xl font-semibold text-[#023030]">
            {establishment.name}
          </h1>

          <div className="mt-3 flex flex-wrap gap-4 text-sm text-[#023030]/70">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{establishment.location}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4" />
              <span>{establishment.openingHours}</span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {establishment.tags?.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/35 bg-white/70 px-3 py-1 text-xs text-[#023030]/75"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="font-poppins text-2xl font-semibold text-[#023030]">
            Menu
          </h2>
          <p className="font-helvetica mt-1 text-sm text-[#023030]/65">
            Add meals manually to your current plan.
          </p>

          {meals.length > 0 ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {meals.map((meal) => (
                <div
                  key={meal._id}
                  className="rounded-[24px] border border-white/40 bg-white/60 p-5 shadow-[0_10px_24px_rgba(2,48,48,0.06)] backdrop-blur-xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-poppins text-base font-semibold text-[#023030]">
                        {meal.mealName}
                      </h3>
                      <p className="font-helvetica mt-1 text-sm text-[#023030]/60">
                        {meal.category || meal.foodType || "Meal"}
                      </p>
                    </div>

                    <span className="rounded-full bg-[#E3F2FD] px-3 py-1 text-xs font-semibold text-[#023030]">
                      PHP {meal.price}
                    </span>
                  </div>

                  {meal.tags?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {meal.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/35 bg-white/70 px-2.5 py-1 text-[11px] text-[#023030]/75"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <Button
                    onClick={() => handleAddToPlan(meal)}
                    className="font-poppins mt-5 w-full rounded-xl bg-[#023030] text-white hover:bg-[#034646]"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add to plan
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-[24px] border border-white/40 bg-white/60 p-5 text-[#023030]/70">
              No menu items available yet.
            </div>
          )}
        </div>

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