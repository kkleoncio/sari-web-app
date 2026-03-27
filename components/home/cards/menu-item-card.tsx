"use client";

import {
  Flame,
  Leaf,
  PhilippinePeso,
  Plus,
  Soup,
  Store,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import type { Meal } from "@/app/home/types";

type MenuItemCardProps = {
  item: Meal;
  onAddMeal: (meal: Meal) => void;
};

function formatLabel(value?: string) {
  if (!value) return "";
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function MenuItemCard({ item, onAddMeal }: MenuItemCardProps) {
  const previewTags = [
    item.price <= 80 ? "Sulit pick" : null,
    item.isVegetarian ? "Vegetarian" : null,
    item.isSoup ? "Soup-based" : null,
    item.isFried ? "Fried favorite" : "Popular pick",
  ].filter(Boolean) as string[];

  const bestFor =
    item.mealTime?.slice(0, 2).map((time) => formatLabel(time)).join(" / ") ||
    formatLabel(item.category) ||
    "Anytime";

  return (
    <div className="group h-full overflow-hidden rounded-[26px] border border-white/45 bg-white/60 shadow-[0_10px_30px_rgba(2,48,48,0.08)] backdrop-blur-xl transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(2,48,48,0.12)]">
      <div className="flex h-full flex-col">
        <div className="relative overflow-hidden border-b border-[#023030]/6 bg-[radial-gradient(circle_at_top_left,rgba(163,230,220,0.55),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(227,242,253,0.9),transparent_42%),linear-gradient(135deg,#f8fcfc_0%,#eef8f7_100%)] px-4 py-4">
          <div className="absolute right-[-18px] top-[-18px] h-24 w-24 rounded-full bg-white/30 blur-2xl" />
          <div className="absolute bottom-[-24px] left-[-12px] h-20 w-20 rounded-full bg-[#ccffe8]/40 blur-2xl" />

          <div className="relative flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/70 text-[#026d6d] ring-1 ring-[#026d6d]/10 backdrop-blur-md transition duration-300 group-hover:scale-105">
                <UtensilsCrossed className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#023030]/45">
                  Featured meal
                </p>
                <p className="mt-1 line-clamp-1 text-sm font-semibold text-[#023030]">
                  {formatLabel(item.category) || "Student-friendly pick"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-white/72 px-3 py-2 text-right ring-1 ring-[#023030]/8 backdrop-blur-md">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#023030]/45">
                Price
              </p>
              <div className="mt-0.5 flex items-center justify-end gap-1 text-sm font-semibold text-[#023030]">
                <PhilippinePeso className="h-3.5 w-3.5" />
                <span>{item.price}.00</span>
              </div>
            </div>
          </div>

          <div className="relative mt-0 flex flex-wrap gap-2">
            {(item.tags?.length ? item.tags.slice(0, 2) : previewTags.slice(0, 2)).map(
              (tag, index) => (
                <span
                  key={`${item._id}-${tag}-${index}`}
                  className="rounded-full border border-white/40 bg-white/70 px-3 py-1 text-[11px] font-medium text-[#023030] backdrop-blur-md mb-5"
                >
                  {tag}
                </span>
              )
            )}
          </div>
        </div>

        <div className="flex h-full flex-col p-4">
          <div className="flex-1">
            <h3
              title={item.mealName}
              className="line-clamp-2 font-poppins text-[1.20rem] font-semibold leading-[1.15] tracking-[-0.02em] text-[#023030]"
            >
              {item.mealName}
            </h3>

            <div className="mt-2 flex min-w-0 items-center gap-2 text-sm text-[#023030]/62">
              <Store className="h-3.5 w-3.5 shrink-0" />
              <p className="truncate">{item.establishmentName}</p>
            </div>

            <p className="mt-3 text-sm leading-6 text-[#023030]/68">
              Easy to fit into a student budget and daily meal plan.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700">
                <Wallet className="h-3.5 w-3.5" />
                {item.price <= 80 ? "Student-budget friendly" : "Worth the price"}
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/35 bg-white/60 px-3 py-1.5 text-xs text-[#023030]/80 backdrop-blur-md">
                <Flame className="h-3.5 w-3.5 text-[#026d6d]" />
                {item.isFried ? "Crispy pick" : "Popular pick"}
              </span>

              {item.isVegetarian && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700">
                  <Leaf className="h-3.5 w-3.5" />
                  Vegetarian
                </span>
              )}

              {item.isSoup && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs text-sky-700">
                  <Soup className="h-3.5 w-3.5" />
                  Soup-based
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#023030]/8 pt-3">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#023030]/45">
                Best for
              </p>
              <p className="mt-1 line-clamp-1 font-poppins text-sm font-semibold text-[#023030] capitalize">
                {bestFor}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onAddMeal(item)}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#022b2b_0%,#033f3f_45%,#046d6d_90%,#0a8f8f_100%)] px-4 py-2.5 font-poppins text-sm font-medium text-white shadow-[0_10px_20px_rgba(2,48,48,0.14)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_24px_rgba(2,48,48,0.18)]"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}