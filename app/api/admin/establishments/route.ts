import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Establishment from "@/models/Establishment";
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

    const establishments = await Establishment.find().sort({ createdAt: -1 });

    return NextResponse.json(establishments, { status: 200 });
  } catch (error) {
    console.error("GET establishments error:", error);

    return NextResponse.json(
      { message: "Failed to fetch establishments" },
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

    const newEstablishment = await Establishment.create({
      name: body.name,
      category: body.category,
      location: body.location,
      priceRange: body.priceRange,
      openingHours: body.openingHours,
      isOpen: body.isOpen ?? true,
      tags: Array.isArray(body.tags) ? body.tags : [],
    });

    return NextResponse.json(newEstablishment, { status: 201 });
  } catch (error) {
    console.error("POST establishment error:", error);

    return NextResponse.json(
      { message: "Failed to create establishment" },
      { status: 500 }
    );
  }
}