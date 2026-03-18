import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import MealPlan from "@/models/MealPlan";

export async function POST(req: Request) {
  try {
    const { userId, mealPlanId } = await req.json();

    if (!userId || !mealPlanId) {
      return NextResponse.json(
        { ok: false, message: "userId and mealPlanId are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const plan = await MealPlan.findOne({
      _id: mealPlanId,
      userId,
    });

    if (!plan) {
      return NextResponse.json(
        { ok: false, message: "Meal plan not found" },
        { status: 404 }
      );
    }

    await MealPlan.updateMany(
      { userId, selected: true },
      { $set: { selected: false } }
    );

    plan.selected = true;
    await plan.save();

    return NextResponse.json({
      ok: true,
      message: "Meal plan restored successfully",
      mealPlan: plan,
    });
  } catch (error) {
    console.error("POST /api/mealplans/use-again error:", error);

    return NextResponse.json(
      { ok: false, message: "Failed to restore meal plan" },
      { status: 500 }
    );
  }
}