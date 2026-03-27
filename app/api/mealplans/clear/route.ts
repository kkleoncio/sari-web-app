import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import MealPlan from "@/models/MealPlan";

export async function DELETE(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Missing userId" },
        { status: 400 }
      );
    }

    await MealPlan.deleteMany({ userId });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Clear history error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to clear history" },
      { status: 500 }
    );
  }
}