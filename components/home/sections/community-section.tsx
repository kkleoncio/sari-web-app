"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Flame, MessageCircle, ThumbsUp, UtensilsCrossed } from "lucide-react";
import type { CommunityPost } from "@/app/home/types";

type FadeUpType = {
  hidden: { opacity: number; y: number };
  show: {
    opacity: number;
    y: number;
    transition: {
      duration: number;
      ease: readonly [number, number, number, number];
    };
  };
};

type StaggerType = {
  hidden: Record<string, never>;
  show: {
    transition: {
      staggerChildren: number;
    };
  };
};

type CommunitySectionProps = {
  innerRef?: React.RefObject<HTMLElement | null>;
  fadeUp: FadeUpType;
  stagger: StaggerType;
  glassCard: string;
  glassCardSoft: string;
};

const communityPosts: CommunityPost[] = [
  {
    id: "c1",
    name: "Aly",
    badge: "Budget Saver",
    time: "12 mins ago",
    establishment: "Aling Baby’s",
    content:
      "Try one full meal plus a light merienda. It helps stretch your budget without feeling bitin.",
    likes: 18,
    comments: 4,
    tags: ["Sulit", "Daily budget"],
  },
  {
    id: "c2",
    name: "Marco",
    badge: "Food Explorer",
    time: "1 hr ago",
    establishment: "Eatside",
    content:
      "If you only have around PHP 150, rice meal + shared drink is still a solid combo near campus.",
    likes: 26,
    comments: 7,
    tags: ["Tip", "Under 150"],
  },
  {
    id: "c3",
    name: "Jia",
    badge: "Elbi Local",
    time: "3 hrs ago",
    establishment: "Seoul Kitchen",
    content:
      "Would love a way to filter healthier meals that still fit a tight allowance.",
    likes: 31,
    comments: 9,
    tags: ["Healthy", "Feature idea"],
  },
];

export function CommunitySection({
  innerRef,
  fadeUp,
  stagger,
  glassCard,
  glassCardSoft,
}: CommunitySectionProps) {
  return (
    <section ref={innerRef} className="scroll-mt-8 space-y-4">
      <motion.div
        className="rounded-[28px] border border-white/40 bg-white/50 p-5 shadow-[0_10px_30px_rgba(2,48,48,0.08)] backdrop-blur-xl md:p-6"
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/45 px-3 py-1.5 text-xs font-medium text-[#025a5a] backdrop-blur-md">
              <UtensilsCrossed className="h-3.5 w-3.5" />
              What students are sharing
            </div>

            <h2 className="font-poppins mt-3 text-xl font-semibold text-[#023030] md:text-2xl">
              Student tips
            </h2>
            <p className="font-helvetica mt-1 text-sm font-light text-[#023030]/68">
              Quick food hacks, meal ideas, and budget-friendly thoughts from other students
            </p>
          </div>

          <button className="font-poppins rounded-xl bg-[#FBE1AD] px-4 py-2 text-sm font-medium text-[#023030] transition hover:bg-[#f7d692]">
            Share a tip
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_0.82fr]">
          <motion.div
            className="space-y-3"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
          >
            {communityPosts.map((post) => (
              <motion.div
                key={post.id}
                variants={fadeUp}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.18 }}
                className={cn(glassCardSoft, "rounded-[24px] p-4")}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#022b2b_0%,#046d6d_100%)] font-poppins text-sm font-semibold text-white shadow-md">
                    {post.name.charAt(0)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-poppins text-sm font-semibold text-[#023030]">
                        {post.name}
                      </p>
                      <span className="rounded-full bg-[#E3F2FD] px-2.5 py-1 text-[10px] font-medium text-[#023030]">
                        {post.badge}
                      </span>
                      <span className="text-[11px] text-[#023030]/55">
                        {post.time}
                      </span>
                    </div>

                    <p className="font-helvetica mt-1 text-xs text-[#023030]/55">
                      {post.establishment}
                    </p>

                    <p className="font-helvetica mt-3 text-sm leading-6 text-[#023030]/78">
                      {post.content}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/40 bg-white/55 px-3 py-1 text-xs text-[#025a5a]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center gap-4">
                      <button className="inline-flex items-center gap-1 text-xs text-[#023030]/70 transition hover:text-[#026d6d]">
                        <ThumbsUp className="h-3.5 w-3.5" />
                        {post.likes}
                      </button>
                      <button className="inline-flex items-center gap-1 text-xs text-[#023030]/70 transition hover:text-[#026d6d]">
                        <MessageCircle className="h-3.5 w-3.5" />
                        {post.comments}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="space-y-4"
          >
            <div className={cn(glassCard, "rounded-[24px] p-5")}>
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-[#E3F2FD] p-2 text-[#023030]">
                  <Flame className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-poppins text-base font-semibold text-[#023030]">
                    Trending tags
                  </p>
                  <p className="font-helvetica text-xs text-[#023030]/60">
                    Popular student topics
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {["#sulit", "#under150", "#healthy-ish", "#quicklunch", "#elbifinds"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/35 bg-white/55 px-3 py-1.5 text-xs text-[#023030]/80"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className={cn(glassCard, "rounded-[24px] p-5")}>
              <p className="font-poppins text-base font-semibold text-[#023030]">
                Favorite spots this week
              </p>
              <p className="font-helvetica mt-1 text-xs text-[#023030]/60">
                Based on student chatter
              </p>

              <div className="mt-4 space-y-3">
                {[
                  { name: "Aling Baby’s", note: "Sulit rice meals" },
                  { name: "Eatside", note: "Good under PHP 150" },
                  { name: "Seoul Kitchen", note: "Popular for sharing" },
                ].map((pick, i) => (
                  <div
                    key={pick.name}
                    className={cn(
                      glassCardSoft,
                      "flex items-center gap-3 rounded-[18px] p-3"
                    )}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3F2FD] font-poppins text-sm font-semibold text-[#023030]">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-poppins text-sm font-semibold text-[#023030]">
                        {pick.name}
                      </p>
                      <p className="font-helvetica text-xs text-[#023030]/60">
                        {pick.note}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}