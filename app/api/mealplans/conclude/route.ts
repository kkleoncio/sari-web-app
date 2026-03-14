import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import MealPlan from "@/models/MealPlan";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { ok: false, message: "userId is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    await MealPlan.updateMany(
      { userId, selected: true },
      { $set: { selected: false } }
    );

    return NextResponse.json({
      ok: true,
      message: "Day concluded successfully",
    });
  } catch (error) {
    console.error("POST /api/mealplans/conclude error:", error);

    return NextResponse.json(
      { ok: false, message: "Failed to conclude day" },
      { status: 500 }
    );
  }
}