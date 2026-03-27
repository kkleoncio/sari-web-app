import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import MealModel from "@/models/Meal";

type MealQuality = "main" | "light" | "side" | "drink";

function normalizeTags(tags: unknown): string[] {
  return Array.isArray(tags)
    ? tags.map((tag) => String(tag).toLowerCase())
    : [];
}

function getMealQuality(meal: any): MealQuality {
  const category = String(meal.category ?? "").toLowerCase();
  const foodType = String(meal.foodType ?? "").toLowerCase();
  const mealName = String(meal.mealName ?? "").toLowerCase();
  const tags = normalizeTags(meal.tags);

  const hasAnyTag = (...values: string[]) =>
    values.some((value) => tags.includes(value.toLowerCase()));

  const nameIncludes = (...values: string[]) =>
    values.some((value) => mealName.includes(value.toLowerCase()));

  if (
    foodType.includes("drink") ||
    category === "drink" ||
    hasAnyTag(
      "drink",
      "water",
      "juice",
      "coffee",
      "milk tea",
      "shake",
      "smoothie",
      "iced tea",
      "soft drink"
    )
  ) {
    return "drink";
  }

  if (
    category === "side" ||
    hasAnyTag("side", "dip", "sauce", "pickle", "add-on", "addon") ||
    nameIncludes(
      "plain rice",
      "extra rice",
      "fried egg",
      "extra egg",
      "garlic rice",
      "cheese sauce",
      "kimchi add",
      "siomai per piece"
    )
  ) {
    return "side";
  }

  if (
    foodType.includes("rice meal") ||
    foodType.includes("silog") ||
    foodType.includes("breakfast meal") ||
    foodType.includes("combo meal") ||
    foodType.includes("burger meal") ||
    foodType.includes("soup meal") ||
    foodType.includes("noodle meal") ||
    foodType.includes("pasta") ||
    foodType.includes("rice bowl") ||
    foodType.includes("sizzler") ||
    nameIncludes("w/ rice", "with rice", "silog", "bibimbap", "ramen", "curry")
  ) {
    return "main";
  }

  if (
    foodType.includes("snack") ||
    foodType.includes("sandwich") ||
    foodType.includes("burger") ||
    category === "snack" ||
    hasAnyTag(
      "sandwich",
      "burger",
      "kimbap",
      "tteokbokki",
      "fries",
      "siomai",
      "odeng",
      "dumpling",
      "snack",
      "merienda"
    ) ||
    nameIncludes(
      "sandwich",
      "burger",
      "kimbap",
      "tteokbokki",
      "odeng",
      "siomai",
      "fries",
      "japchae"
    )
  ) {
    return "light";
  }

  return "light";
}

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function buildDayBudget(totalBudget: number, dayIndex: number) {
  const base = Math.floor(totalBudget / 7);
  const remainder = totalBudget % 7;
  return base + (dayIndex < remainder ? 1 : 0);
}

