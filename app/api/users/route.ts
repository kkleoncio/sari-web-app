import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const body = await req.json();

    const {
      firstName,
      lastName,
      email,
      password,
      budget,
      allowanceType
    } = body;

    // check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return Response.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      budget,
      allowanceType
    });

    return Response.json(user);

  } catch (error) {
    return Response.json(
      { message: "Server error", error },
      { status: 500 }
    );
  }
}

export async function GET() {
  await connectToDatabase();

  const users = await User.find();

  return Response.json(users);
}