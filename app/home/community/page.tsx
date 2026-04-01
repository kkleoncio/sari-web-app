"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Users,
  Search,
  Bookmark,
  MoreHorizontal,
  Clock3,
  Sparkles,
  Plus,
  X,
  RefreshCw,
  NotebookPen,
  CheckCircle2,
  ShieldCheck,
  UtensilsCrossed,
  PhilippinePeso,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type CommunityMeal = {
  id: string;
  mealName: string;
  price: number;
  establishmentName: string;
  category?: string;
  foodType?: string;
  image?: string;
};

type CommunityPost = {
  id: string;
  author: string;
  handle: string;
  tag: string;
  title: string;
  body: string;
  postType: "tip" | "combo";
  totalCost: number;
  allowanceType: "daily" | "weekly";
  verificationStatus: "none" | "pending" | "approved" | "rejected";
  isVerified: boolean;
  meals: CommunityMeal[];
  likes: number;
  comments: number;
  saved: number;
  likedByMe: boolean;
  savedByMe: boolean;
  isMine: boolean;
  createdAt: string;
  commentsList: {
    id: string;
    author: string;
    handle: string;
    body: string;
    createdAt: string;
  }[];
};

type MealOption = {
  _id: string;
  mealName: string;
  price: number;
  establishmentName?: string;
};

const availableTags = [
  "All",
  "Tipid",
  "Snacks",
  "Budgeting",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Sulit Combo",
];

