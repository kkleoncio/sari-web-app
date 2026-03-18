import type { Meal, PreferenceMode } from "@/app/home/types";

/**
 * Final shape of each generated meal plan option.
 * This is what your frontend receives and displays.
 */
export type GeneratedMealOption = {
  meals: Meal[];
  totalCost: number;
  remainingBudget: number;
  score: number;
  label?: string;
};

/**
 * Input needed by the generator.
 * - meals: all available meals after filtering
 * - budget: user's budget
 * - mealsPerDay: how many meal slots to fill
 * - count: how many options to return
 * - preferenceMode: affects scoring and labeling
 */
type GenerateMealPlansParams = {
  meals: Meal[];
  budget: number;
  mealsPerDay: number;
  count?: number;
  preferenceMode?: PreferenceMode;
  preferredTags?: string[];
  dislikedTags?: string[];
  categoryLimit?: number;
};
const DEFAULT_COUNT = 6;

/**
 * Converts the user's mealsPerDay into actual meal slots.
 *
 * Example:
 * 1 => ["lunch"]
 * 2 => ["lunch", "dinner"]
 * 3 => ["breakfast", "lunch", "dinner"]
 * 4 => ["breakfast", "lunch", "dinner", "snack"]
 */
function getMealSlots(mealsPerDay: number): string[] {
  if (mealsPerDay <= 1) return ["lunch"];
  if (mealsPerDay === 2) return ["lunch", "dinner"];
  if (mealsPerDay === 3) return ["breakfast", "lunch", "dinner"];
  if (mealsPerDay === 4) return ["breakfast", "lunch", "dinner", "snack"];
  return ["breakfast", "lunch", "dinner"];
}

/**
 * Checks whether a meal can be used for a given slot.
 *
 * If meal.mealTime is empty, we allow it everywhere.
 * This makes the generator more forgiving when some meals
 * do not have detailed meal-time data yet.
 */
function mealMatchesSlot(meal: Meal, slot: string): boolean {
  if (!meal.mealTime || meal.mealTime.length === 0) return true;
  return meal.mealTime.includes(slot);
}

/**
 * Calculates how "good" a meal plan is.
 *
 * Higher score = better plan.
 *
 * The score changes depending on preferenceMode:
 * - cheapest: prefers lower total cost
 * - variety: prefers more variety in food type and establishments
 * - balanced: tries to balance budget use, health, and variety
 */
function calculatePlanScore(
  meals: Meal[],
  budget: number,
  totalCost: number,
  preferenceMode: PreferenceMode = "balanced"
): number {
  const remainingBudget = budget - totalCost;

  // Average health score of all meals in the plan.
  const avgHealth =
    meals.reduce((sum, meal) => sum + (meal.healthScore ?? 5), 0) /
    meals.length;

  // Variety signals: different food types and different establishments.
  const uniqueFoodTypes = new Set(meals.map((meal) => meal.foodType)).size;
  const uniqueEstablishments = new Set(
    meals.map((meal) => meal.establishmentName)
  ).size;

  // Too many fried meals lowers the score a bit.
  const friedCount = meals.filter((meal) => meal.isFried).length;

  // Plans that use the budget well get a better score.
  // Plans that leave too much unused budget score lower.
  const budgetUsageScore = Math.max(0, 100 - remainingBudget * 1.2);

  // Health contributes positively.
  const healthScore = avgHealth * 8;

  // Variety contributes positively.
  const varietyScore = uniqueFoodTypes * 10 + uniqueEstablishments * 6;

  // Penalty if the plan has too many fried meals.
  const friedPenalty = friedCount >= 2 ? 12 : 0;

  // Cheapest mode: prioritize lower cost first.
  if (preferenceMode === "cheapest") {
    return 200 - totalCost + avgHealth * 3 - friedPenalty;
  }

  // Variety mode: prioritize variety more strongly.
  if (preferenceMode === "variety") {
    return (
      varietyScore * 2 +
      healthScore +
      budgetUsageScore * 0.4 -
      friedPenalty
    );
  }

  // Balanced mode: mix budget fit, health, and variety.
  return budgetUsageScore + healthScore + varietyScore - friedPenalty;
}

/**
 * Creates a unique key for a combination of meals.
 *
 * We sort IDs first so that the order does not matter.
 * This helps remove duplicate combinations later.
 */
function getCombinationKey(meals: Meal[]): string {
  return meals
    .map((meal) => meal._id)
    .sort()
    .join("|");
}

/**
 * Prevents the same meal name from appearing twice in one plan.
 *
 * Example:
 * If "Chicken Fillet" appears twice, we reject that combo.
 */
function hasDuplicateMealNames(meals: Meal[]): boolean {
  const names = meals.map((meal) => meal.mealName.toLowerCase());
  return new Set(names).size !== meals.length;
}

/**
 * Builds a single meal plan option.
 *
 * Returns null if:
 * - total cost goes over budget
 * - duplicate meal names exist
 */
function buildOption(
  meals: Meal[],
  budget: number,
  preferenceMode: PreferenceMode = "balanced"
): GeneratedMealOption | null {
  const totalCost = meals.reduce((sum, meal) => sum + meal.price, 0);

  if (totalCost > budget) return null;
  if (hasDuplicateMealNames(meals)) return null;

  return {
    meals,
    totalCost,
    remainingBudget: budget - totalCost,
    score: calculatePlanScore(meals, budget, totalCost, preferenceMode),
  };
}

/**
 * Builds all possible combinations from arrays.
 *
 * Example:
 * [[A, B], [C, D]]
 * becomes:
 * [[A, C], [A, D], [B, C], [B, D]]
 *
 * We use this to try combinations across meal slots.
 */
