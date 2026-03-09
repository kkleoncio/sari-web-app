"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Star, Clock3, Tag } from "lucide-react";
import type { EstablishmentCard } from "@/app/home/types";

type EstablishmentItemProps = {
  item: EstablishmentCard;
};

export function EstablishmentItem({ item }: EstablishmentItemProps) {
  return (
    <Card className="w-[90%] overflow-hidden rounded-[18px] border border-[#d9d9d9] bg-[#f7f7f7] py-0 shadow-[0_2px_8px_rgba(0,0,0,0.10)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_12px_26px_rgba(0,0,0,0.14)]">
      <CardContent className="p-0">
        <div className="p-3 pb-0">
          <div className="relative h-[170px] w-full overflow-hidden rounded-[12px]">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />

            <div className="absolute left-3 top-3 flex gap-2">
              {item.tags.map((tag, index) => (
                <span
                  key={`${tag}-${index}`}
                  className={cn(
                    "rounded-full px-3 py-1 text-[10px] leading-none shadow-sm",
                    index === 0
                      ? "bg-[#ccffe8] text-[#023030]"
                      : "bg-[#e8eef2] text-[#023030]"
                  )}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3 px-4 pb-4 pt-3">
          <div>
            <h3 className="font-poppins text-[18px] font-semibold leading-tight text-[#025252]">
              {item.name}
            </h3>

            <div className="mt-1 flex items-center gap-1 font-helvetica text-[12px] text-[#023030]/75">
              <MapPin className="h-3.5 w-3.5" />
              <span>{item.address}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-helvetica text-[12px] text-[#023030]/75">
            <div className="flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-[#f4c86a]" />
              <span>{item.rating.toFixed(1)}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-[#0b8b8b]" />
              <span>
                ₱{item.priceMin}-₱{item.priceMax}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2 font-helvetica text-[13px] font-light text-[#023030]/75">
            <Clock3 className="h-3.5 w-3.5 text-[#0b8b8b]" />
            <span>{item.hours}</span>
          </div>

          <div className="flex justify-end">
            <Button className="font-poppins h-10 rounded-[10px] bg-[linear-gradient(135deg,#022b2b_0%,#033f3f_45%,#046d6d_90%,#0a8f8f_100%)] px-5 text-[13px] font-medium text-white shadow-none hover:bg-[#023f3f]">
              View Menu
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}