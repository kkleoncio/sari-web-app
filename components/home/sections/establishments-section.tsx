"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Store } from "lucide-react";

import type { EstablishmentCard } from "@/app/home/types";
import { EstablishmentItem } from "@/components/home/cards/estab-item";

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

type EstablishmentsSectionProps = {
  innerRef?: React.RefObject<HTMLElement | null>;
  fadeUp: FadeUpType;
  stagger: StaggerType;
  establishments: EstablishmentCard[];
  totalCount: number;
  onToggleShowAll: () => void;
};

export function EstablishmentsSection({
  innerRef,
  fadeUp,
  stagger,
  establishments,
  onToggleShowAll,
}: EstablishmentsSectionProps) {
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
          <Store className="h-3.5 w-3.5" />
          Food spots near you
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <h2 className="font-poppins text-2xl font-semibold text-[#023030] md:text-[28px]">
            Places to eat around Elbi
          </h2>

          <button
            onClick={onToggleShowAll}
            className="hidden shrink-0 text-sm font-medium text-[#026d6d] hover:underline lg:inline-flex"
          >
            View all →
          </button>
        </div>

        <p className="font-helvetica mt-2 max-w-xl text-sm font-light leading-6 text-[#023030]/68 md:text-[15px]">
          Browse nearby food spots, compare prices, and find places that feel
          student-budget friendly.
        </p>

        <button
          onClick={onToggleShowAll}
          className="mt-4 inline-flex text-sm font-medium text-[#026d6d] hover:underline lg:hidden"
        >
          View all →
        </button>
      </motion.div>

      <motion.div
        className="font-poppins grid gap-3 md:grid-cols-2 xl:grid-cols-3"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {establishments.map((item) => (
          <motion.div key={item.id} variants={fadeUp}>
            <EstablishmentItem item={item} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}