function cartesianProduct<T>(arrays: T[][]): T[][] {
  return arrays.reduce<T[][]>(
    (acc, curr) => acc.flatMap((a) => curr.map((b) => [...a, b])),
    [[]]
  );
}

/**
 * Removes duplicate meal plans using meal IDs.
 *
 * Two plans with the same set of meals are treated as one,
 * even if they came from different slot combinations.
 */
function dedupeByMealIds(options: GeneratedMealOption[]): GeneratedMealOption[] {
  const seen = new Set<string>();
  const result: GeneratedMealOption[] = [];

  for (const option of options) {
    const key = getCombinationKey(option.meals);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(option);
    }
  }

  return result;
}

/**
 * Adds a human-friendly label to each generated option.
 *
 * Labels depend on the user's chosen preference mode.
 * This helps the UI explain why a plan is being suggested.
 */
function labelOptions(
  sorted: GeneratedMealOption[],
  preferenceMode: PreferenceMode = "balanced"
): GeneratedMealOption[] {
  if (sorted.length === 0) return [];

  // Lowest total cost option.
  const cheapest = [...sorted].sort((a, b) => a.totalCost - b.totalCost)[0];

  // Highest average health score option.
  const healthiest = [...sorted].sort((a, b) => {
    const aHealth =
      a.meals.reduce((sum, meal) => sum + (meal.healthScore ?? 5), 0) /
      a.meals.length;
    const bHealth =
      b.meals.reduce((sum, meal) => sum + (meal.healthScore ?? 5), 0) /
      b.meals.length;
    return bHealth - aHealth;
  })[0];

  // Option that leaves the most remaining budget.
  const mostFlexible = [...sorted].sort(
    (a, b) => b.remainingBudget - a.remainingBudget
  )[0];

  // Option with the most variety in food type + establishments.
  const mostVaried = [...sorted].sort((a, b) => {
    const aVariety =
      new Set(a.meals.map((meal) => meal.foodType)).size +
      new Set(a.meals.map((meal) => meal.establishmentName)).size;
    const bVariety =
      new Set(b.meals.map((meal) => meal.foodType)).size +
      new Set(b.meals.map((meal) => meal.establishmentName)).size;

    return bVariety - aVariety;
  })[0];

  // Since the list is already score-sorted, the first one is the "best".
  const best = sorted[0];

  return sorted.map((option) => {
    const key = getCombinationKey(option.meals);

    if (preferenceMode === "cheapest") {
      if (key === getCombinationKey(best.meals)) {
        return { ...option, label: "Best budget pick" };
      }
      if (key === getCombinationKey(cheapest.meals)) {
        return { ...option, label: "Cheapest option" };
      }
      if (key === getCombinationKey(mostFlexible.meals)) {
        return { ...option, label: "More budget left" };
      }
      return { ...option, label: "Budget-friendly" };
    }

    if (preferenceMode === "variety") {
      if (key === getCombinationKey(best.meals)) {
        return { ...option, label: "Most variety" };
      }
      if (key === getCombinationKey(mostVaried.meals)) {
        return { ...option, label: "Different picks" };
      }
      if (key === getCombinationKey(healthiest.meals)) {
        return { ...option, label: "Balanced variety" };
      }
      return { ...option, label: "Varied option" };
    }

    // Default: balanced mode labels.
    if (key === getCombinationKey(best.meals)) {
      return { ...option, label: "Best match" };
    }
    if (key === getCombinationKey(healthiest.meals)) {
      return { ...option, label: "Healthier pick" };
    }
    if (key === getCombinationKey(cheapest.meals)) {
      return { ...option, label: "Cheapest option" };
    }
    if (key === getCombinationKey(mostFlexible.meals)) {
      return { ...option, label: "More flexible" };
    }

    return { ...option, label: "Suggested option" };
  });
}

/**
 * Main generator function.
 *
 * Flow:
 * 1. Determine the meal slots needed
 * 2. Build a pool of matching meals for each slot
 * 3. Generate all possible combinations
 * 4. Reject invalid combinations
 * 5. Score and dedupe valid plans
 * 6. Label the best options
 * 7. Return only the requested number of plans
 */
export function generateMealPlans({
  meals,
  budget,
  mealsPerDay,
  count = DEFAULT_COUNT,
  preferenceMode = "balanced",
}: GenerateMealPlansParams): GeneratedMealOption[] {
  if (!meals.length || budget <= 0 || mealsPerDay <= 0) return [];

  // Example:
  // 3 meals/day => ["breakfast", "lunch", "dinner"]
  const slots = getMealSlots(mealsPerDay);

  /**
   * For each slot, get meals that match it.
   * If no meals match a slot, fall back to all meals
   * so the generator can still produce something.
   */
  const slotPools = slots.map((slot) => {
    const matching = meals.filter((meal) => mealMatchesSlot(meal, slot));
    return matching.length > 0 ? matching : meals;
  });

  // Build every possible meal combination across the slot pools.
  const rawCombos = cartesianProduct(slotPools);

  const validOptions: GeneratedMealOption[] = [];

  for (const combo of rawCombos) {
    // Reject combos that reuse the exact same meal object.
    const ids = combo.map((meal) => meal._id);
    if (new Set(ids).size !== combo.length) continue;

    const option = buildOption(combo, budget, preferenceMode);
    if (option) validOptions.push(option);
  }

  /**
   * Remove duplicates, sort by score, and keep only the top 20
   * before labeling. This helps performance a bit and avoids
   * labeling too many weak options.
   */
  const uniqueOptions = dedupeByMealIds(validOptions)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

  // Add labels, then return only the requested count.
  return labelOptions(uniqueOptions, preferenceMode).slice(0, count);
}