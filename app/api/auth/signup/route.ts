import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();

    const firstName = body.firstName?.trim();
    const lastName = body.lastName?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        {
          message:
            existingUser.authProvider === "google"
              ? "This email is already registered with Google. Please sign in with Google."
              : "Email already exists",
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: "user",
      authProvider: "credentials",
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        userId: String(user._id),
        firstName: user.firstName,
        email: user.email,
        role: user.role || "user",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/auth/signup error:", error);

    return NextResponse.json(
      { message: "Sign up failed. Please try again." },
      { status: 500 }
    );
  }
}