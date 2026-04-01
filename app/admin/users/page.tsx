"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Mail,
  ShieldCheck,
  Wallet,
  CalendarDays,
  Search,
  Sparkles,
} from "lucide-react";

type AdminUser = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role?: "admin" | "user";
  budget?: number;
  allowanceType?: "daily" | "weekly";
  createdAt?: string;
};

function formatDate(date?: string) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function fetchUsers() {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/users", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to fetch users");
      }

      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      alert("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return users;

    return users.filter((user) => {
      const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`
        .trim()
        .toLowerCase();

      return (
        fullName.includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        user.role?.toLowerCase().includes(q)
      );
    });
  }, [users, search]);

  const totalUsers = users.length;
  const adminCount = users.filter((user) => user.role === "admin").length;
  const regularUsers = users.filter((user) => user.role !== "admin").length;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[28px] border border-white/60 bg-[linear-gradient(135deg,rgba(10,143,143,0.08),rgba(255,255,255,0.94),rgba(31,92,66,0.08))] p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
        <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-emerald-100/50 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-24 w-24 rounded-full bg-teal-100/40 blur-2xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0d3626]/10 bg-white/80 px-3 py-1.5 text-xs text-[#1f5c42] shadow-sm font-helvetica">
              <Sparkles className="h-3.5 w-3.5" />
              User Management
            </div>

            <h1 className="mt-4 font-poppins text-3xl font-semibold tracking-[-0.03em] text-[#023030]">
              Users
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 font-helvetica">
              View registered users, their roles, and basic account details in
              one clean admin space.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-helvetica">
                Total
              </p>
              <p className="mt-1 font-poppins text-lg font-semibold text-[#023030]">
                {totalUsers}
              </p>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-helvetica">
                Admins
              </p>
              <p className="mt-1 font-poppins text-lg font-semibold text-[#1f5c42]">
                {adminCount}
              </p>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm col-span-2 sm:col-span-1">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-helvetica">
                Users
              </p>
              <p className="mt-1 font-poppins text-lg font-semibold text-[#023030]">
                {regularUsers}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-poppins text-xl font-semibold text-[#023030]">
              All Users
            </h2>
            <p className="mt-1 text-sm text-slate-500 font-helvetica">
              Search and review registered accounts.
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-[#fbfcfc] py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#1f5c42]/30 focus:bg-white focus:ring-4 focus:ring-emerald-50 font-helvetica"
            />
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-14 text-center">
              <p className="font-poppins text-lg font-medium text-[#023030]">
                Loading users...
              </p>
              <p className="mt-2 text-sm text-slate-500 font-helvetica">
                Please wait while SARI fetches user records.
              </p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-[#1f5c42]">
                <Users className="h-6 w-6" />
              </div>
              <p className="mt-4 font-poppins text-lg font-medium text-[#023030]">
                No users found
              </p>
              <p className="mt-2 text-sm text-slate-500 font-helvetica">
                Try a different search or check again later.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {filteredUsers.map((user) => {
                const fullName =
                  `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
                  "Unnamed User";

                return (
                  <div
                    key={user._id}
                    className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#fbfcfc)] p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate font-poppins text-lg font-semibold text-[#023030]">
                            {fullName}
                          </h3>

                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-helvetica ${
                              user.role === "admin"
                                ? "bg-emerald-50 text-[#1f5c42]"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            {user.role === "admin" ? "Admin" : "User"}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-500 font-helvetica">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-[#f8fbfa] p-3">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Mail className="h-4 w-4" />
                          <span className="text-[11px] uppercase tracking-[0.14em] font-helvetica">
                            Email
                          </span>
                        </div>
                        <p className="mt-2 break-all text-sm text-slate-700 font-helvetica">
                          {user.email}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#f8fbfa] p-3">
                        <div className="flex items-center gap-2 text-slate-400">
                          <ShieldCheck className="h-4 w-4" />
                          <span className="text-[11px] uppercase tracking-[0.14em] font-helvetica">
                            Role
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-700 font-helvetica">
                          {user.role ?? "user"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#f8fbfa] p-3">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Wallet className="h-4 w-4" />
                          <span className="text-[11px] uppercase tracking-[0.14em] font-helvetica">
                            Budget
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-700 font-helvetica">
                          ₱{Number(user.budget ?? 0)}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#f8fbfa] p-3">
                        <div className="flex items-center gap-2 text-slate-400">
                          <CalendarDays className="h-4 w-4" />
                          <span className="text-[11px] uppercase tracking-[0.14em] font-helvetica">
                            Allowance
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-700 font-helvetica">
                          {user.allowanceType ?? "daily"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#f8fbfa] p-3 sm:col-span-2">
                        <div className="flex items-center gap-2 text-slate-400">
                          <CalendarDays className="h-4 w-4" />
                          <span className="text-[11px] uppercase tracking-[0.14em] font-helvetica">
                            Joined
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-700 font-helvetica">
                          {formatDate(user.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}