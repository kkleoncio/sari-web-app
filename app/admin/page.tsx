import { Users, Store, UtensilsCrossed, ArrowUpRight, Sparkles } from "lucide-react";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import Establishment from "@/models/Establishment";
import Meal from "@/models/Meal";
import Link from "next/link";

export default async function AdminPage() {
  await connectToDatabase();

  const [totalUsers, totalEstablishments, totalMeals] = await Promise.all([
    User.countDocuments(),
    Establishment.countDocuments(),
    Meal.countDocuments(),
  ]);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[28px] border border-white/50 bg-[linear-gradient(135deg,rgba(10,143,143,0.08),rgba(255,255,255,0.9),rgba(31,92,66,0.08))] p-7 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-teal-100/40 blur-2xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0d3626]/10 bg-white/70 px-3 py-1.5 text-xs text-[#1f5c42] shadow-sm font-helvetica">
              <Sparkles className="h-3.5 w-3.5" />
              SARI Admin Panel
            </div>

            <h1 className="mt-4 font-poppins text-3xl font-semibold tracking-[-0.02em] text-[#023030] md:text-4xl">
              Admin Dashboard
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 font-helvetica">
              Manage your app data, monitor your meal ecosystem, and keep SARI
              organized with a clean and simple control center.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
  <Link
    href="/admin/users"
    className="group rounded-[24px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)] focus:outline-none focus:ring-4 focus:ring-emerald-100"
  >
    <div className="flex items-start justify-between">
      <div className="rounded-2xl bg-emerald-50 p-3 text-[#1f5c42]">
        <Users className="h-5 w-5" />
      </div>

      <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] text-[#1f5c42] font-helvetica">
        View
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </div>

    <div className="mt-6">
      <p className="text-sm text-slate-500 font-helvetica">Total Users</p>
      <h3 className="mt-2 font-poppins text-3xl font-semibold tracking-[-0.03em] text-[#023030]">
        {totalUsers}
      </h3>
      <p className="mt-2 text-xs text-slate-400 font-helvetica">
        Registered users in the system
      </p>
    </div>
  </Link>

  <Link
    href="/admin/establishments"
    className="group rounded-[24px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)] focus:outline-none focus:ring-4 focus:ring-teal-100"
  >
    <div className="flex items-start justify-between">
      <div className="rounded-2xl bg-teal-50 p-3 text-[#0a6c6c]">
        <Store className="h-5 w-5" />
      </div>

      <div className="flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-[11px] text-[#0a6c6c] font-helvetica">
        View
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </div>

    <div className="mt-6">
      <p className="text-sm text-slate-500 font-helvetica">Establishments</p>
      <h3 className="mt-2 font-poppins text-3xl font-semibold tracking-[-0.03em] text-[#023030]">
        {totalEstablishments}
      </h3>
      <p className="mt-2 text-xs text-slate-400 font-helvetica">
        Food spots currently managed by admin
      </p>
    </div>
  </Link>

  <Link
    href="/admin/meals"
    className="group rounded-[24px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-amber-200 hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)] focus:outline-none focus:ring-4 focus:ring-amber-100"
  >
    <div className="flex items-start justify-between">
      <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
        <UtensilsCrossed className="h-5 w-5" />
      </div>

      <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] text-amber-600 font-helvetica">
        View
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </div>

    <div className="mt-6">
      <p className="text-sm text-slate-500 font-helvetica">Meals</p>
      <h3 className="mt-2 font-poppins text-3xl font-semibold tracking-[-0.03em] text-[#023030]">
        {totalMeals}
      </h3>
      <p className="mt-2 text-xs text-slate-400 font-helvetica">
        Available meal entries in SARI
      </p>
    </div>
  </Link>
</section>

      <section className="grid gap-4 lg:grid-cols-[1.35fr_0.9fr]">
        <div className="rounded-[26px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-poppins text-xl font-semibold text-[#023030]">
                Quick Overview
              </h2>
              <p className="mt-1 text-sm text-slate-500 font-helvetica">
                A simple summary of what this admin space is for.
              </p>
            </div>

            <div className="rounded-full bg-[#0d3626]/5 px-3 py-1 text-xs text-[#1f5c42] font-helvetica">
              Internal
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#f7faf9] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400 font-helvetica">
                Manage
              </p>
              <h3 className="mt-2 font-poppins text-lg font-semibold text-[#1f5c42]">
                Establishments
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 font-helvetica">
                Add, update, and organize food establishments available to
                students.
              </p>
            </div>

            <div className="rounded-2xl bg-[#f7faf9] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400 font-helvetica">
                Control
              </p>
              <h3 className="mt-2 font-poppins text-lg font-semibold text-[#1f5c42]">
                Meal Data
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 font-helvetica">
                Keep pricing, categories, and availability updated for better
                user recommendations.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[26px] border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff,rgba(245,250,248,0.92))] p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400 font-helvetica">
              Admin Notes
            </p>
            <h2 className="mt-2 font-poppins text-xl font-semibold text-[#023030]">
              Keep SARI clean and updated
            </h2>
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-sm text-slate-700 font-helvetica">
                Review establishments and remove outdated entries.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-sm text-slate-700 font-helvetica">
                Make sure meal prices stay aligned with actual campus options.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-sm text-slate-700 font-helvetica">
                Keep availability tags consistent for better meal plan output.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}