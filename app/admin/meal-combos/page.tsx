"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  PhilippinePeso,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Store,
  Tag,
  UtensilsCrossed,
  UserRound,
  XCircle,
} from "lucide-react";

type ComboMeal = {
  _id?: string;
  id?: string;
  mealName: string;
  price: number;
  establishmentName?: string;
  category?: string;
  foodType?: string;
  image?: string;
};

type ComboPost = {
  _id?: string;
  id: string;
  author?: string;
  handle?: string;
  tag?: string;
  title: string;
  body: string;
  postType: "tip" | "combo";
  totalCost: number;
  allowanceType: "daily" | "weekly";
  verificationStatus: "none" | "pending" | "approved" | "rejected";
  isVerified: boolean;
  meals: ComboMeal[];
  createdAt: string;
};

type FilterKey = "all" | "pending" | "approved" | "rejected";

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function AdminMealCombosPage() {
  const [combos, setCombos] = useState<ComboPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("pending");
  const [actioningId, setActioningId] = useState<string | null>(null);

  async function fetchCombos() {
    try {
      setLoading(true);

      const res = await fetch("/api/community/posts?view=all", {
        cache: "no-store",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load combo posts");
      }

      const posts = Array.isArray(data.posts) ? data.posts : [];
      const comboPosts = posts.filter((post: ComboPost) => post.postType === "combo");

      setCombos(comboPosts);
    } catch (error) {
      console.error("Failed to fetch combo posts:", error);
      alert("Failed to load meal combos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCombos();
  }, []);

  const filteredCombos = useMemo(() => {
    if (activeFilter === "all") return combos;
    return combos.filter((combo) => combo.verificationStatus === activeFilter);
  }, [combos, activeFilter]);

  const pendingCount = useMemo(
    () => combos.filter((combo) => combo.verificationStatus === "pending").length,
    [combos]
  );

  const approvedCount = useMemo(
    () => combos.filter((combo) => combo.verificationStatus === "approved").length,
    [combos]
  );

  const rejectedCount = useMemo(
    () => combos.filter((combo) => combo.verificationStatus === "rejected").length,
    [combos]
  );

  async function handleDecision(
    comboId: string,
    action: "approve" | "reject"
  ) {
    try {
      setActioningId(comboId);

      const res = await fetch(`/api/admin/combos/${comboId}/${action}`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `Failed to ${action} combo`);
      }

      setCombos((prev) =>
        prev.map((combo) =>
          combo.id === comboId
            ? {
                ...combo,
                verificationStatus: action === "approve" ? "approved" : "rejected",
                isVerified: action === "approve",
              }
            : combo
        )
      );
    } catch (error) {
      console.error(error);
      alert(`Failed to ${action} combo.`);
    } finally {
      setActioningId(null);
    }
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[28px] border border-white/60 bg-[linear-gradient(135deg,rgba(10,143,143,0.08),rgba(255,255,255,0.94),rgba(31,92,66,0.08))] p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
        <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-emerald-100/50 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-24 w-24 rounded-full bg-teal-100/40 blur-2xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0d3626]/10 bg-white/80 px-3 py-1.5 text-xs text-[#1f5c42] shadow-sm font-helvetica">
              <Sparkles className="h-3.5 w-3.5" />
              Combo Verification
            </div>

            <h1 className="mt-4 font-poppins text-3xl font-semibold tracking-[-0.03em] text-[#023030]">
              Meal Combos
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 font-helvetica">
              Review community-submitted meal combinations and decide which ones
              should be marked as verified for students to browse and trust.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-helvetica">
                Total
              </p>
              <p className="mt-1 font-poppins text-lg font-semibold text-[#023030]">
                {combos.length}
              </p>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-helvetica">
                Pending
              </p>
              <p className="mt-1 font-poppins text-lg font-semibold text-amber-600">
                {pendingCount}
              </p>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-helvetica">
                Approved
              </p>
              <p className="mt-1 font-poppins text-lg font-semibold text-[#1f5c42]">
                {approvedCount}
              </p>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-helvetica">
                Rejected
              </p>
              <p className="mt-1 font-poppins text-lg font-semibold text-rose-600">
                {rejectedCount}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-poppins text-xl font-semibold text-[#023030]">
              Review Queue
            </h2>
            <p className="mt-1 text-sm text-slate-500 font-helvetica">
              Filter combo submissions by verification status and review each one
              before publishing it as verified.
            </p>
          </div>

          <button
            onClick={fetchCombos}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 font-helvetica"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {[
            { key: "all", label: "All" },
            { key: "pending", label: "Pending" },
            { key: "approved", label: "Approved" },
            { key: "rejected", label: "Rejected" },
          ].map((item) => {
            const isActive = activeFilter === item.key;

            return (
              <button
                key={item.key}
                onClick={() => setActiveFilter(item.key as FilterKey)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition font-helvetica ${
                  isActive
                    ? "bg-[#023030] text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-14 text-center">
              <p className="font-poppins text-lg font-medium text-[#023030]">
                Loading meal combos...
              </p>
              <p className="mt-2 text-sm text-slate-500 font-helvetica">
                Please wait while SARI fetches community combo submissions.
              </p>
            </div>
          ) : filteredCombos.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-[#1f5c42]">
                <BadgeCheck className="h-6 w-6" />
              </div>
              <p className="mt-4 font-poppins text-lg font-medium text-[#023030]">
                No combos found
              </p>
              <p className="mt-2 text-sm text-slate-500 font-helvetica">
                There are no combo submissions under this filter yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {filteredCombos.map((combo) => {
                const comboId = combo.id || String(combo._id ?? "");
                const mealCount = combo.meals?.length ?? 0;

                return (
                  <div
                    key={comboId}
                    className="group rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#fbfcfc)] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(15,23,42,0.06)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate font-poppins text-lg font-semibold text-[#023030]">
                            {combo.title}
                          </h3>

                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-helvetica ${
                              combo.verificationStatus === "approved"
                                ? "bg-emerald-50 text-[#1f5c42]"
                                : combo.verificationStatus === "rejected"
                                ? "bg-rose-50 text-rose-600"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {combo.verificationStatus === "approved" ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : combo.verificationStatus === "rejected" ? (
                              <XCircle className="h-3.5 w-3.5" />
                            ) : (
                              <Clock3 className="h-3.5 w-3.5" />
                            )}
                            {combo.verificationStatus.charAt(0).toUpperCase() +
                              combo.verificationStatus.slice(1)}
                          </span>

                          {combo.isVerified && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#eaf7f2] px-2.5 py-1 text-[11px] text-[#1f5c42] font-helvetica">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              Verified
                            </span>
                          )}
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500 font-helvetica">
                          <span className="inline-flex items-center gap-1.5">
                            <UserRound className="h-4 w-4" />
                            {combo.author || "Unknown author"}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Clock3 className="h-4 w-4" />
                            {formatDate(combo.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-slate-600 font-helvetica">
                      {combo.body}
                    </p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-[#f8fbfa] p-3">
                        <div className="flex items-center gap-2 text-slate-400">
                          <PhilippinePeso className="h-4 w-4" />
                          <span className="text-[11px] uppercase tracking-[0.14em] font-helvetica">
                            Total Cost
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-700 font-helvetica">
                          PHP {combo.totalCost}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#f8fbfa] p-3">
                        <div className="flex items-center gap-2 text-slate-400">
                          <UtensilsCrossed className="h-4 w-4" />
                          <span className="text-[11px] uppercase tracking-[0.14em] font-helvetica">
                            Meals
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-700 font-helvetica">
                          {mealCount} selected
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#f8fbfa] p-3">
                        <div className="flex items-center gap-2 text-slate-400">
                          <CircleDollarSign className="h-4 w-4" />
                          <span className="text-[11px] uppercase tracking-[0.14em] font-helvetica">
                            Allowance
                          </span>
                        </div>
                        <p className="mt-2 text-sm capitalize text-slate-700 font-helvetica">
                          {combo.allowanceType}
                        </p>
                      </div>
                    </div>

                    {combo.tag && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs text-[#1f5c42] font-helvetica">
                          #{combo.tag}
                        </span>
                      </div>
                    )}

                    <div className="mt-5 rounded-[22px] border border-slate-200 bg-[#fbfcfc] p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-poppins text-sm font-semibold text-[#023030]">
                            Selected Meals
                          </h4>
                          <p className="mt-1 text-xs text-slate-500 font-helvetica">
                            Review the included meal entries before deciding.
                          </p>
                        </div>

                        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500 font-helvetica">
                          {mealCount} items
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        {combo.meals?.map((meal, index) => (
                          <div
                            key={meal.id || meal._id || `${comboId}-${index}`}
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate font-poppins text-sm font-semibold text-[#023030]">
                                  {meal.mealName}
                                </p>

                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 font-helvetica">
                                  {meal.establishmentName && (
                                    <span className="inline-flex items-center gap-1">
                                      <Store className="h-3.5 w-3.5" />
                                      {meal.establishmentName}
                                    </span>
                                  )}

                                  {meal.category && (
                                    <span className="inline-flex items-center gap-1">
                                      <Tag className="h-3.5 w-3.5" />
                                      {meal.category}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <span className="shrink-0 rounded-full bg-[#f5faf8] px-3 py-1 text-xs font-medium text-[#1f5c42] font-helvetica">
                                ₱{Number(meal.price ?? 0)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {combo.verificationStatus === "pending" ? (
                      <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
                        <button
                          onClick={() => handleDecision(comboId, "approve")}
                          disabled={actioningId === comboId}
                          className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#0a8f8f_0%,#046d6d_45%,#033f3f_90%,#022b2b_100%)] px-5 py-3 text-sm font-medium text-white shadow-[0_12px_26px_rgba(2,48,48,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(2,48,48,0.3)] disabled:cursor-not-allowed disabled:opacity-60 font-helvetica"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          {actioningId === comboId ? "Processing..." : "Approve Combo"}
                        </button>

                        <button
                          onClick={() => handleDecision(comboId, "reject")}
                          disabled={actioningId === comboId}
                          className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-medium text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 font-helvetica"
                        >
                          <ShieldAlert className="h-4 w-4" />
                          Reject Combo
                        </button>
                      </div>
                    ) : (
                      <div
                        className={`mt-5 rounded-2xl border px-4 py-3 text-sm font-helvetica ${
                          combo.verificationStatus === "approved"
                            ? "border-emerald-200 bg-emerald-50 text-[#1f5c42]"
                            : "border-rose-200 bg-rose-50 text-rose-600"
                        }`}
                      >
                        {combo.verificationStatus === "approved"
                          ? "This combo has already been approved and marked as verified."
                          : "This combo has been rejected and is no longer pending review."}
                      </div>
                    )}
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