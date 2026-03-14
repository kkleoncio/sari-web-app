import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import MealModel from "@/models/Meal";
import { generateMealPlans } from "@/lib/meal-generator";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();

    const budget = Number(body.budget);
    const mealsPerDay = Number(body.mealsPerDay);
    const count = Number(body.count ?? 6);

    const foodType = body.foodType;
    const category = body.category;
    const excludeAllergens = Array.isArray(body.excludeAllergens)
      ? body.excludeAllergens
      : [];
    const vegetarianOnly = Boolean(body.vegetarianOnly);
    const preferenceMode = body.preferenceMode ?? "balanced";
    const mealType = body.mealType ?? "full-meals";

    if (Number.isNaN(budget) || budget <= 0) {
      return NextResponse.json(
        { ok: false, message: "Valid budget is required." },
        { status: 400 }
      );
    }

    if (Number.isNaN(mealsPerDay) || mealsPerDay <= 0) {
      return NextResponse.json(
        { ok: false, message: "Valid mealsPerDay is required." },
        { status: 400 }
      );
    }

    if (Number.isNaN(count) || count <= 0) {
      return NextResponse.json(
        { ok: false, message: "Valid count is required." },
        { status: 400 }
      );
    }

    const query: Record<string, unknown> = {
      isAvailable: true,
    };

    if (foodType) {
      query.foodType = foodType;
    }

    if (category) {
      query.category = category;
    }

    if (vegetarianOnly) {
      query.isVegetarian = true;
    }

    let meals = await MealModel.find(query).lean();

    if (excludeAllergens.length > 0) {
      meals = meals.filter((meal) => {
        const mealAllergens = meal.allergens ?? [];
        return !excludeAllergens.some((allergen: string) =>
          mealAllergens.includes(allergen)
        );
      });
    }

    if (mealType === "full-meals") {
      meals = meals.filter((meal) => {
        const category = meal.category?.toLowerCase() ?? "";
        const foodType = meal.foodType?.toLowerCase() ?? "";
        const tags = (meal.tags ?? []).map((tag: string) => tag.toLowerCase());

        return (
          category.includes("meal") ||
          category.includes("rice") ||
          foodType.includes("meal") ||
          tags.includes("heavy") ||
          tags.includes("rice meal")
        );
      });
    }

    if (mealType === "snacks") {
      meals = meals.filter((meal) => {
        const category = meal.category?.toLowerCase() ?? "";
        const foodType = meal.foodType?.toLowerCase() ?? "";
        const tags = (meal.tags ?? []).map((tag: string) => tag.toLowerCase());

        return (
          category.includes("snack") ||
          foodType.includes("snack") ||
          tags.includes("light") ||
          tags.includes("merienda")
        );
      });
    }

    const normalizedMeals = meals.map((meal) => ({
      ...meal,
      _id: String(meal._id),
    }));

    if (normalizedMeals.length < mealsPerDay) {
      return NextResponse.json(
        {
          ok: false,
          message: "Not enough meals available to generate a plan.",
        },
        { status: 400 }
      );
    }

    const options = generateMealPlans({
      meals: normalizedMeals,
      budget,
      mealsPerDay,
      count,
      preferenceMode,
    });

    if (!options.length) {
      return NextResponse.json(
        {
          ok: false,
          message: `No meal plan fits PHP ${budget} right now. Try increasing your budget or reducing meals per day.`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      options,
    });
  } catch (error) {
    console.error("POST /api/mealplans/generate error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to generate meal plans.",
      },
      { status: 500 }
    );
  }
}