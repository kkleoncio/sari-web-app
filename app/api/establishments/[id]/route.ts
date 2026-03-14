import connectToDatabase from "@/lib/db";
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

    return NextResponse.json({
      ok: true,
      establishment,
    });
  } catch (error) {
    console.error("GET /api/establishments/[id] error:", error);

    return NextResponse.json(
      { ok: false, message: "Failed to fetch establishment" },
      { status: 500 }
    );
  }
}