"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Clock3, Sparkles, UtensilsCrossed, Wallet } from "lucide-react";

import type { Meal } from "@/app/home/types";
import { MenuItemCard } from "@/components/home/cards/menu-item-card";

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

type MealsSectionProps = {
  innerRef?: React.RefObject<HTMLElement | null>;
  fadeUp: FadeUpType;
  stagger: StaggerType;
  meals: Meal[];
  totalCount: number;
  showAll: boolean;
  onToggleShowAll: () => void;
  onAddMeal: (meal: Meal) => void;
};

export function MealsSection({
  innerRef,
  fadeUp,
  stagger,
  meals,
  totalCount,
  showAll,
  onToggleShowAll,
  onAddMeal,
}: MealsSectionProps) {
  return (
    <section ref={innerRef} className="scroll-mt-8 space-y-4">
      <motion.div
        className="rounded-[28px] border border-white/40 bg-white/50 p-5 shadow-[0_10px_30px_rgba(2,48,48,0.08)] backdrop-blur-xl md:p-6"
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-[#FBE1AD] px-3 py-1.5 text-xs font-medium text-[#025a5a] backdrop-blur-md">
              <UtensilsCrossed className="h-3.5 w-3.5" />
              Food browse
            </div>

            <h2 className="font-poppins mt-4 text-2xl font-semibold text-[#023030] md:text-[28px]">
              What’s good today?
            </h2>

            <p className="font-helvetica mt-2 text-sm font-light leading-6 text-[#023030]/68 md:text-[15px]">
              Explore easy student picks, best sellers, and meals that can fit
              your allowance without overthinking.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <div className="rounded-full border border-white/40 bg-white/45 px-3 py-1.5 text-xs text-[#023030]/80">
                Under PHP 150
              </div>
              <div className="rounded-full border border-white/40 bg-white/45 px-3 py-1.5 text-xs text-[#023030]/80">
                Best sellers
              </div>
              <div className="rounded-full border border-white/40 bg-white/45 px-3 py-1.5 text-xs text-[#023030]/80">
                Quick lunch
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:w-[360px]">
            <div className="rounded-2xl border border-white/35 bg-[linear-gradient(135deg,rgba(255,255,255,0.52),rgba(227,242,253,0.36),rgba(204,255,232,0.22))] p-4 backdrop-blur-lg">
              <div className="mb-2 inline-flex rounded-xl bg-[#E3F2FD] p-2 text-[#023030]">
                <UtensilsCrossed className="h-4 w-4" />
              </div>
              <p className="font-helvetica text-xs text-[#023030]/60">Meals</p>
              <p className="font-poppins mt-1 text-lg font-semibold text-[#023030]">
                {totalCount}
              </p>
            </div>

            <div className="rounded-2xl border border-white/35 bg-[linear-gradient(135deg,rgba(255,255,255,0.52),rgba(227,242,253,0.36),rgba(204,255,232,0.22))] p-4 backdrop-blur-lg">
              <div className="mb-2 inline-flex rounded-xl bg-[#E3F2FD] p-2 text-[#023030]">
                <Wallet className="h-4 w-4" />
              </div>
              <p className="font-helvetica text-xs text-[#023030]/60">Typical</p>
              <p className="font-poppins mt-1 text-lg font-semibold text-[#023030]">
                PHP 120
              </p>
            </div>

            <div className="rounded-2xl border border-white/35 bg-[linear-gradient(135deg,rgba(255,255,255,0.52),rgba(227,242,253,0.36),rgba(204,255,232,0.22))] p-4 backdrop-blur-lg">
              <div className="mb-2 inline-flex rounded-xl bg-[#E3F2FD] p-2 text-[#023030]">
                <Clock3 className="h-4 w-4" />
              </div>
              <p className="font-helvetica text-xs text-[#023030]/60">Mood</p>
              <p className="font-poppins mt-1 text-lg font-semibold text-[#023030]">
                Quick picks
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="mb-2 flex flex-wrap gap-2"
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        {["Sulit", "Rice Meal", "Popular", "Breakfast", "Fast"].map((chip) => (
          <button
            key={chip}
            className="rounded-full border border-white/40 bg-white/50 px-3 py-1.5 text-xs text-[#023030]/80 backdrop-blur-md transition hover:bg-white/70"
          >
            {chip}
          </button>
        ))}
      </motion.div>

      <motion.div
        key={showAll ? "expanded-meals" : "collapsed-meals"}
        className="grid gap-3 font-poppins md:grid-cols-2 xl:grid-cols-3"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {meals.map((item) => (
          <motion.div key={item._id} variants={fadeUp}>
            <MenuItemCard item={item} onAddMeal={onAddMeal} />
          </motion.div>
        ))}
      </motion.div>

      {/* <motion.div
        className="rounded-[24px] border border-white/35 bg-[linear-gradient(135deg,rgba(255,255,255,0.48),rgba(227,242,253,0.30),rgba(204,255,232,0.18))] p-4 backdrop-blur-lg shadow-[0_8px_24px_rgba(2,48,48,0.06)]"
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-poppins text-sm font-semibold text-[#023030]">
              Can’t decide yet?
            </p>
            <p className="font-helvetica mt-1 text-sm font-light text-[#023030]/65">
              Try generating meal options based on your budget for more personal picks.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-2 text-xs text-[#026d6d]">
            <Sparkles className="h-3.5 w-3.5" />
            Personalized suggestions feel easier
          </div>
        </div>
      </motion.div> */}
      {totalCount > 6 && (
        <div className="mt-5 flex justify-center">
          <button
            onClick={onToggleShowAll}
            className="font-poppins rounded-xl border border-white/45 bg-white/55 px-4 py-2 text-sm text-[#023030] backdrop-blur-md transition hover:bg-white/75"
          >
            {showAll ? "Show less" : `Show more meals (${totalCount})`}
          </button>
        </div>
      )}
    </section>
  );
}