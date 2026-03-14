"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock3, MapPin, Star } from "lucide-react";
import type { EstablishmentCard } from "@/app/home/types";
const imageSrc = "/default-img.jpg";

type EstablishmentItemProps = {
  item: EstablishmentCard;
  onViewMeals?: () => void;
};

export function EstablishmentItem({ item, onViewMeals }: EstablishmentItemProps) {
  return (
    <div className="group overflow-hidden rounded-[26px] border border-white/40 bg-white/55 shadow-[0_10px_30px_rgba(2,48,48,0.08)] backdrop-blur-xl transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(2,48,48,0.12)]">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={imageSrc}
          alt={item.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#023030]/35 via-transparent to-transparent" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {item.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/35 bg-white/70 px-3 py-1 text-[11px] font-medium text-[#023030] backdrop-blur-md"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="absolute bottom-3 right-3 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#026d6d] backdrop-blur-md">
          {item.distanceM}m away
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-poppins text-lg font-semibold text-[#023030]">
              {item.name}
            </h3>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-[#023030]/65">
              <MapPin className="h-3.5 w-3.5" />
              <span className="font-helvetica font-light">{item.address}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 rounded-full bg-[#E3F2FD] px-2.5 py-1 text-sm font-semibold text-[#023030]">
            <Star className="h-3.5 w-3.5 fill-current" />
            {item.rating}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/35 bg-white/45 p-3 backdrop-blur-md">
            <p className="font-helvetica text-[11px] font-light text-[#023030]/55">
              Price range
            </p>
            <p className="font-poppins mt-1 text-sm font-semibold text-[#023030]">
              PHP {item.priceMin} - {item.priceMax}
            </p>
          </div>

          <div className="rounded-2xl border border-white/35 bg-white/45 p-3 backdrop-blur-md">
            <p className="font-helvetica text-[11px] font-light text-[#023030]/55">
              Open hours
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-[#023030]">
              <Clock3 className="h-3.5 w-3.5 text-[#026d6d]" />
              <span>{item.hours}</span>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <Link
            href={`/home/establishments/${item.id}`}
            className="font-poppins inline-flex w-full items-center justify-center rounded-xl bg-[#023030] px-4 py-2.5 text-sm text-white transition hover:bg-[#034646]"
          >
            View meals here
          </Link>
        </div>
      </div>
    </div>
  );
}