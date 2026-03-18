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
      selectedOption: {
        meals: MealDTO[];
        totalCost: number;
        remainingBudget: number;
        score?: number;
        label?: string;
      };
    } = await req.json();

    const numericBudget = Number(budget);
    const numericMealsPerDay = Number(mealsPerDay ?? selectedOption?.meals?.length);

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

    if (!selectedOption?.meals?.length) {
      return NextResponse.json(
        { ok: false, message: "selectedOption with meals is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    await MealPlan.updateMany(
      { userId, selected: true },
      { $set: { selected: false } }
    );

    const normalizedMeals = selectedOption.meals.map((meal) => ({
      _id: meal._id,
      mealName: meal.mealName,
      price: Number(meal.price ?? 0),
      establishmentName: meal.establishmentName,
      establishmentCategory: meal.establishmentCategory ?? "",
      location: meal.location ?? "",
      foodType: meal.foodType ?? "",
      category: meal.category ?? "",
      mealTime: meal.mealTime ?? [],
      healthScore: meal.healthScore ?? 5,
      isFried: meal.isFried ?? false,
      isSoup: meal.isSoup ?? false,
      isVegetarian: meal.isVegetarian ?? false,
      tags: meal.tags ?? [],
      allergens: meal.allergens ?? [],
    }));

    const mealPlan = new MealPlan({
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
    });

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