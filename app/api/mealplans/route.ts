import connectToDatabase from "@/lib/db";
import Meal from "@/models/Meal";
import MealPlan from "@/models/MealPlan";
import Establishment from "@/models/Establishment";

export async function POST(req: Request) {
  try {
    const { budget, userId, allowanceType } = await req.json();

    if (!budget || !userId) {
      return new Response(
        JSON.stringify({ message: "Budget and userId are required" }),
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Fetch all meals
    const meals = await Meal.find();

    let remainingBudget = budget;
    const selectedMeals: any[] = [];

    for (const meal of meals) {
      if (meal.price <= remainingBudget) {
        // Look up the establishment name
        let establishmentName = "Unknown Establishment";
        if (meal.establishmentId) {
          const est = await Establishment.findById(meal.establishmentId);
          if (est && est.name) establishmentName = est.name;
        }

        selectedMeals.push({
          mealName: meal.mealName || "Unknown Meal",
          price: meal.price,
          establishment: establishmentName,
        });

        remainingBudget -= meal.price;
      }
    }

    const totalCost = budget - remainingBudget;

    // Save meal plan for user
    const mealPlan = new MealPlan({
      userId,
      allowanceType: allowanceType || "daily",
      totalCost,
      remainingBudget,
      meals: selectedMeals,
    });

    await mealPlan.save();

    return new Response(
      JSON.stringify({
        meals: selectedMeals,
        totalCost,
        remainingBudget,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ message: "Failed to generate meal plan" }),
      { status: 500 }
    );
  }
}