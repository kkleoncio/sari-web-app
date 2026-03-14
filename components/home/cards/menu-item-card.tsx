"use client";

import Image from "next/image";
import { Flame, Sparkles, Wallet } from "lucide-react";
import type { Meal } from "@/app/home/types";

type MenuItemCardProps = {
  item: Meal;
  onAddMeal: (meal: Meal) => void;
};

export function MenuItemCard({ item, onAddMeal }: MenuItemCardProps) {
  const imageSrc = "/default-img.jpg";

  return (
    <div className="group overflow-hidden rounded-[26px] border border-white/40 bg-white/55 shadow-[0_10px_30px_rgba(2,48,48,0.08)] backdrop-blur-xl transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(2,48,48,0.12)]">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={imageSrc}
          alt={item.mealName}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#023030]/40 via-transparent to-transparent" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {(item.tags?.length ? item.tags.slice(0, 2) : [item.foodType]).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/35 bg-white/75 px-3 py-1 text-[11px] font-medium text-[#023030] backdrop-blur-md"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="absolute bottom-3 right-3 rounded-full bg-white/80 px-3 py-1 text-sm font-semibold text-[#026d6d] backdrop-blur-md">
          PHP {item.price}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-poppins text-lg font-semibold text-[#023030]">
              {item.mealName}
            </h3>
            <p className="font-helvetica mt-1 text-sm font-light text-[#023030]/65">
              {item.establishmentName}
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-full bg-[#E3F2FD] px-2.5 py-1 text-sm font-semibold text-[#023030]">
            <Sparkles className="h-3.5 w-3.5" />
            {item.healthScore}/10
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/35 bg-white/50 px-3 py-1.5 text-xs text-[#023030]/80 backdrop-blur-md">
            <Wallet className="h-3.5 w-3.5 text-[#026d6d]" />
            Student-budget friendly
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/35 bg-white/50 px-3 py-1.5 text-xs text-[#023030]/80 backdrop-blur-md">
            <Flame className="h-3.5 w-3.5 text-[#026d6d]" />
            {item.isFried ? "Crispy pick" : "Popular pick"}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="font-helvetica text-[11px] font-light text-[#023030]/55">
              Best for
            </p>
            <p className="font-poppins mt-1 text-sm font-semibold text-[#023030] capitalize">
              {item.mealTime?.join(" / ") || item.category}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onAddMeal(item)}
            className="font-poppins rounded-xl bg-[linear-gradient(135deg,#022b2b_0%,#033f3f_45%,#046d6d_90%,#0a8f8f_100%)] px-4 py-2.5 text-sm font-medium text-white shadow-[0_10px_20px_rgba(2,48,48,0.14)] transition hover:opacity-95"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}