import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _req: NextRequest,
  { params }: RouteContext
) {
  try {
    await connectToDatabase();

    const { id } = await params;

    const user = await User.findById(id).select("firstName lastName email");

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: String(user._id),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("GET /api/users/[id] error:", error);

    return NextResponse.json(
      { ok: false, message: "Failed to fetch user." },
      { status: 500 }
    );
  }
}