import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import MealPlan from "@/models/MealPlan";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { ok: false, message: "userId is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const latestPlan = await MealPlan.findOne({ userId, selected: true }).sort({
      createdAt: -1,
    });

    if (!latestPlan) {
      return NextResponse.json({
        ok: true,
        mealPlan: null,
        message: "No saved meal plan found",
      });
    }

    return NextResponse.json({
      ok: true,
      mealPlan: latestPlan,
    });
  } catch (error) {
    console.error("GET /api/mealplans/latest error:", error);

    return NextResponse.json(
      { ok: false, message: "Failed to fetch latest meal plan" },
      { status: 500 }
    );
  }
}