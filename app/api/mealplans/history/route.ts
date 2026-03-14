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

    const history = await MealPlan.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      ok: true,
      history,
    });
  } catch (error) {
    console.error("GET /api/mealplans/history error:", error);

    return NextResponse.json(
      { ok: false, message: "Failed to fetch meal plan history" },
      { status: 500 }
    );
  }
}