"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MessageCircle,
  Heart,
  Lightbulb,
  Users,
  Search,
  Bookmark,
  MoreHorizontal,
  Clock3,
  Sparkles,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const posts = [
  {
    id: 1,
    author: "UPLB Student",
    handle: "@budgetiska",
    time: "2h ago",
    tag: "Tipid",
    title: "Best lunch under PHP 100 near campus",
    body: "Try rice meals from nearby budget-friendly spots before 12 PM for better choices. Usually the earlier you go, the more sulit the options feel.",
    likes: 24,
    comments: 8,
    saved: 3,
  },
  {
    id: 2,
    author: "Elbi Eater",
    handle: "@snackwatch",
    time: "5h ago",
    tag: "Snacks",
    title: "My go-to snacks under PHP 50",
    body: "Banana cue, turon, and lugaw are still the safest sulit picks when money is tight. I also leave a little extra in case I want cold water or juice.",
    likes: 18,
    comments: 5,
    saved: 9,
  },
  {
    id: 3,
    author: "Budget Buddy",
    handle: "@allowancecore",
    time: "Today",
    tag: "Budgeting",
    title: "How I stretch a weekly allowance",
    body: "I set aside meal money first, then leave extra for coffee or emergency snacks. If I don’t separate it early, I end up overspending by midweek.",
    likes: 31,
    comments: 11,
    saved: 7,
  },
  {
    id: 4,
    author: "Morning Class Survivor",
    handle: "@7amwarrior",
    time: "Yesterday",
    tag: "Breakfast",
    title: "Sulit breakfast spots before 8 AM",
    body: "If you have early classes, some stalls open earlier than expected and have cheaper silog meals. It helps a lot when you don’t want to skip breakfast.",
    likes: 15,
    comments: 4,
    saved: 5,
  },
];

const trendingTopics = [
  "Meals under PHP 100",
  "Sulit snacks",
  "Weekly budgeting",
  "Breakfast picks",
];

