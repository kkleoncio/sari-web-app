"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  UserRound,
  XCircle,
} from "lucide-react";

type ComboMeal = {
  id?: string;
  mealName: string;
  price: number;
  establishmentName?: string;
  category?: string;
};

type PostType = "combo" | "tip";
type FilterKey = "all" | "pending" | "approved" | "rejected";

type Post = {
  id: string;
  author?: string;
  tag?: string;
  title: string;
  body: string;
  postType: PostType;
  totalCost?: number;
  allowanceType?: "daily" | "weekly";
  verificationStatus: "pending" | "approved" | "rejected" | "none";
  isVerified: boolean;
  meals?: ComboMeal[];
  createdAt: string;
};

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

export default function AdminContentPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const [contentType, setContentType] = useState<PostType>("combo");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("pending");
  const [actioningId, setActioningId] = useState<string | null>(null);

  async function fetchPosts() {
    try {
      setLoading(true);

      const res = await fetch("/api/community/posts?view=all", {
        cache: "no-store",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setPosts(Array.isArray(data.posts) ? data.posts : []);
    } catch (err) {
      console.error(err);
      alert("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    return posts
      .filter((p) => p.postType === contentType)
      .filter((p) =>
        activeFilter === "all" ? true : p.verificationStatus === activeFilter
      );
  }, [posts, contentType, activeFilter]);

  const counts = useMemo(() => {
    const scoped = posts.filter((p) => p.postType === contentType);

    return {
      total: scoped.length,
      pending: scoped.filter((p) => p.verificationStatus === "pending").length,
      approved: scoped.filter((p) => p.verificationStatus === "approved").length,
      rejected: scoped.filter((p) => p.verificationStatus === "rejected").length,
    };
  }, [posts, contentType]);

  async function handleDecision(post: Post, action: "approve" | "reject") {
    try {
      setActioningId(post.id);

      const endpoint =
        post.postType === "combo"
          ? `/api/admin/combos/${post.id}/${action}`
          : `/api/admin/tips/${post.id}/${action}`;

      const res = await fetch(endpoint, { method: "POST" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? {
                ...p,
                verificationStatus:
                  action === "approve" ? "approved" : "rejected",
                isVerified: action === "approve",
              }
            : p
        )
      );
    } catch (err) {
      console.error(err);
      alert(`Failed to ${action}`);
    } finally {
      setActioningId(null);
    }
  }

  function StatusBadge({ status }: { status: Post["verificationStatus"] }) {
    const map = {
      approved: {
        icon: CheckCircle2,
        class: "bg-emerald-50 text-[#1f5c42]",
      },
      rejected: {
        icon: XCircle,
        class: "bg-rose-50 text-rose-600",
      },
      pending: {
        icon: Clock3,
        class: "bg-amber-50 text-amber-700",
      },
      none: {
        icon: Clock3,
        class: "bg-slate-100 text-slate-400",
      },
    };

    const s = map[status];
    const Icon = s.icon;

    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] ${s.class}`}>
        <Icon className="h-3.5 w-3.5" />
        {status}
      </span>
    );
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <section className="relative overflow-hidden rounded-[28px] border border-white/60 bg-[linear-gradient(135deg,rgba(10,143,143,0.08),rgba(255,255,255,0.94),rgba(31,92,66,0.08))] p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
        <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-emerald-100/50 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-24 w-24 rounded-full bg-teal-100/40 blur-2xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-white/80 px-3 py-1.5 text-xs text-[#1f5c42] shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Verification Dashboard
            </div>

            <h1 className="mt-4 font-poppins text-3xl font-semibold tracking-[-0.03em] text-[#023030]">
              Content Review
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 font-helvetica">
              Moderate meal combos and community tips.
            </p>

            {/* TABS */}
            <div className="mt-5 flex gap-2 font-helvetica">
              {(["combo", "tip"] as PostType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setContentType(t);
                    setActiveFilter("pending");
                  }}
                  className={`rounded-full px-4 py-2 text-sm ${
                    contentType === t
                      ? "bg-[#023030] text-white"
                      : "border bg-white text-slate-600"
                  }`}
                >
                  {t === "combo" ? "Meal Combos" : "Tips"}
                </button>
              ))}
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Total" value={counts.total} />
            <Stat label="Pending" value={counts.pending} highlight="text-amber-600" />
            <Stat label="Approved" value={counts.approved} highlight="text-[#1f5c42]" />
            <Stat label="Rejected" value={counts.rejected} highlight="text-rose-600" />
          </div>
        </div>
      </section>

      {/* CONTENT SECTION */}
      <section className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">

        {/* HEADER */}
        <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#023030] font-poppins">
              Review Queue
            </h2>
            <p className="text-sm text-slate-500 font-helvetica">
              Filter and review submissions.
            </p>
          </div>

          <button
            onClick={fetchPosts}
            className="flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* FILTERS */}
        <div className="mt-5 flex flex-wrap gap-2 font-helvetica">
          {(["all", "pending", "approved", "rejected"] as FilterKey[]).map((f) => {
            const active = activeFilter === f;
            return (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`rounded-full px-4 py-2 text-sm ${
                  active
                    ? "bg-[#023030] text-white"
                    : "border bg-white text-slate-600"
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>

        {/* LIST */}
        <div className="mt-6">
          {loading ? (
            <div className="text-center py-10 text-slate-500">
              Loading posts...
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              No posts found.
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="group rounded-[24px] border bg-white p-5 shadow-sm hover:-translate-y-1 hover:shadow-md transition"
                >
                  <div className="flex justify-between">
                    <h3 className="text-lg font-semibold text-[#023030]">
                      {post.title}
                    </h3>
                    <StatusBadge status={post.verificationStatus} />
                  </div>

                  <div className="mt-2 text-sm text-slate-500 flex gap-3">
                    <span className="flex items-center gap-1">
                      <UserRound className="h-4 w-4" />
                      {post.author || "Unknown"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock3 className="h-4 w-4" />
                      {formatDate(post.createdAt)}
                    </span>
                  </div>

                  <p className="mt-4 text-sm text-slate-600">
                    {post.body}
                  </p>

                  {post.postType === "combo" && (
                    <div className="mt-4 text-xs text-slate-500">
                      🍽 {post.meals?.length ?? 0} meals · ₱{post.totalCost}
                    </div>
                  )}

                  {post.tag && (
                    <span className="mt-3 inline-block text-xs bg-emerald-50 px-3 py-1 rounded-full">
                      #{post.tag}
                    </span>
                  )}

                  {post.verificationStatus === "pending" && (
                    <div className="mt-5 flex gap-3">
                      <button
                        onClick={() => handleDecision(post, "approve")}
                        className="bg-[#023030] text-white px-4 py-2 rounded-xl"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => handleDecision(post, "reject")}
                        className="border border-rose-300 text-rose-600 px-4 py-2 rounded-xl"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: string;
}) {
  return (
    <div className="rounded-2xl border bg-white px-4 py-3 shadow-sm">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`font-semibold ${highlight || "text-[#023030]"}`}>
        {value}
      </p>
    </div>
  );
}