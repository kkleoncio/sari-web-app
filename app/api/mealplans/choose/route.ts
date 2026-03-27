import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import MealPlan from "@/models/MealPlan";

type AllowanceType = "daily" | "weekly";

type MealDTO = {
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

type WeeklyDayDTO = {
  day: number;
  label: string;
  budget?: number;
  meals: MealDTO[];
  totalCost: number;
  remainingBudget: number;
};

type SelectedOptionDTO = {
  meals?: MealDTO[];
  days?: WeeklyDayDTO[];
  totalCost: number;
  remainingBudget: number;
  score?: number;
  label?: string;
};

function normalizeMeal(meal: MealDTO) {
  return {
    _id: meal._id,
    mealName: meal.mealName,
    price: Number(meal.price ?? 0),
    establishmentName: meal.establishmentName,
    establishmentCategory: meal.establishmentCategory ?? "",
    location: meal.location ?? "",
    foodType: meal.foodType ?? "",
    category: meal.category ?? "",
    mealTime: Array.isArray(meal.mealTime) ? meal.mealTime : [],
    healthScore: Number(meal.healthScore ?? 5),
    isFried: meal.isFried ?? false,
    isSoup: meal.isSoup ?? false,
    isVegetarian: meal.isVegetarian ?? false,
    tags: Array.isArray(meal.tags) ? meal.tags : [],
    allergens: Array.isArray(meal.allergens) ? meal.allergens : [],
  };
}

export async function POST(req: Request) {
  try {
    const {
      userId,
      allowanceType = "daily",
      budget,
      mealsPerDay,
      selectedOption,
    }: {
      userId: string;
      allowanceType?: AllowanceType;
      budget: number;
      mealsPerDay?: number;
      selectedOption: SelectedOptionDTO;
    } = await req.json();

    const numericBudget = Number(budget);

    if (!userId) {
      return NextResponse.json(
        { ok: false, message: "userId is required" },
        { status: 400 }
      );
    }

    if (Number.isNaN(numericBudget) || numericBudget <= 0) {
      return NextResponse.json(
        { ok: false, message: "Valid budget is required" },
        { status: 400 }
      );
    }

    if (!selectedOption || typeof selectedOption !== "object") {
      return NextResponse.json(
        { ok: false, message: "selectedOption is required" },
        { status: 400 }
      );
    }

    let normalizedMeals: ReturnType<typeof normalizeMeal>[] = [];
    let normalizedDays: any[] = [];
    let numericMealsPerDay = Number(mealsPerDay ?? 0);

    if (allowanceType === "weekly") {
      if (!Array.isArray(selectedOption.days) || !selectedOption.days.length) {
        return NextResponse.json(
          {
            ok: false,
            message: "selectedOption with days is required for weekly plans",
          },
          { status: 400 }
        );
      }

      normalizedDays = selectedOption.days.map((day) => ({
        day: Number(day.day),
        label: day.label ?? "",
        budget:
          day.budget !== undefined && day.budget !== null
            ? Number(day.budget)
            : undefined,
        meals: Array.isArray(day.meals)
          ? day.meals.map((meal) => normalizeMeal(meal))
          : [],
        totalCost: Number(day.totalCost ?? 0),
        remainingBudget: Number(day.remainingBudget ?? 0),
      }));

      normalizedMeals = normalizedDays.flatMap((day) => day.meals);

      if (!normalizedMeals.length) {
        return NextResponse.json(
          {
            ok: false,
            message: "Weekly selectedOption must contain meals inside days",
          },
          { status: 400 }
        );
      }

      if (Number.isNaN(numericMealsPerDay) || numericMealsPerDay <= 0) {
        const firstDayMealCount = normalizedDays[0]?.meals?.length ?? 0;
        numericMealsPerDay = firstDayMealCount;
      }
    } else {
      if (!Array.isArray(selectedOption.meals) || !selectedOption.meals.length) {
        return NextResponse.json(
          { ok: false, message: "selectedOption with meals is required" },
          { status: 400 }
        );
      }

      normalizedMeals = selectedOption.meals.map((meal) => normalizeMeal(meal));

      if (Number.isNaN(numericMealsPerDay) || numericMealsPerDay <= 0) {
        numericMealsPerDay = normalizedMeals.length;
      }
    }

    await connectToDatabase();

    await MealPlan.updateMany(
      { userId, selected: true },
      { $set: { selected: false } }
    );

    const mealPlanData: any = {
      userId,
      allowanceType,
      budget: numericBudget,
      mealsPerDay: numericMealsPerDay,
      totalCost: Number(selectedOption.totalCost ?? 0),
      remainingBudget: Number(selectedOption.remainingBudget ?? 0),
      score: Number(selectedOption.score ?? 0),
      label: selectedOption.label ?? "",
      selected: true,
      isCustomized: false,
      meals: normalizedMeals,
    };

    if (allowanceType === "weekly") {
      mealPlanData.days = normalizedDays;
    }

    const mealPlan = new MealPlan(mealPlanData);

    await mealPlan.save();

    return NextResponse.json({
      ok: true,
      message: "Meal plan saved",
      mealPlanId: mealPlan._id,
    });
  } catch (err) {
    console.error("POST /api/mealplans/choose error:", err);

    return NextResponse.json(
      { ok: false, message: "Failed to save meal plan" },
      { status: 500 }
    );
  }
}