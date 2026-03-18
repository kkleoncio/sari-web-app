import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Establishment from "@/models/Establishment";
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

    const updatedEstablishment = await Establishment.findByIdAndUpdate(
      id,
      {
        name: body.name,
        category: body.category,
        location: body.location,
        priceRange: body.priceRange,
        openingHours: body.openingHours,
        isOpen: body.isOpen,
        tags: Array.isArray(body.tags) ? body.tags : [],
      },
      { new: true, runValidators: true }
    );

    if (!updatedEstablishment) {
      return NextResponse.json(
        { message: "Establishment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedEstablishment, { status: 200 });
  } catch (error) {
    console.error("PUT establishment error:", error);

    return NextResponse.json(
      { message: "Failed to update establishment" },
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

    const deletedEstablishment = await Establishment.findByIdAndDelete(id);

    if (!deletedEstablishment) {
      return NextResponse.json(
        { message: "Establishment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Establishment deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE establishment error:", error);

    return NextResponse.json(
      { message: "Failed to delete establishment" },
      { status: 500 }
    );
  }
}