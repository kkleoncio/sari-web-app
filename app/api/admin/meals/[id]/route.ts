import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Meal from "@/models/Meal";
import { requireAdminApi } from "@/lib/requireAdmin";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(req: NextRequest, context: RouteContext) {

     const auth = await requireAdminApi();

  if (!auth.ok) {
    return NextResponse.json(
      { message: auth.message },
      { status: auth.status }
    );
  }

  try {
    await connectToDatabase();

    const { id } = await context.params;
    const body = await req.json();

    const updatedMeal = await Meal.findByIdAndUpdate(
      id,
      {
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
      },
      { new: true, runValidators: true }
    );

    if (!updatedMeal) {
      return NextResponse.json({ message: "Meal not found" }, { status: 404 });
    }

    return NextResponse.json(updatedMeal, { status: 200 });
  } catch (error) {
    console.error("PUT meal error:", error);

    return NextResponse.json(
      { message: "Failed to update meal" },
      { status: 500 }
    );
  }
}

export async function DELETE(_: NextRequest, context: RouteContext) {

     const auth = await requireAdminApi();

  if (!auth.ok) {
    return NextResponse.json(
      { message: auth.message },
      { status: auth.status }
    );
  }
  
  try {
    await connectToDatabase();

    const { id } = await context.params;

    const deletedMeal = await Meal.findByIdAndDelete(id);

    if (!deletedMeal) {
      return NextResponse.json({ message: "Meal not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Meal deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE meal error:", error);

    return NextResponse.json(
      { message: "Failed to delete meal" },
      { status: 500 }
    );
  }
}