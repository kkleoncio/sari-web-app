import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Meal from "@/models/Meal";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const establishment = searchParams.get("establishment");
    const foodType = searchParams.get("foodType");
    const category = searchParams.get("category");

    const query: Record<string, unknown> = {
      isAvailable: true,
    };

    if (establishment) {
      query.establishmentName = establishment;
    }

    if (foodType) {
      query.foodType = foodType;
    }

    if (category) {
      query.category = category;
    }

    const meals = await Meal.find(query).sort({ price: 1, mealName: 1 });

    return NextResponse.json({
      ok: true,
      count: meals.length,
      meals,
    });
  } catch (error) {
    console.error("GET /api/meals error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to fetch meals",
      },
      { status: 500 }
    );
  }
}