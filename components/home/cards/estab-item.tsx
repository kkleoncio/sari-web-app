"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock3, MapPin, Leaf, ChevronRight } from "lucide-react";
import type { EstablishmentCard } from "@/app/home/types";
import { HoverTooltip } from "@/components/ui/hover-tooltip";


type EstablishmentItemProps = {
  item: EstablishmentCard & {
    healthScore?: number;
  };
  onViewMeals?: () => void;
};

function formatLocation(location?: string) {
  if (!location) return "Los Baños, Laguna";

  const locationMap: Record<string, string> = {
    lopez_ave: "Lopez Avenue, Los Baños",
    raymundo: "Raymundo, Los Baños",
    vega_centre: "Vega Centre, Los Baños",
    demarces: "Demarces, Los Baños",
    uplb: "UPLB, Los Baños",
    agapita: "Agapita, Los Baños",
    grove: "Grove, Los Baños",
    ruby: "Ruby St., Los Baños",
    es_plaza: "ES Plaza, Los Baños",
  };

  if (locationMap[location]) return locationMap[location];

  return `${location
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")}, Los Baños`;
}

function getHealthScoreLabel(score?: number) {
  if (!score) return "Balanced";
  if (score >= 8) return "Healthier";
  if (score >= 5) return "Balanced";
  return "Indulgent";
}

export function EstablishmentItem({
  item,
  onViewMeals,
}: EstablishmentItemProps) {

  const imageMap: Record<string, string> = {
    "Aldrin's Kitchen": "/estab-imgs/aldrins.jpg",
    "Bites All Day": "/estab-imgs/bites-all-day.jpg",
    "Black and Brew": "/estab-imgs/black-and-brew.jpg",
    "Chadiz Pizza": "/estab-imgs/chadis-pizza.jpg",
    "Chikin Corner": "/estab-imgs/chikin-corner.jpg",
    "Chubby Habbi's": "/estab-imgs/chubby-habbis.jpg",
  };

  const imageSrc = imageMap[item.name] || "/default-img.jpg";

  const displayLocation = formatLocation(item.location);
  const healthScore = item.healthScore ?? 5;

  return (
    <article className="group relative overflow-hidden rounded-[30px] border border-white/50 bg-white/55 shadow-[0_10px_35px_rgba(2,48,48,0.08)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_55px_rgba(2,48,48,0.14)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.24),rgba(255,255,255,0.08))]" />

      <div className="relative h-52 overflow-hidden">
        <Image
          src={imageSrc}
          alt={item.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.05]"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#023030]/55 via-[#023030]/14 to-transparent" />

        <div className="absolute left-3 top-3 flex max-w-[70%] flex-wrap gap-2">
          {item.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/25 bg-white/74 px-3 py-1 text-[11px] font-medium text-[#023030] backdrop-blur-md"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="absolute bottom-3 right-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/85 px-3 py-1.5 text-xs font-semibold text-[#023030] shadow-sm backdrop-blur-md">
            <Leaf className="h-3.5 w-3.5 text-[#0b7a5c]" />
            <span>{healthScore}.0</span>
            <HoverTooltip content="Health Score is a simple guide based on the meals usually offered here. Higher scores suggest more balanced everyday options." />
          </div>
        </div>
      </div>

      <div className="relative p-5">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-poppins truncate text-[19px] font-semibold tracking-[-0.01em] text-[#023030]">
                  {item.name}
                </h3>

                <div className="mt-1.5 flex items-center gap-1.5 text-sm text-[#023030]/65">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-[#026d6d]" />
                  <span className="font-helvetica truncate font-light">
                    {displayLocation}
                  </span>
                </div>
              </div>

              <div className="shrink-0 rounded-full bg-[#edf8f5] px-3 py-1 text-[11px] font-semibold text-[#0b7a5c]">
                {getHealthScoreLabel(healthScore)}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[#023030]/75">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/35 bg-white/50 px-3 py-1.5 text-xs text-[#023030]/80 backdrop-blur-md">
                <span className="flex h-7 w-7 items-center justify-center rounded-full text-[#026d6d] text-sm font-semibold">
                  ₱
                </span>
                <span className="font-medium text-[#023030]">
                  {item.priceRange}
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/35 bg-white/50 px-3 py-1.5 text-xs text-[#023030]/80 backdrop-blur-md">
                <span className="flex h-7 w-7 items-center justify-center rounded-full text-[#026d6d]">
                  <Clock3 className="h-3.5 w-3.5" />
                </span>
                <span className="font-medium text-[#023030]">
                  {item.openingHours || "10:00 AM – 8:00 PM"}  
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <Link
            href={`/home/establishments/${item.id}`}
            onClick={onViewMeals}
            className="font-poppins inline-flex w-full items-center justify-center gap-1.5 rounded-2xl bg-[#023030] px-4 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-[#034646] hover:gap-2"
          >
            View meals here
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}