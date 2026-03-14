import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Establishment from "@/models/Establishment";

export async function GET() {
  try {
    await connectToDatabase();

    const establishments = await Establishment.find({}).sort({ name: 1 });

    return NextResponse.json({
      ok: true,
      count: establishments.length,
      establishments,
    });
  } catch (error) {
    console.error("GET /api/establishments error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to fetch establishments",
      },
      { status: 500 }
    );
  }
}