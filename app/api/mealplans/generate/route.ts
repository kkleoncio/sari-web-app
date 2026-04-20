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

function getMaxReasonableMealPrice(
  budget: number,
  mealsPerDay: number,
  allowanceType: "daily" | "weekly"
) {
  const effectiveDailyBudget =
    allowanceType === "weekly" ? Math.floor(budget / 7) : budget;

  if (mealsPerDay <= 0) return Infinity;

  const perMealBudget = effectiveDailyBudget / mealsPerDay;

  return Math.ceil(perMealBudget * 2.2);
}

function trimMealsForSolver(
  meals: any[],
  budget: number,
  mealsPerDay: number,
  allowanceType: "daily" | "weekly"
) {
  const maxReasonableMealPrice = getMaxReasonableMealPrice(
    budget,
    mealsPerDay,
    allowanceType
  );

  const filtered = meals.filter((meal) => {
    const price = Number(meal.price ?? 0);
    return price > 0 && price <= maxReasonableMealPrice;
  });

  if (filtered.length > 0) {
    return filtered;
  }

  return meals.filter((meal) => Number(meal.price ?? 0) > 0);
}

function createTimeoutSignal(ms: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeoutId),
  };
}

async function postToSolver(
  path: string,
  payload: unknown,
  label: string
): Promise<{ res: Response; data: any }> {
  const { signal, clear } = createTimeoutSignal(8000);
  const startedAt = Date.now();

  try {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal,
    });

    const data = await res.json();
    console.log(`[generate] ${label} solver call: ${Date.now() - startedAt}ms`);

    return { res, data };
  } finally {
    clear();
  }
}

function countMealOverlap(a: any, b: any) {
  const aIds = new Set((a.meals || []).map((meal: any) => String(meal._id)));
  const bIds = new Set((b.meals || []).map((meal: any) => String(meal._id)));

  let overlap = 0;
  for (const id of aIds) {
    if (bIds.has(id)) overlap += 1;
  }
  return overlap;
}

function countEstablishmentOverlap(a: any, b: any) {
  const aEsts = new Set(
    (a.meals || [])
      .map((meal: any) => String(meal.establishmentName ?? "").trim().toLowerCase())
      .filter(Boolean)
  );
  const bEsts = new Set(
    (b.meals || [])
      .map((meal: any) => String(meal.establishmentName ?? "").trim().toLowerCase())
      .filter(Boolean)
  );

  let overlap = 0;
  for (const est of aEsts) {
    if (bEsts.has(est)) overlap += 1;
  }
  return overlap;
}

function diversifyOptions(options: any[], targetCount: number) {
  const sorted = [...options].sort((a, b) => {
    const scoreDiff = Number(b.score ?? 0) - Number(a.score ?? 0);
    if (scoreDiff !== 0) return scoreDiff;

    const remainingBudgetDiff =
      Number(b.remainingBudget ?? 0) - Number(a.remainingBudget ?? 0);
    if (remainingBudgetDiff !== 0) return remainingBudgetDiff;

    return Number(a.totalCost ?? 0) - Number(b.totalCost ?? 0);
  });

  const picked: any[] = [];

  for (const option of sorted) {
    const tooSimilar = picked.some((existing) => {
    const mealOverlap = countMealOverlap(existing, option);
    const establishmentOverlap = countEstablishmentOverlap(existing, option);

    console.log(
      "[diversify] comparing",
      option.meals.map((m: any) => m.mealName),
      "vs",
      existing.meals.map((m: any) => m.mealName),
      "| mealOverlap:",
      mealOverlap,
      "| establishmentOverlap:",
      establishmentOverlap
    );

    return mealOverlap >= 1 || establishmentOverlap >= 2;
  });

    if (!tooSimilar) {
      picked.push(option);
    }

    if (picked.length >= targetCount) {
      return picked;
    }
  }

  for (const option of sorted) {
    if (picked.length >= targetCount) break;
    if (!picked.includes(option)) {
      picked.push(option);
    }
  }

  return picked;
}

