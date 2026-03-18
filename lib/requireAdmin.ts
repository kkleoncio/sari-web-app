import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";

type TokenPayload = {
  userId: string;
  email: string;
  role: "user" | "admin";
};

export async function requireAdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/auth/login");
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as TokenPayload;

    if (decoded.role !== "admin") {
      redirect("/home");
    }

    return decoded;
  } catch {
    redirect("/auth/login");
  }
}

export async function requireAdminApi() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return { ok: false, status: 401, message: "Unauthorized" };
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as TokenPayload;

    if (decoded.role !== "admin") {
      return { ok: false, status: 403, message: "Forbidden" };
    }

    return { ok: true, user: decoded };
  } catch {
    return { ok: false, status: 401, message: "Invalid token" };
  }
}