export default function CommunityPage() {
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

  return (
    <div
      className="min-h-screen px-6 py-8 text-[#023030] md:px-10 lg:px-14"
      style={{
        background:
          "radial-gradient(circle at top right, rgba(204,255,232,0.75) 0%, rgba(204,255,232,0) 26%), radial-gradient(circle at bottom left, rgba(227,242,253,0.85) 0%, rgba(227,242,253,0) 32%), linear-gradient(180deg, #f7fbfb 0%, #eef7f7 100%)",
      }}
    >
      <div className="mx-auto max-w-6xl space-y-6">
        <Link href="/home">
          <Button
            variant="outline"
            className="rounded-xl border-white/45 bg-white/60 text-[#023030] backdrop-blur-md hover:bg-white"
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
                Student tips, food finds, and budget hacks
              </h1>

              <p className="font-helvetica mt-2 max-w-2xl text-sm font-light leading-6 text-[#023030]/70">
                A lighter, student-friendly space for sharing meal ideas, sulit
                spots, and budgeting tips around Elbi.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="rounded-xl border-white/45 bg-white/60 text-[#023030] hover:bg-white"
              >
                <Search className="mr-2 h-4 w-4" />
                Search posts
              </Button>

              <Button className="rounded-xl bg-[#023030] text-white hover:bg-[#034646]">
                <Plus className="mr-2 h-4 w-4" />
                Share a tip
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
              className="rounded-[24px] border border-white/40 bg-white/55 p-4 shadow-[0_8px_24px_rgba(2,48,48,0.06)] backdrop-blur-xl"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E3F2FD] text-sm font-semibold text-[#023030]">
                  S
                </div>

                <div className="min-w-0 flex-1">
                  <div className="rounded-2xl border border-white/40 bg-white/65 px-4 py-3 text-sm text-[#023030]/55">
                    Share a meal tip, budget hack, or your current sulit find...
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {["Tipid", "Snacks", "Budgeting", "Breakfast"].map(
                      (chip) => (
                        <button
                          key={chip}
                          className="rounded-full border border-white/40 bg-white/50 px-3 py-1.5 text-xs text-[#023030]/80 transition hover:bg-white/70"
                        >
                          #{chip}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {posts.map((post) => (
              <motion.article
                key={post.id}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                whileHover={{ y: -2 }}
                transition={{ duration: 0.18 }}
                className="rounded-[26px] border border-white/40 bg-white/58 p-5 shadow-[0_10px_28px_rgba(2,48,48,0.07)] backdrop-blur-xl"
              >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#E3F2FD,#ccffe8)] text-sm font-semibold text-[#023030]">
                        {post.author.charAt(0)}
                        </div>

                        <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <p className="font-poppins text-sm font-semibold text-[#023030]">
                            {post.author}
                            </p>
                            <p className="text-xs text-[#023030]/45">
                            {post.handle}
                            </p>
                            {/* <span className="text-xs text-[#023030]/35">•</span> */}
                            {/* <div className="inline-flex items-center gap-1 text-xs text-[#023030]/50">
                            <Clock3 className="h-3 w-3" />
                            {post.time}
                            </div> */}
                        </div>

                        <div className="inline-flex items-center gap-1 text-xs text-[#023030]/50">
                          <Clock3 className="h-3 w-3" />
                          {post.time}
                        </div>

                        </div>
                    </div>

                    <div className="flex items-start gap-2">
                        <span className="rounded-full bg-[#E3F2FD] px-3 py-1 text-[11px] font-semibold text-[#023030]">
                        {post.tag}
                        </span>

                        <button className="rounded-full p-2 text-[#023030]/55 transition hover:bg-white/70 hover:text-[#023030]">
                        <MoreHorizontal className="h-4 w-4" />
                        </button>
                    </div>
                    </div>
                <div className="mt-4">
                  <h2 className="font-poppins text-lg font-semibold leading-6 text-[#023030]">
                    {post.title}
                  </h2>
                  <p className="font-helvetica mt-3 text-sm font-light leading-7 text-[#023030]/72">
                    {post.body}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <button className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/55 px-3 py-2 text-xs text-[#023030]/80 transition hover:bg-white">
                    <Heart className="h-3.5 w-3.5 text-[#026d6d]" />
                    {post.likes} likes
                  </button>

                  <button className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/55 px-3 py-2 text-xs text-[#023030]/80 transition hover:bg-white">
                    <MessageCircle className="h-3.5 w-3.5 text-[#026d6d]" />
                    {post.comments} replies
                  </button>

                  <button className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/55 px-3 py-2 text-xs text-[#023030]/80 transition hover:bg-white">
                    <Bookmark className="h-3.5 w-3.5 text-[#026d6d]" />
                    {post.saved} saves
                  </button>
                </div>
              </motion.article>
            ))}
          </div>

          <div className="space-y-4">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="rounded-[26px] border border-white/40 bg-white/55 p-5 shadow-[0_10px_28px_rgba(2,48,48,0.07)] backdrop-blur-xl"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/50 px-3 py-1.5 text-xs font-medium text-[#025a5a]">
                <Sparkles className="h-3.5 w-3.5" />
                Trending
              </div>

              <h3 className="font-poppins mt-4 text-lg font-semibold text-[#023030]">
                What students are talking about
              </h3>

              <div className="mt-4 space-y-3">
                {trendingTopics.map((topic, i) => (
                  <div
                    key={topic}
                    className="rounded-2xl border border-white/35 bg-white/58 px-4 py-3"
                  >
                    <p className="font-helvetica text-[11px] uppercase tracking-wide text-[#023030]/45">
                      Topic {i + 1}
                    </p>
                    <p className="font-poppins mt-1 text-sm font-semibold text-[#023030]">
                      {topic}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="rounded-[26px] border border-white/40 bg-[linear-gradient(135deg,rgba(255,255,255,0.60),rgba(227,242,253,0.34),rgba(204,255,232,0.16))] p-5 shadow-[0_10px_28px_rgba(2,48,48,0.07)] backdrop-blur-xl"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/55 px-3 py-1.5 text-xs font-medium text-[#025a5a]">
                <Lightbulb className="h-3.5 w-3.5" />
                Community vibe
              </div>

              <h3 className="font-poppins mt-4 text-lg font-semibold text-[#023030]">
                Keep it helpful and easy to skim
              </h3>

              <p className="font-helvetica mt-2 text-sm font-light leading-6 text-[#023030]/70">
                The best posts here are short, practical, and feel like advice
                you’d actually send a friend before lunch break.
              </p>

              <div className="mt-5 space-y-2">
                {[
                  "Share where to eat",
                  "Drop budget hacks",
                  "Recommend sulit meals",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-white/35 bg-white/55 px-4 py-3 text-sm text-[#023030]/80"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}