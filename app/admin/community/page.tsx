"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, ShieldCheck, Clock3, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type AdminMeal = {
  id: string;
  mealName: string;
  price: number;
  establishmentName: string;
  category?: string;
  foodType?: string;
  image?: string;
};

type AdminCommunityPost = {
  id: string;
  author: string;
  handle: string;
  tag: string;
  title: string;
  body: string;
  postType: "combo";
  totalCost: number;
  allowanceType: "daily" | "weekly";
  verificationStatus: "pending" | "approved" | "rejected";
  isVerified: boolean;
  meals: AdminMeal[];
  createdAt: string;
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString();
}

export default function AdminCommunityPage() {
  const { data: session } = useSession();
  const adminUserId = session?.user?.id ?? "";

  const [posts, setPosts] = React.useState<AdminCommunityPost[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeStatus, setActiveStatus] = React.useState<
    "pending" | "approved" | "rejected"
  >("pending");
  const [processingId, setProcessingId] = React.useState<string | null>(null);

  const loadPosts = React.useCallback(async () => {
    if (!adminUserId) return;

    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.set("adminUserId", adminUserId);
      params.set("status", activeStatus);

      const res = await fetch(`/api/admin/community/posts?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load submissions");
      }

      setPosts(data.posts ?? []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load combo submissions");
    } finally {
      setLoading(false);
    }
  }, [adminUserId, activeStatus]);

  React.useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleVerify = async (
    postId: string,
    action: "approve" | "reject"
  ) => {
    if (!adminUserId) {
      toast.error("Admin session not found");
      return;
    }

    try {
      setProcessingId(postId);

      const res = await fetch(`/api/admin/community/posts/${postId}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminUserId,
          action,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      toast.success(
        action === "approve"
          ? "Combo approved successfully"
          : "Combo rejected successfully"
      );

      setPosts((prev) => prev.filter((post) => post.id !== postId));
    } catch (error) {
      console.error(error);
      toast.error("Failed to update combo status");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen px-6 py-8 text-[#1f2937] md:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium text-[#046d6d]">
                Admin · Community Verification
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-[#111827]">
                Review submitted meal combos
              </h1>
              <p className="mt-2 text-sm text-[#4b5563]">
                Approve or reject budget-friendly meal combinations submitted by users.
              </p>
            </div>

            <Button onClick={loadPosts} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { key: "pending", label: "Pending" },
            { key: "approved", label: "Approved" },
            { key: "rejected", label: "Rejected" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() =>
                setActiveStatus(tab.key as "pending" | "approved" | "rejected")
              }
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeStatus === tab.key
                  ? "bg-[#111827] text-white"
                  : "bg-white text-[#374151] hover:bg-[#f3f4f6]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-[24px] border border-black/5 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-[#374151]">
              Loading submissions...
            </p>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-[24px] border border-black/5 bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-[#111827]">
              No {activeStatus} combo submissions
            </p>
            <p className="mt-2 text-sm text-[#6b7280]">
              Submitted meal combinations will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[28px] border border-black/5 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#e0f2fe] px-3 py-1 text-xs font-semibold text-[#0f172a]">
                        {post.tag}
                      </span>

                      {post.verificationStatus === "pending" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#fff7ed] px-3 py-1 text-xs font-semibold text-[#9a3412]">
                          <Clock3 className="h-3 w-3" />
                          Pending
                        </span>
                      )}

                      {post.verificationStatus === "approved" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#dcfce7] px-3 py-1 text-xs font-semibold text-[#166534]">
                          <ShieldCheck className="h-3 w-3" />
                          Approved
                        </span>
                      )}

                      {post.verificationStatus === "rejected" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#fee2e2] px-3 py-1 text-xs font-semibold text-[#991b1b]">
                          <XCircle className="h-3 w-3" />
                          Rejected
                        </span>
                      )}
                    </div>

                    <h2 className="mt-3 text-xl font-semibold text-[#111827]">
                      {post.title}
                    </h2>

                    <p className="mt-2 text-sm text-[#374151]">
                      Submitted by <span className="font-medium">{post.author}</span> ({post.handle})
                    </p>

                    <p className="mt-1 text-xs text-[#6b7280]">
                      {formatDate(post.createdAt)}
                    </p>

                    <p className="mt-4 text-sm leading-7 text-[#374151]">
                      {post.body}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-[#f3f4f6] px-3 py-1 text-xs font-medium text-[#374151]">
                        Total: ₱{post.totalCost}
                      </span>
                      <span className="rounded-full bg-[#f3f4f6] px-3 py-1 text-xs font-medium text-[#374151]">
                        {post.allowanceType}
                      </span>
                    </div>

                    <div className="mt-4 rounded-2xl border border-black/5 bg-[#f9fafb] p-4">
                      <p className="text-sm font-semibold text-[#111827]">
                        Included meals
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {post.meals.map((meal) => (
                          <span
                            key={meal.id}
                            className="rounded-full bg-white px-3 py-1 text-xs text-[#374151] border border-black/5"
                          >
                            {meal.mealName} · ₱{meal.price} · {meal.establishmentName}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {activeStatus === "pending" && (
                    <div className="flex shrink-0 gap-2">
                      <Button
                        onClick={() => handleVerify(post.id, "approve")}
                        disabled={processingId === post.id}
                        className="bg-[#046d6d] text-white hover:bg-[#035757]"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Approve
                      </Button>

                      <Button
                        onClick={() => handleVerify(post.id, "reject")}
                        disabled={processingId === post.id}
                        variant="outline"
                        className="border-red-200 text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}