export async function POST(req: NextRequest) {
  const totalStart = Date.now();

  try {
    const dbConnectStart = Date.now();
    await connectToDatabase();
    console.log(`[generate] DB connect: ${Date.now() - dbConnectStart}ms`);

    const body = await req.json();

    const budget = Number(body.budget);
    const mealsPerDay = Number(body.mealsPerDay);

    const rawCount = Number(body.count ?? 3);
    const count = Math.min(Math.max(rawCount, 1), 6);

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
      ? body.preferredTags.map((tag: string) => String(tag).toLowerCase())
      : [];
    const dislikedTags = Array.isArray(body.dislikedTags)
      ? body.dislikedTags.map((tag: string) => String(tag).toLowerCase())
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

    const query: Record<string, unknown> = {
      isAvailable: true,
      isStandalone: { $ne: false },
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

    const dbFetchStart = Date.now();
    let meals = await MealModel.find(query)
      .select(
        [
          "_id",
          "mealName",
          "foodType",
          "category",
          "price",
          "establishmentName",
          "mealTime",
          "healthScore",
          "isFried",
          "isSoup",
          "isVegetarian",
          "tags",
          "allergens",
          "isStandalone",
        ].join(" ")
      )
      .lean();
    console.log(`[generate] DB fetch meals: ${Date.now() - dbFetchStart}ms`);

    const preprocessStart = Date.now();

    if (excludeAllergens.length > 0) {
      const blocked = new Set(
        excludeAllergens.map((allergen: string) => allergen.toLowerCase())
      );

      meals = meals.filter((meal) => {
        const mealAllergens = Array.isArray(meal.allergens)
          ? meal.allergens.map((a: string) => String(a).toLowerCase())
          : [];
        return !mealAllergens.some((allergen: string) => blocked.has(allergen));
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
      _id: String(meal._id),
      mealName: String(meal.mealName ?? ""),
      foodType: String(meal.foodType ?? "").toLowerCase(),
      category: String(meal.category ?? "").toLowerCase(),
      price: Math.round(Number(meal.price || 0)),
      establishmentName: String(meal.establishmentName ?? ""),
      mealTime: Array.isArray(meal.mealTime)
        ? meal.mealTime.map((m: string) => String(m).toLowerCase())
        : [],
      healthScore: Math.round(Number(meal.healthScore || 5)),
      isFried: Boolean(meal.isFried),
      isSoup: Boolean(meal.isSoup),
      isVegetarian: Boolean(meal.isVegetarian),
      tags: Array.isArray(meal.tags)
        ? meal.tags.map((tag: string) => String(tag).toLowerCase())
        : [],
      allergens: Array.isArray(meal.allergens)
        ? meal.allergens.map((a: string) => String(a).toLowerCase())
        : [],
      mealQuality: meal.mealQuality ?? "light",
      isStandalone: meal.isStandalone !== false,
    }));

    const solverCandidateMeals = trimMealsForSolver(
      normalizedMeals,
      budget,
      mealsPerDay,
      allowanceType
    );

    console.log(
      `[generate] preprocessing: ${Date.now() - preprocessStart}ms`
    );
    console.log(
      `[generate] candidates for solver: ${solverCandidateMeals.length}`
    );

    if (solverCandidateMeals.length < mealsPerDay) {
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
      meals: solverCandidateMeals.map((meal: any) => ({
        _id: meal._id,
        mealName: meal.mealName,
        foodType: String(meal.foodType ?? "").toLowerCase(),
        category: meal.category,
        price: meal.price,
        establishmentName: meal.establishmentName,
        mealTime: meal.mealTime,
        healthScore: meal.healthScore,
        isFried: meal.isFried,
        isSoup: meal.isSoup,
        isVegetarian: meal.isVegetarian,
        tags: meal.tags,
        allergens: meal.allergens,
        mealQuality: meal.mealQuality,
        isStandalone: meal.isStandalone,
      })),
      mealsPerDay,
      count,
      preferenceMode,
      preferredTags,
      dislikedTags,
      excludeAllergens: excludeAllergens.map((a: string) =>
        String(a).toLowerCase()
      ),
      categoryLimit,
    };

    console.log(
      `[generate] solver payload meals: ${solverBasePayload.meals.length}`
    );

    if (allowanceType === "daily") {
      const { res: solverRes, data: solverData } = await postToSolver(
        `${process.env.SOLVER_URL}/solve`,
        {
          ...solverBasePayload,
          budget: Math.round(budget),
          usedMealIds: [],
          usedEstablishments: [],
        },
        "daily"
      );

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

      console.log("[generate] raw solver options:");

options.forEach((option: any, i: number) => {
  console.log(
    `[generate] option ${i + 1}:`,
    option.meals.map(
      (m: any) =>
        `${m.mealName} (${m.establishmentName}) ₱${m.price}`
    )
  );
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

      console.log(
          "[generate] unique option sets:",
          uniqueOptions.map((opt: any) =>
            opt.meals.map((m: any) => m.mealName)
          )
        );

      

      if (!uniqueOptions.length) {
        return NextResponse.json(
          {
            ok: false,
            message: `No unique meal plan fits PHP ${budget} right now. Try increasing your budget or adding more meals.`,
          },
          { status: 400 }
        );
      }

      const diversifiedOptions = diversifyOptions(uniqueOptions, count);
      console.log(
        "[generate] diversified final options:",
        diversifiedOptions.map((opt: any) =>
          opt.meals.map((m: any) => m.mealName)
        )
      );

      console.log(`[generate] unique daily options: ${uniqueOptions.length}`);
      console.log(
        `[generate] diversified daily options returned: ${diversifiedOptions.length}`
      );
      console.log(`[generate] TOTAL: ${Date.now() - totalStart}ms`);

      return NextResponse.json({
        ok: true,
        allowanceType: "daily",
        options: diversifiedOptions,
      });
    }

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

        const { res: solverRes, data: solverData } = await postToSolver(
          `${process.env.SOLVER_URL}/solve`,
          {
            ...solverBasePayload,
            budget: dayBudget,
            count: 1,
            mealsPerDay,
            usedMealIds,
            usedEstablishments,
          },
          `weekly day ${dayIndex + 1}`
        );

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

        if (mealsForDayRaw.length !== mealsPerDay) {
          failedDay = WEEK_DAYS[dayIndex];
          failureMessage = `Invalid result for ${failedDay}: expected ${mealsPerDay} meals, got ${mealsForDayRaw.length}.`;
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
          if (meal?._id) usedMealIds.push(String(meal._id).toLowerCase());
          if (meal?.establishmentName) {
            usedEstablishments.push(String(meal.establishmentName).toLowerCase());
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

    console.log(`[generate] TOTAL: ${Date.now() - totalStart}ms`);

    return NextResponse.json({
      ok: true,
      allowanceType: "weekly",
      options: weeklyOptions,
    });
  } catch (error: any) {
    console.error("Error in meal plan generation:", error);

    if (error?.name === "AbortError") {
      return NextResponse.json(
        {
          ok: false,
          message:
            "The solver took too long to respond. Please try again in a moment.",
        },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { ok: false, message: "An error occurred while generating meal plans." },
      { status: 500 }
    );
  }
}