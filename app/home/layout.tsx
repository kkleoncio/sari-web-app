import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function HomeLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  console.log("🏠 LAYOUT SESSION:", session);

  if (!session?.user) {
    redirect("/auth/login");
  }

  return <>{children}</>;
}