function formatRelativeTime(dateString: string) {
  const timestamp = new Date(dateString).getTime();
  const diff = Date.now() - timestamp;

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "Just now";
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < 2 * day) return "Yesterday";
  return `${Math.floor(diff / day)}d ago`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function CommunityPage() {
  const [posts, setPosts] = React.useState<CommunityPost[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedTag, setSelectedTag] = React.useState("All");

  const [showComposer, setShowComposer] = React.useState(false);
  const [newPostTitle, setNewPostTitle] = React.useState("");
  const [newPostBody, setNewPostBody] = React.useState("");
  const [newPostTag, setNewPostTag] = React.useState("Tipid");
  const [newPostType, setNewPostType] = React.useState<"tip" | "combo">("tip");
  const [newAllowanceType, setNewAllowanceType] = React.useState<
    "daily" | "weekly"
  >("daily");
  const [selectedMealIds, setSelectedMealIds] = React.useState<string[]>([]);
  const [posting, setPosting] = React.useState(false);

  const [meals, setMeals] = React.useState<MealOption[]>([]);
  const [loadingMeals, setLoadingMeals] = React.useState(false);

  const [activeView, setActiveView] = React.useState<
    "all" | "verified" | "mine" | "saved"
  >("all");

  const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  const { data: session, status } = useSession();
  const userId = session?.user?.id ?? "";

  const loadPosts = React.useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (userId) params.set("userId", userId);
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      if (selectedTag !== "All") params.set("tag", selectedTag);
      params.set("view", activeView);

      const res = await fetch(`/api/community/posts?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load posts");
      }

      setPosts(data.posts ?? []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load community posts");
    } finally {
      setLoading(false);
    }
  }, [userId, searchQuery, selectedTag, activeView]);

  const loadMeals = React.useCallback(async () => {
    try {
      setLoadingMeals(true);

      const res = await fetch("/api/meals");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load meals");
      }

      const list = Array.isArray(data.meals) ? data.meals : [];
      setMeals(list);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load meals for combo selection");
    } finally {
      setLoadingMeals(false);
    }
  }, []);

  React.useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  React.useEffect(() => {
    if (showComposer && newPostType === "combo" && meals.length === 0) {
      loadMeals();
    }
  }, [showComposer, newPostType, meals.length, loadMeals]);

  const trendingTopics = React.useMemo(() => {
    const counts = posts.reduce<Record<string, number>>((acc, post) => {
      acc[post.tag] = (acc[post.tag] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }))
      .slice(0, 4);
  }, [posts]);

  const selectedMeals = React.useMemo(
    () => meals.filter((meal) => selectedMealIds.includes(String(meal._id))),
    [meals, selectedMealIds]
  );

  const selectedTotal = React.useMemo(
    () =>
      selectedMeals.reduce(
        (sum, meal) => sum + Number(meal.price ?? 0),
        0
      ),
    [selectedMeals]
  );

  const savedCount = React.useMemo(
    () => posts.reduce((sum, post) => sum + post.saved, 0),
    [posts]
  );

  const mineCount = React.useMemo(
    () => posts.filter((post) => post.isMine).length,
    [posts]
  );

  const verifiedCount = React.useMemo(
    () => posts.filter((post) => post.isVerified).length,
    [posts]
  );

  const resetComposer = () => {
    setNewPostTitle("");
    setNewPostBody("");
    setNewPostTag("Tipid");
    setNewPostType("tip");
    setNewAllowanceType("daily");
    setSelectedMealIds([]);
    setShowComposer(false);
  };

  const toggleMealSelection = (mealId: string) => {
    setSelectedMealIds((prev) =>
      prev.includes(mealId)
        ? prev.filter((id) => id !== mealId)
        : [...prev, mealId]
    );
  };

  const handleCreatePost = async () => {
    if (!userId) {
      toast.error("Please login first");
      return;
    }

    const trimmedTitle = newPostTitle.trim();
    const trimmedBody = newPostBody.trim();

    if (!trimmedTitle || !trimmedBody) {
      toast.error("Please complete the title and post body");
      return;
    }

    if (newPostType === "combo" && selectedMealIds.length === 0) {
      toast.error("Please select at least one meal for your combo");
      return;
    }

    try {
      setPosting(true);

      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          tag: newPostTag,
          title: trimmedTitle,
          body: trimmedBody,
          postType: newPostType,
          mealIds: selectedMealIds,
          allowanceType: newAllowanceType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create post");
      }

      setPosts((prev) => [data.post, ...prev]);
      resetComposer();

      toast.success(
        newPostType === "combo"
          ? "Meal combo submitted for verification"
          : "Post shared",
        {
          icon: <CheckCircle2 className="text-[#046d6d]" />,
        }
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to create post");
    } finally {
      setPosting(false);
    }
  };

  const toggleSave = async (postId: string) => {
    if (!userId) {
      toast.error("Please login first");
      return;
    }

    const previousPosts = posts;

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              savedByMe: !post.savedByMe,
              saved: post.savedByMe ? post.saved - 1 : post.saved + 1,
            }
          : post
      )
    );

    try {
      const res = await fetch(`/api/community/posts/${postId}/save`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update save");
      }

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                savedByMe: data.savedByMe,
                saved: data.saved,
              }
            : post
        )
      );
    } catch (error) {
      console.error(error);
      setPosts(previousPosts);
      toast.error("Failed to update save");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen px-6 py-8 text-[#023030] md:px-10 lg:px-14">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[28px] border border-white/40 bg-white/58 p-6 shadow-[0_10px_28px_rgba(2,48,48,0.06)] backdrop-blur-xl">
            <p className="font-poppins text-sm font-medium text-[#023030]">
              Loading community...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen px-6 py-8 text-[#023030] md:px-10 lg:px-14"
      style={{
        background:
          "radial-gradient(circle at top right, rgba(204,255,232,0.76) 0%, rgba(204,255,232,0) 24%), radial-gradient(circle at bottom left, rgba(227,242,253,0.88) 0%, rgba(227,242,253,0) 30%), linear-gradient(180deg, #f7fbfb 0%, #eef7f7 100%)",
      }}
    >
      <div className="mx-auto max-w-6xl space-y-6">
        <Link href="/home">
          <Button
            variant="outline"
            className="rounded-xl border-white/45 bg-white/65 text-[#023030] backdrop-blur-md hover:bg-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Button>
        </Link>

        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-5 relative overflow-hidden rounded-[30px] border border-white/40 bg-[linear-gradient(135deg,rgba(255,255,255,0.62),rgba(227,242,253,0.34),rgba(204,255,232,0.20))] p-6 shadow-[0_14px_36px_rgba(2,48,48,0.08)] backdrop-blur-xl"
        >
          <div className="pointer-events-none absolute -right-10 top-0 h-32 w-32 rounded-full bg-[#ccffe8]/35 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-28 w-28 rounded-full bg-[#E3F2FD]/55 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/50 px-3 py-1.5 text-xs font-medium text-[#025a5a]">
                <Users className="h-3.5 w-3.5" />
                Community feed
              </div>

              <h1 className="font-poppins mt-4 text-3xl font-semibold tracking-tight text-[#023030] md:text-[36px]">
                Student tips, food finds, and verified meal combos
              </h1>

              <p className="font-helvetica mt-2 max-w-2xl text-sm font-light leading-6 text-[#023030]/70">
                Share practical tips or submit budget-friendly meal combinations
                for admin verification and community use.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={loadPosts}
                className="rounded-xl border-white/45 bg-white/60 text-[#023030] hover:bg-white"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh posts
              </Button>

              <Button
                onClick={() => setShowComposer(true)}
                className="rounded-xl bg-[#023030] text-white hover:bg-[#034646]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Share with community
              </Button>
            </div>
          </div>
        </motion.section>

        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="rounded-[28px] border border-white/40 bg-white/58 p-4 shadow-[0_10px_28px_rgba(2,48,48,0.06)] backdrop-blur-xl"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#E3F2FD,#ccffe8)] text-sm font-semibold text-[#023030]">
                  <NotebookPen className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <button
                    onClick={() => setShowComposer(true)}
                    className="w-full rounded-2xl border border-white/40 bg-white/68 px-4 py-3 text-left text-sm text-[#023030]/52 transition hover:bg-white"
                  >
                    Share a meal tip or submit a verified budget combo...
                  </button>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {availableTags.map((chip) => (
                      <button
                        key={chip}
                        onClick={() => setSelectedTag(chip)}
                        className={`rounded-full border px-3 py-1.5 text-xs transition ${
                          selectedTag === chip
                            ? "border-[#023030] bg-[#023030] text-white"
                            : "border-white/40 bg-white/58 text-[#023030]/80 hover:bg-white"
                        }`}
                      >
                        {chip === "All" ? chip : `#${chip}`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {showComposer && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mt-4 rounded-[24px] border border-white/40 bg-[linear-gradient(135deg,rgba(255,255,255,0.84),rgba(227,242,253,0.32),rgba(204,255,232,0.16))] p-4"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="font-poppins text-sm font-semibold text-[#023030]">
                          Create a community entry
                        </p>
                        <p className="mt-1 text-xs text-[#023030]/55">
                          Tips are posted immediately. Meal combos go through admin
                          verification first.
                        </p>
                      </div>

                      <button
                        onClick={resetComposer}
                        className="rounded-full p-2 text-[#023030]/55 transition hover:bg-white/80 hover:text-[#023030]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {[
                          { value: "tip", label: "Tip Post" },
                          { value: "combo", label: "Meal Combo" },
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              setNewPostType(option.value as "tip" | "combo")
                            }
                            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                              newPostType === option.value
                                ? "bg-[#023030] text-white"
                                : "bg-white/72 text-[#023030]/75 hover:bg-white"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>

                      <input
                        value={newPostTitle}
                        onChange={(e) => setNewPostTitle(e.target.value)}
                        placeholder={
                          newPostType === "combo"
                            ? "Combo title"
                            : "Post title"
                        }
                        className="w-full rounded-xl border border-white/40 bg-white/72 px-4 py-3 text-sm outline-none placeholder:text-[#023030]/35"
                      />

                      <textarea
                        value={newPostBody}
                        onChange={(e) => setNewPostBody(e.target.value)}
                        placeholder={
                          newPostType === "combo"
                            ? "Why is this combo sulit or useful for students?"
                            : "Share your recommendation, food find, or budget tip..."
                        }
                        rows={5}
                        className="w-full resize-none rounded-xl border border-white/40 bg-white/72 px-4 py-3 text-sm outline-none placeholder:text-[#023030]/35"
                      />

                      {newPostType === "combo" && (
                        <div className="space-y-3 rounded-2xl border border-white/40 bg-white/60 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="font-poppins text-sm font-semibold text-[#023030]">
                                Select meals for your combo
                              </p>
                              <p className="text-xs text-[#023030]/55">
                                Total is computed automatically from saved meal prices.
                              </p>
                            </div>

                            <select
                              value={newAllowanceType}
                              onChange={(e) =>
                                setNewAllowanceType(
                                  e.target.value as "daily" | "weekly"
                                )
                              }
                              className="rounded-xl border border-white/40 bg-white/72 px-4 py-2 text-sm outline-none"
                            >
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                            </select>
                          </div>

                          <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                            {loadingMeals ? (
                              <p className="text-sm text-[#023030]/60">
                                Loading meals...
                              </p>
                            ) : meals.length === 0 ? (
                              <p className="text-sm text-[#023030]/60">
                                No meals found.
                              </p>
                            ) : (
                              meals.map((meal) => {
                                const isSelected = selectedMealIds.includes(
                                  String(meal._id)
                                );

                                return (
                                  <button
                                    key={meal._id}
                                    type="button"
                                    onClick={() =>
                                      toggleMealSelection(String(meal._id))
                                    }
                                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left transition ${
                                      isSelected
                                        ? "border-[#026d6d] bg-[#edf7f7]"
                                        : "border-white/40 bg-white/72 hover:bg-white"
                                    }`}
                                  >
                                    <div className="min-w-0">
                                      <p className="font-medium text-[#023030]">
                                        {meal.mealName}
                                      </p>
                                      <p className="truncate text-xs text-[#023030]/55">
                                        {meal.establishmentName || "Unknown establishment"}
                                      </p>
                                    </div>

                                    <span className="ml-3 shrink-0 text-sm font-semibold text-[#023030]">
                                      ₱{Number(meal.price ?? 0)}
                                    </span>
                                  </button>
                                );
                              })
                            )}
                          </div>

                          {selectedMeals.length > 0 && (
                            <div className="rounded-2xl border border-white/35 bg-[#f8fbfb] p-3">
                              <div className="flex items-center justify-between gap-3">
                                <p className="font-poppins text-sm font-semibold text-[#023030]">
                                  Selected combo
                                </p>
                                <p className="font-poppins text-sm font-semibold text-[#026d6d]">
                                  ₱{selectedTotal}
                                </p>
                              </div>

                              <div className="mt-2 flex flex-wrap gap-2">
                                {selectedMeals.map((meal) => (
                                  <span
                                    key={meal._id}
                                    className="rounded-full border border-white/40 bg-white/85 px-3 py-1 text-xs text-[#023030]/80"
                                  >
                                    {meal.mealName}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <select
                          value={newPostTag}
                          onChange={(e) => setNewPostTag(e.target.value)}
                          className="rounded-xl border border-white/40 bg-white/72 px-4 py-3 text-sm outline-none"
                        >
                          {availableTags
                            .filter((tag) => tag !== "All")
                            .map((tag) => (
                              <option key={tag} value={tag}>
                                {tag}
                              </option>
                            ))}
                        </select>

                        <Button
                          onClick={handleCreatePost}
                          disabled={posting}
                          className="rounded-xl bg-[#023030] text-white hover:bg-[#034646]"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          {posting
                            ? "Submitting..."
                            : newPostType === "combo"
                            ? "Submit combo"
                            : "Post now"}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="rounded-[28px] border border-white/40 bg-white/58 p-4 shadow-[0_10px_28px_rgba(2,48,48,0.06)] backdrop-blur-xl"
            >
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#023030]/45" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, author, tag, or keyword..."
                    className="w-full rounded-xl border border-white/40 bg-white/72 py-3 pl-10 pr-4 text-sm outline-none placeholder:text-[#023030]/35"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "all", label: "All Posts" },
                    { key: "verified", label: "Verified Combos" },
                    { key: "mine", label: "My Posts" },
                    { key: "saved", label: "Saved" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() =>
                        setActiveView(
                          tab.key as "all" | "verified" | "mine" | "saved"
                        )
                      }
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        activeView === tab.key
                          ? "bg-[#023030] text-white"
                          : "bg-white/72 text-[#023030]/75 hover:bg-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {loading ? (
              <div className="rounded-[28px] border border-white/40 bg-white/58 p-6 shadow-[0_10px_28px_rgba(2,48,48,0.07)] backdrop-blur-xl">
                <p className="font-poppins text-sm font-medium text-[#023030]">
                  Loading community posts...
                </p>
              </div>
            ) : posts.length === 0 ? (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="rounded-[28px] border border-white/40 bg-white/60 p-8 text-center shadow-[0_10px_28px_rgba(2,48,48,0.07)] backdrop-blur-xl"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#E3F2FD,#ccffe8)] text-[#023030]">
                  <Sparkles className="h-6 w-6" />
                </div>

                <p className="font-poppins mt-4 text-lg font-semibold text-[#023030]">
                  {activeView === "mine"
                    ? "No posts from you yet"
                    : activeView === "saved"
                    ? "No saved posts yet"
                    : activeView === "verified"
                    ? "No verified combos yet"
                    : "No posts yet"}
                </p>

                <p className="mt-2 text-sm leading-6 text-[#023030]/65">
                  {activeView === "mine"
                    ? "Share your first meal tip or submit your first combo."
                    : activeView === "saved"
                    ? "Posts you save will appear here."
                    : activeView === "verified"
                    ? "Approved meal combinations will appear here."
                    : "Be the first to share a tip with the SARI community."}
                </p>
              </motion.div>
            ) : (
              posts.map((post) => (
                <motion.article
                  key={post.id}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.18 }}
                  className="group rounded-[30px] border border-white/42 bg-[linear-gradient(135deg,rgba(255,255,255,0.72),rgba(227,242,253,0.22),rgba(204,255,232,0.12))] p-5 shadow-[0_12px_30px_rgba(2,48,48,0.06)] backdrop-blur-xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#E3F2FD,#ccffe8)] text-sm font-semibold text-[#023030] shadow-[0_8px_20px_rgba(2,48,48,0.05)]">
                        {getInitials(post.author)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <p className="font-poppins text-sm font-semibold text-[#023030]">
                            {post.author}
                          </p>
                          <p className="text-xs text-[#023030]/45">
                            {post.handle}
                          </p>
                        </div>

                        <div className="mt-1 inline-flex items-center gap-1 text-xs text-[#023030]/48">
                          <Clock3 className="h-3 w-3" />
                          {formatRelativeTime(post.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-start justify-end gap-2">
                      <span className="rounded-full bg-[#E3F2FD] px-3 py-1 text-[11px] font-semibold text-[#023030]">
                        {post.tag}
                      </span>

                      {post.postType === "combo" && (
                        <span className="rounded-full bg-[#fff3cd] px-3 py-1 text-[11px] font-semibold text-[#5f4b00]">
                          Meal Combo
                        </span>
                      )}

                      {post.isVerified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#ccffe8] px-3 py-1 text-[11px] font-semibold text-[#023030]">
                          <ShieldCheck className="h-3 w-3" />
                          Verified
                        </span>
                      )}

                      {!post.isVerified &&
                        post.postType === "combo" &&
                        post.verificationStatus === "pending" && (
                          <span className="rounded-full bg-[#fff6e5] px-3 py-1 text-[11px] font-semibold text-[#7a5a00]">
                            Pending Review
                          </span>
                        )}


                      {post.isMine && (
                        <span className="rounded-full bg-[#edf7f7] px-3 py-1 text-[11px] font-semibold text-[#023030]">
                          Your post
                        </span>
                      )}

                      <button className="rounded-full p-2 text-[#023030]/45 transition hover:bg-white/70 hover:text-[#023030]">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-5">
                    <h2 className="font-poppins text-[18px] font-semibold leading-7 text-[#023030]">
                      {post.title}
                    </h2>
                    <p className="font-helvetica mt-3 text-sm font-light leading-7 text-[#023030]/72">
                      {post.body}
                    </p>
                  </div>

                  {post.postType === "combo" && post.meals?.length > 0 && (
                    <div className="mt-4 rounded-[22px] border border-white/35 bg-white/55 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#023030]">
                          <UtensilsCrossed className="h-4 w-4" />
                          Included meals
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-full bg-[#edf7f7] px-3 py-1.5 text-xs font-semibold text-[#026d6d]">
                          ₱{post.totalCost} total · {post.allowanceType}
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {post.meals.map((meal) => (
                          <span
                            key={meal.id}
                            className="rounded-full border border-white/40 bg-white/85 px-3 py-1 text-xs text-[#023030]/82"
                          >
                            {meal.mealName} · ₱{meal.price}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/35 pt-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {post.postType === "combo" ? (
                        <>
                          <div className="rounded-full bg-white/65 px-3 py-1.5 text-[11px] text-[#023030]/58">
                            Budget-friendly combo
                          </div>
                          <div className="rounded-full bg-white/65 px-3 py-1.5 text-[11px] text-[#023030]/58">
                            Community submission
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="rounded-full bg-white/65 px-3 py-1.5 text-[11px] text-[#023030]/58">
                            Helpful tip
                          </div>
                          <div className="rounded-full bg-white/65 px-3 py-1.5 text-[11px] text-[#023030]/58">
                            Easy to skim
                          </div>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => toggleSave(post.id)}
                      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium transition ${
                        post.savedByMe
                          ? "border-[#023030]/15 bg-[#edf7f7] text-[#023030]"
                          : "border-white/45 bg-white/70 text-[#023030]/80 hover:bg-white"
                      }`}
                    >
                      <Bookmark
                        className={`h-3.5 w-3.5 ${
                          post.savedByMe
                            ? "fill-[#026d6d] text-[#026d6d]"
                            : "text-[#026d6d]"
                        }`}
                      />
                      {post.savedByMe ? "Saved" : "Save post"}
                    </button>
                  </div>
                </motion.article>
              ))
            )}
          </div>

          <div className="space-y-4">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="rounded-[28px] border border-white/40 bg-white/58 p-5 shadow-[0_10px_28px_rgba(2,48,48,0.07)] backdrop-blur-xl"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/55 px-3 py-1.5 text-xs font-medium text-[#025a5a]">
                <Sparkles className="h-3.5 w-3.5" />
                Trending
              </div>

              <h3 className="font-poppins mt-4 text-lg font-semibold text-[#023030]">
                What students are talking about
              </h3>

              <div className="mt-4 space-y-3">
                {trendingTopics.length === 0 ? (
                  <div className="rounded-2xl border border-white/35 bg-white/60 px-4 py-3 text-sm text-[#023030]/65">
                    No topics yet.
                  </div>
                ) : (
                  trendingTopics.map((topic) => (
                    <button
                      key={topic.tag}
                      onClick={() => setSelectedTag(topic.tag)}
                      className="block w-full rounded-2xl border border-white/35 bg-white/62 px-4 py-3 text-left transition hover:bg-white"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-[#023030]">
                          #{topic.tag}
                        </span>
                        <span className="text-xs text-[#023030]/55">
                          {topic.count} post{topic.count > 1 ? "s" : ""}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="rounded-[28px] border border-white/40 bg-white/58 p-5 shadow-[0_10px_28px_rgba(2,48,48,0.07)] backdrop-blur-xl"
            >
              <p className="font-poppins text-base font-semibold text-[#023030]">
                Community quick stats
              </p>

              <div className="mt-4 grid grid-cols-1 gap-3">
                <div className="rounded-2xl border border-white/35 bg-white/62 px-4 py-3">
                  <p className="text-xs text-[#023030]/55">Your posts loaded</p>
                  <p className="font-poppins mt-1 text-xl font-semibold text-[#023030]">
                    {mineCount}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/35 bg-white/62 px-4 py-3">
                  <p className="text-xs text-[#023030]/55">Saved post count</p>
                  <p className="font-poppins mt-1 text-xl font-semibold text-[#023030]">
                    {savedCount}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/35 bg-white/62 px-4 py-3">
                  <p className="text-xs text-[#023030]/55">Verified combos shown</p>
                  <p className="font-poppins mt-1 text-xl font-semibold text-[#023030]">
                    {verifiedCount}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}