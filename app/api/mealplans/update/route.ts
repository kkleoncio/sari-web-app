import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import MealPlan from "@/models/MealPlan";

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

export async function PATCH(req: Request) {
  try {
    const {
      userId,
      meals,
      totalCost,
      remainingBudget,
      isCustomized,
    }: {
      userId: string;
      meals: MealDTO[];
      totalCost: number;
      remainingBudget: number;
      isCustomized?: boolean;
    } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { ok: false, message: "userId is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(meals)) {
      return NextResponse.json(
        { ok: false, message: "meals array is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const latestPlan = await MealPlan.findOne({ userId, selected: true }).sort({
      createdAt: -1,
    });

    if (!latestPlan) {
      return NextResponse.json(
        { ok: false, message: "No active meal plan found" },
        { status: 404 }
      );
    }

    const normalizedMeals = meals.map((meal) => ({
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

    latestPlan.meals = normalizedMeals;
    latestPlan.totalCost = Number(totalCost ?? 0);
    latestPlan.remainingBudget = Number(remainingBudget ?? 0);
    latestPlan.mealsPerDay = normalizedMeals.length;
    latestPlan.isCustomized = Boolean(isCustomized);

    await latestPlan.save();

    return NextResponse.json({
      ok: true,
      message: "Meal plan updated successfully",
      mealPlan: latestPlan,
    });
  } catch (error) {
    console.error("PATCH /api/mealplans/update error:", error);

    return NextResponse.json(
      { ok: false, message: "Failed to update meal plan" },
      { status: 500 }
    );
  }
}