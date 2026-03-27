"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { UtensilsCrossed } from "lucide-react";

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
  const featuredMealNames = [
  "Chicken Adobo",
  "Laing (Half)",
  "Fried Tilapia",
  "Sizzling Tofu",
  "Siomai Meal (4 pcs + Rice)",
  "Potato Omelette",
];

  const selectedFeaturedMeals = featuredMealNames
    .map((name) => meals.find((meal) => meal.mealName === name))
    .filter((meal): meal is Meal => Boolean(meal));

  const featuredMeals = showAll
    ? meals
    : selectedFeaturedMeals.length > 0
      ? selectedFeaturedMeals
      : meals.slice(0, 6);

  return (
    <section ref={innerRef} className="scroll-mt-8 space-y-4">
      <motion.div
        className="px-1 md:px-2"
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-medium text-[#025a5a] backdrop-blur-xl shadow-[0_8px_24px_rgba(2,48,48,0.12)]">
          <UtensilsCrossed className="h-3.5 w-3.5" />
          Student-friendly picks
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <h2 className="font-poppins text-2xl font-semibold text-[#023030] md:text-[28px]">
            Picks you can try today
          </h2>

          {totalCount > 6 && (
            <button
              onClick={onToggleShowAll}
              className="hidden shrink-0 text-sm font-medium text-[#026d6d] hover:underline lg:inline-flex"
            >
              {showAll ? "Show less →" : "View all →"}
            </button>
          )}
        </div>

        <p className="font-helvetica mt-2 max-w-xl text-sm font-light leading-6 text-[#023030]/68 md:text-[15px]">
          Browse affordable meals, quick campus favorites, and everyday food
          picks that can fit your budget.
        </p>

        {totalCount > 6 && (
          <button
            onClick={onToggleShowAll}
            className="mt-4 inline-flex text-sm font-medium text-[#026d6d] hover:underline lg:hidden"
          >
            {showAll ? "Show less →" : "View all →"}
          </button>
        )}
      </motion.div>

      <motion.div
        key={showAll ? "expanded-meals" : "collapsed-meals"}
        className="font-poppins grid gap-3 md:grid-cols-2 xl:grid-cols-3"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {featuredMeals.map((item) => (
          <motion.div key={item._id} variants={fadeUp} className="h-full">
            <MenuItemCard item={item} onAddMeal={onAddMeal} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}