function buildWeeklyLabel(index: number, preferenceMode: string) {
  if (preferenceMode === "cheapest") {
    return index === 0 ? "Best weekly budget pick" : "Another weekly option";
  }

  if (preferenceMode === "variety") {
    return index === 0 ? "Most varied weekly plan" : "Another weekly option";
  }

  return index === 0 ? "Best weekly match" : "Another weekly option";
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();

    const budget = Number(body.budget);
    const mealsPerDay = Number(body.mealsPerDay);
    const count = Number(body.count ?? 6);

    const allowanceType =
      body.allowanceType === "weekly" ? "weekly" : "daily";

    const foodType = body.foodType;
    const category = body.category;
    const excludeAllergens = Array.isArray(body.excludeAllergens)
      ? body.excludeAllergens
      : [];
    const vegetarianOnly = Boolean(body.vegetarianOnly);
    const preferenceMode = body.preferenceMode ?? "balanced";
    const mealType = body.mealType ?? "full-meals";

    const preferredTags = Array.isArray(body.preferredTags)
      ? body.preferredTags
      : [];
    const dislikedTags = Array.isArray(body.dislikedTags)
      ? body.dislikedTags
      : [];
    const categoryLimit = Number(body.categoryLimit ?? 3);

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

    console.log("Generate request:", {
      budget,
      allowanceType,
      mealsPerDay,
      count,
      preferenceMode,
      mealType,
      preferredTags,
      dislikedTags,
      excludeAllergens,
      categoryLimit,
    });

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

    const mealsWithQuality = meals.map((meal) => ({
      ...meal,
      mealQuality: getMealQuality(meal),
    }));

    if (mealType === "full-meals") {
      meals = mealsWithQuality.filter((meal) => {
        return meal.mealQuality === "main" || meal.mealQuality === "light";
      });
    } else if (mealType === "snacks") {
      meals = mealsWithQuality.filter((meal) => {
        return meal.mealQuality === "light";
      });
    } else {
      meals = mealsWithQuality.filter((meal) => meal.mealQuality !== "drink");
    }

    const normalizedMeals = meals.map((meal: any) => ({
      ...meal,
      _id: String(meal._id),
    }));

    console.log("Meals after filtering:", {
      total: normalizedMeals.length,
      sample: normalizedMeals.slice(0, 8).map((meal: any) => ({
        mealName: meal.mealName,
        price: meal.price,
        mealTime: meal.mealTime,
        category: meal.category,
        foodType: meal.foodType,
        establishmentName: meal.establishmentName,
        tags: meal.tags,
        mealQuality: meal.mealQuality,
      })),
    });

    if (normalizedMeals.length < mealsPerDay) {
      return NextResponse.json(
        {
          ok: false,
          message: "Not enough meals available to generate a plan.",
        },
        { status: 400 }
      );
    }

    if (!process.env.SOLVER_URL) {
      return NextResponse.json(
        {
          ok: false,
          message: "Solver URL is not configured.",
        },
        { status: 500 }
      );
    }

    const solverBasePayload = {
      meals: normalizedMeals.map((meal: any) => ({
        ...meal,
        _id: String(meal._id),
        price: Math.round(Number(meal.price || 0)),
        healthScore: Math.round(Number(meal.healthScore || 5)),
        mealTime: Array.isArray(meal.mealTime) ? meal.mealTime : [],
        tags: Array.isArray(meal.tags) ? meal.tags : [],
        allergens: Array.isArray(meal.allergens) ? meal.allergens : [],
        mealQuality: meal.mealQuality ?? "light",
      })),
      mealsPerDay,
      count,
      preferenceMode,
      preferredTags,
      dislikedTags,
      excludeAllergens,
      categoryLimit,
    };

    // DAILY: keep original behavior
    if (allowanceType === "daily") {
      const solverRes = await fetch(`${process.env.SOLVER_URL}/solve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...solverBasePayload,
          budget: Math.round(budget),
          usedMealIds: [],
          usedEstablishments: [],
        }),
      });

      const solverData = await solverRes.json();

      console.log("Solver status:", solverRes.status);
      console.log("Solver response:", solverData);

      if (!solverRes.ok || !solverData.ok) {
        return NextResponse.json(
          {
            ok: false,
            message:
              solverData.message ||
              `No meal plan fits PHP ${budget} right now. Try increasing your budget or reducing meals per day.`,
          },
          { status: 400 }
        );
      }

      const options = Array.isArray(solverData.options) ? solverData.options : [];

      if (!options.length) {
        return NextResponse.json(
          {
            ok: false,
            message: `No meal plan fits PHP ${budget} right now. Try increasing your budget or reducing meals per day.`,
          },
          { status: 400 }
        );
      }

      const seen = new Set<string>();

      const uniqueOptions = options.filter((option: any) => {
        const key = (option.meals || [])
          .map((meal: any) => String(meal._id))
          .sort()
          .join("|");

        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      if (!uniqueOptions.length) {
        return NextResponse.json(
          {
            ok: false,
            message: `No unique meal plan fits PHP ${budget} right now. Try increasing your budget or adding more meals.`,
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        ok: true,
        allowanceType: "daily",
        options: uniqueOptions,
      });
    }

    // WEEKLY: solve 7 daily plans and combine
    const weeklyOptions: any[] = [];

    for (let optionIndex = 0; optionIndex < count; optionIndex++) {
      const days: any[] = [];
      const usedMealIds: string[] = [];
      const usedEstablishments: string[] = [];

      let weeklyTotalCost = 0;
      let weeklyRemainingBudget = budget;
      let failedDay: string | null = null;
      let failureMessage = "";

      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
  const dayBudget = buildDayBudget(Math.round(budget), dayIndex);

  const solverRes = await fetch(`${process.env.SOLVER_URL}/solve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...solverBasePayload,
      budget: dayBudget,
      count: 1,
      mealsPerDay,
      usedMealIds,
      usedEstablishments,
    }),
  });

  const solverData = await solverRes.json();

  if (
    !solverRes.ok ||
    !solverData.ok ||
    !Array.isArray(solverData.options) ||
    !solverData.options.length
  ) {
    failedDay = WEEK_DAYS[dayIndex];
    failureMessage =
      solverData?.message ||
      `No meal plan fits PHP ${dayBudget} for ${failedDay}.`;
    break;
  }

  const picked = solverData.options[0];
  const mealsForDayRaw = Array.isArray(picked.meals) ? picked.meals : [];

  console.log("Weekly day result:", {
    day: WEEK_DAYS[dayIndex],
    requestedMealsPerDay: mealsPerDay,
    returnedMeals: mealsForDayRaw.length,
    mealNames: mealsForDayRaw.map((meal: any) => meal.mealName),
  });

  // HARD VALIDATION
  if (mealsForDayRaw.length !== mealsPerDay) {
    failedDay = WEEK_DAYS[dayIndex];
    failureMessage = `Invalid result for ${failedDay}: expected ${mealsPerDay} meals, got ${mealsForDayRaw.length}.`;
    console.error("Weekly generation validation failed:", {
      day: WEEK_DAYS[dayIndex],
      expectedMealsPerDay: mealsPerDay,
      actualMeals: mealsForDayRaw.length,
      picked,
    });
    break;
  }

  const mealsForDay = mealsForDayRaw.slice(0, mealsPerDay);

  const totalCost = mealsForDay.reduce(
    (sum: number, meal: any) => sum + Number(meal.price ?? 0),
    0
  );

  const remainingBudget = Math.max(0, dayBudget - totalCost);

  days.push({
    day: dayIndex + 1,
    label: WEEK_DAYS[dayIndex],
    budget: dayBudget,
    meals: mealsForDay,
    totalCost,
    remainingBudget,
  });

  weeklyTotalCost += totalCost;
  weeklyRemainingBudget -= totalCost;

  for (const meal of mealsForDay) {
    if (meal?._id) usedMealIds.push(String(meal._id));
    if (meal?.establishmentName) {
      usedEstablishments.push(String(meal.establishmentName));
    }
  }
}

      if (failedDay) {
        if (optionIndex === 0) {
          return NextResponse.json(
            {
              ok: false,
              message: `${failureMessage} Weekly plans work best when the per-day budget is realistic. Try increasing the weekly budget or lowering meals per day.`,
            },
            { status: 400 }
          );
        }
        break;
      }

      const totalWeeklyMeals = days.reduce(
        (sum, day) => sum + day.meals.length,
        0
      );

      if (days.length !== 7 || totalWeeklyMeals !== 7 * mealsPerDay) {
        if (optionIndex === 0) {
          return NextResponse.json(
            {
              ok: false,
              message: `Weekly plan validation failed. Expected ${7 * mealsPerDay} meals across 7 days, got ${totalWeeklyMeals}.`,
            },
            { status: 400 }
          );
        }
        break;
      }

      weeklyOptions.push({
        allowanceType: "weekly",
        label: buildWeeklyLabel(optionIndex, preferenceMode),
        days,
        totalCost: weeklyTotalCost,
        remainingBudget: Math.max(0, weeklyRemainingBudget),
      });
    }

    if (!weeklyOptions.length) {
      const estimatedPerDay = Math.floor(budget / 7);
      return NextResponse.json(
        {
          ok: false,
          message: `No weekly meal plan fits PHP ${budget} right now. Your estimated daily budget is about PHP ${estimatedPerDay}. Try increasing your budget or reducing meals per day.`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      allowanceType: "weekly",
      options: weeklyOptions,
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