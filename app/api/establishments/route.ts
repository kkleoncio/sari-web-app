import connectToDatabase from "@/lib/db";
import Establishment from "@/models/Establishment";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const establishments = await Establishment.find();

    return NextResponse.json(establishments);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch establishments", error }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { name, location, contactInfo, openingHours } = body;

    if (!name) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 });
    }

    const establishment = await Establishment.create({
      name,
      location,
      contactInfo,
      openingHours // new field
    });

    return NextResponse.json(establishment);
  } catch (error) {
    return NextResponse.json({ message: "Failed to create establishment", error }, { status: 500 });
  }
}