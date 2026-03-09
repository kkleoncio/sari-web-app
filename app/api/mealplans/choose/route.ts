import connectToDatabase from "@/lib/db";
import MealPlan from "@/models/MealPlan";

type AllowanceType = "daily" | "weekly";

type MealDTO = {
  mealName: string;
  price: number;
  establishment: string;
};

export async function POST(req: Request) {
  try {
    const {
      userId,
      allowanceType = "daily",
      budget,
      selectedOption,
    }: {
      userId: string;
      allowanceType?: AllowanceType;
      budget: number;
      selectedOption: {
        meals: MealDTO[];
        totalCost: number;
        remainingBudget: number;
      };
    } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ message: "userId is required" }), { status: 400 });
    }
    if (!budget || budget <= 0) {
      return new Response(JSON.stringify({ message: "Valid budget is required" }), { status: 400 });
    }
    if (!selectedOption?.meals?.length) {
      return new Response(JSON.stringify({ message: "selectedOption with meals is required" }), {
        status: 400,
      });
    }

    await connectToDatabase();

    const mealPlan = new MealPlan({
      userId,
      allowanceType,
      budget, // optional: only if your schema supports it; safe to keep/remove
      totalCost: selectedOption.totalCost,
      remainingBudget: selectedOption.remainingBudget,
      meals: selectedOption.meals,
    });

    await mealPlan.save();

    return new Response(JSON.stringify({ message: "Meal plan saved", mealPlanId: mealPlan._id }), {
      status: 200,
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Failed to save meal plan" }), { status: 500 });
  }
}