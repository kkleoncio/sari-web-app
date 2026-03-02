import connectToDatabase from "@/lib/db";
import Meal from "@/models/Meal";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // Optional: filter by query
    const url = new URL(req.url);
    const establishmentId = url.searchParams.get("establishmentId");

    let query = {};
    if (establishmentId) {
      query = { establishmentId };
    }

    const meals = await Meal.find(query);

    return NextResponse.json(meals);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch meals", error },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { mealName, tags, type, category, price, establishmentId } = body;

    // Validation
    if (!mealName || !price || !establishmentId) {
      return NextResponse.json(
        { message: "mealName, price, and establishmentId are required" },
        { status: 400 }
      );
    }

    const meal = await Meal.create({
      name: mealName,
      tags: tags || [],
      type,
      category,
      price,
      establishmentId
    });

    return NextResponse.json(meal);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to create meal", error },
      { status: 500 }
    );
  }
}