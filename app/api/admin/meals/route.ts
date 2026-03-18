import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Meal from "@/models/Meal";
import { requireAdminApi } from "@/lib/requireAdmin";

export async function GET() {

const auth = await requireAdminApi();

  if (!auth.ok) {
    return NextResponse.json(
      { message: auth.message },
      { status: auth.status }
    );
  }

  try {
    await connectToDatabase();

    const meals = await Meal.find().sort({ createdAt: -1 });

    return NextResponse.json(meals, { status: 200 });
  } catch (error) {
    console.error("GET meals error:", error);

    return NextResponse.json(
      { message: "Failed to fetch meals" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {

     const auth = await requireAdminApi();

    if (!auth.ok) {
        return NextResponse.json(
        { message: auth.message },
        { status: auth.status }
        );
    }

  try {
    await connectToDatabase();

    const body = await req.json();

    const newMeal = await Meal.create({
      mealName: body.mealName,
      foodType: body.foodType,
      category: body.category,
      price: Number(body.price),
      establishmentName: body.establishmentName,
      establishmentCategory: body.establishmentCategory,
      location: body.location,
      mealTime: Array.isArray(body.mealTime) ? body.mealTime : [],
      healthScore: Number(body.healthScore ?? 5),
      isFried: body.isFried ?? false,
      isSoup: body.isSoup ?? false,
      isVegetarian: body.isVegetarian ?? false,
      tags: Array.isArray(body.tags) ? body.tags : [],
      allergens: Array.isArray(body.allergens) ? body.allergens : [],
      isAvailable: body.isAvailable ?? true,
    });

    return NextResponse.json(newMeal, { status: 201 });
  } catch (error) {
    console.error("POST meal error:", error);

    return NextResponse.json(
      { message: "Failed to create meal" },
      { status: 500 }
    );
  }
}