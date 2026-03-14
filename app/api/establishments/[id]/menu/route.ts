import connectToDatabase from "@/lib/db";
import Meal from "@/models/Meal";
import Establishment from "@/models/Establishment";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    await connectToDatabase();

    const { id } = await params;

    const establishment = await Establishment.findById(id).lean();

    if (!establishment) {
      return NextResponse.json(
        { ok: false, message: "Establishment not found" },
        { status: 404 }
      );
    }

    const meals = await Meal.find({
      establishmentName: establishment.name,
      isAvailable: true,
    }).lean();

    return NextResponse.json({
      ok: true,
      meals,
    });
  } catch (error) {
    console.error("GET /api/establishments/[id]/menu error:", error);

    return NextResponse.json(
      { ok: false, message: "Failed to fetch establishment menu" },
      { status: 500 }
    );
  }
}