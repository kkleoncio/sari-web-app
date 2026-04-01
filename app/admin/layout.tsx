import Link from "next/link";
import {
  LayoutDashboard,
  Store,
  UtensilsCrossed,
  ShieldCheck,
  BadgeCheck,
  Users
} from "lucide-react";
import { requireAdminPage } from "@/lib/requireAdmin";
import AdminLogoutButton from "@/components/admin/logout-button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminPage();

  return (
    <div className="h-screen overflow-hidden bg-[linear-gradient(135deg,#f7faf8_0%,#f2f7f5_45%,#eef6f3_100%)] text-slate-800">
      <div className="flex h-full">
        <aside className="relative hidden h-screen w-[285px] shrink-0 overflow-y-auto border-r border-white/60 bg-white/75 px-6 py-7 shadow-[8px_0_30px_rgba(15,23,42,0.03)] backdrop-blur-xl lg:flex lg:flex-col">
          <div className="pointer-events-none absolute -left-10 top-10 h-32 w-32 rounded-full bg-emerald-100/50 blur-3xl" />
          <div className="pointer-events-none absolute bottom-10 right-0 h-28 w-28 rounded-full bg-teal-100/40 blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0d3626]/10 bg-[#0d3626]/5 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-[#1f5c42] font-helvetica">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin Access
            </div>

            <div className="mt-5">
              <h1 className="font-poppins text-[28px] font-semibold tracking-[-0.03em] text-[#023030]">
                SARI
              </h1>
              <p className="mt-2 max-w-[220px] text-sm leading-6 text-slate-500 font-helvetica">
                Manage establishments, meals, and core platform data in one
                clean workspace.
              </p>
            </div>
          </div>

          <nav className="relative mt-10 space-y-2">
            <Link
              href="/admin"
              className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-700 transition-all duration-200 hover:bg-[#0d3626]/6 hover:text-[#1f5c42]"
            >
              <div className="rounded-xl bg-slate-100 p-2 text-slate-500 transition group-hover:bg-emerald-50 group-hover:text-[#1f5c42]">
                <LayoutDashboard className="h-4 w-4" />
              </div>
              <div>
                <p className="font-poppins text-sm font-medium">Dashboard</p>
                <p className="text-xs text-slate-400 font-helvetica">
                  Overview and insights
                </p>
              </div>
            </Link>

            <Link
              href="/admin/establishments"
              className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-700 transition-all duration-200 hover:bg-[#0d3626]/6 hover:text-[#1f5c42]"
            >
              <div className="rounded-xl bg-slate-100 p-2 text-slate-500 transition group-hover:bg-emerald-50 group-hover:text-[#1f5c42]">
                <Store className="h-4 w-4" />
              </div>
              <div>
                <p className="font-poppins text-sm font-medium">
                  Establishments
                </p>
                <p className="text-xs text-slate-400 font-helvetica">
                  Food places and details
                </p>
              </div>
            </Link>

            <Link
              href="/admin/meals"
              className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-700 transition-all duration-200 hover:bg-[#0d3626]/6 hover:text-[#1f5c42]"
            >
              <div className="rounded-xl bg-slate-100 p-2 text-slate-500 transition group-hover:bg-emerald-50 group-hover:text-[#1f5c42]">
                <UtensilsCrossed className="h-4 w-4" />
              </div>
              <div>
                <p className="font-poppins text-sm font-medium">Meals</p>
                <p className="text-xs text-slate-400 font-helvetica">
                  Menu and meal records
                </p>
              </div>
            </Link>

            <Link
              href="/admin/meal-combos"
              className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-700 transition-all duration-200 hover:bg-[#0d3626]/6 hover:text-[#1f5c42]"
            >
              <div className="rounded-xl bg-slate-100 p-2 text-slate-500 transition group-hover:bg-emerald-50 group-hover:text-[#1f5c42]">
                <BadgeCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="font-poppins text-sm font-medium">Meal Combos</p>
                <p className="text-xs text-slate-400 font-helvetica">
                  Verify generated combinations
                </p>
              </div>
            </Link>
            <Link
              href="/admin/users"
              className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-700 transition-all duration-200 hover:bg-[#0d3626]/6 hover:text-[#1f5c42]"
            >
              <div className="rounded-xl bg-slate-100 p-2 text-slate-500 transition group-hover:bg-emerald-50 group-hover:text-[#1f5c42]">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="font-poppins text-sm font-medium">Users</p>
                <p className="text-xs text-slate-400 font-helvetica">
                  Registered accounts
                </p>
              </div>
            </Link>
          </nav>

          <div className="mt-auto pt-6">
            <AdminLogoutButton />
          </div>
        </aside>

        <div className="flex h-full flex-1 flex-col overflow-hidden">
          <header className="sticky top-0 z-30 border-b border-white/50 bg-white/70 px-5 py-4 backdrop-blur-xl lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-helvetica">
                  Admin Workspace
                </p>
                <h2 className="mt-1 font-poppins text-lg font-semibold text-[#023030]">
                  Welcome back, Admin!
                </h2>
              </div>

              <div className="lg:hidden">
                <AdminLogoutButton />
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-5 py-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}