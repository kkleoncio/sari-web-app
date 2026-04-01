import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function requireAdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  if (session.user.role !== "admin") {
    redirect("/home");
  }

  return session.user;
}

export async function requireAdminApi() {
  const session = await auth();

  if (!session?.user) {
    return { ok: false, status: 401, message: "Unauthorized" };
  }

  if (session.user.role !== "admin") {
    return { ok: false, status: 403, message: "Forbidden" };
  }

  return { ok: true, user: session.user };
}