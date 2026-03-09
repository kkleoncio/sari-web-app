import connectToDatabase from "@/lib/db";
import Meal from "@/models/Meal";

type AllowanceType = "daily" | "weekly";

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function POST(req: Request) {
  try {
    const {
      budget,
      allowanceType = "daily",
      mealsPerDay = 3,
      count = 6,
    }: {
      budget: number;
      allowanceType?: AllowanceType;
      mealsPerDay?: number;
      count?: number;
    } = await req.json();

    if (!budget || budget <= 0) {
      return new Response(JSON.stringify({ message: "Valid budget is required" }), { status: 400 });
    }

    await connectToDatabase();

    // ✅ One query: include establishment name
    const meals = await Meal.find()
      .populate("establishmentId", "name")
      .lean();

    if (!meals.length) {
      return new Response(JSON.stringify({ message: "No meals found" }), { status: 404 });
    }

    const days = allowanceType === "weekly" ? 7 : 1;
    const targetMeals = Math.max(1, Math.min(50, Number(mealsPerDay) * days));
    const desired = Math.min(Math.max(1, Number(count) || 6), 12);

    const buildPlan = (candidates: any[]) => {
      let remainingBudget = budget;
      const selected: Array<{ mealName: string; price: number; establishment: string }> = [];

      for (const meal of candidates) {
        if (selected.length >= targetMeals) break;

        const price = Number(meal.price ?? 0);
        if (price <= 0) continue;

        if (price <= remainingBudget) {
          const estName =
            (meal.establishmentId && (meal.establishmentId as any).name) ||
            "Unknown Establishment";

          selected.push({
            mealName: meal.mealName || "Unknown Meal",
            price,
            establishment: estName,
          });

          remainingBudget -= price;
        }
      }

      const totalCost = budget - remainingBudget;

      return {
        meals: selected,
        totalCost,
        remainingBudget,
      };
    };

    const options: Array<{
      meals: Array<{ mealName: string; price: number; establishment: string }>;
      totalCost: number;
      remainingBudget: number;
    }> = [];

    const seen = new Set<string>();
    const MAX_ATTEMPTS = desired * 30;

    let attempts = 0;
    while (options.length < desired && attempts < MAX_ATTEMPTS) {
      attempts++;

      // Randomize
      const shuffled = shuffle(meals);

      // Variety trick: half the time, bias to cheaper-first; half pure random
      const candidates =
        Math.random() < 0.5
          ? shuffled
          : [...shuffled].sort((a, b) => Number(a.price) - Number(b.price));

      const plan = buildPlan(candidates);

      // skip empty plans
      if (!plan.meals.length) continue;

      // dedupe by signature
      const signature = plan.meals
        .map((m) => `${m.establishment}|${m.mealName}|${m.price}`)
        .sort()
        .join("||");

      if (seen.has(signature)) continue;
      seen.add(signature);

      options.push(plan);
    }

    return new Response(
      JSON.stringify({
        options,
        meta: { budget, allowanceType, mealsPerDay, targetMeals, generated: options.length },
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Failed to generate options" }), { status: 500 });
  }
}