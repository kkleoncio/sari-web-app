"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, Star } from "lucide-react";

export function MenuItemCard({ item }: { item: any }) {
  return (
    <Card className="py-0 w-[90%] overflow-hidden rounded-[18px] border border-[#d9d9d9] bg-[#f7f7f7] shadow-[0_2px_8px_rgba(0,0,0,0.10)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_12px_26px_rgba(0,0,0,0.14)]">
      <CardContent className="p-0">
        <div className="p-3 pb-0">
          <div className="relative h-[170px] w-full overflow-hidden rounded-[12px]">
            <img
              src={item.imageUrl}
              alt={item.mealName}
              className="h-full w-full object-cover"
            />

            <div className="absolute left-3 top-3 flex gap-2">
              {item.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className={`rounded-full px-3 py-1 text-[10px] leading-none shadow-sm ${
                    index === 0
                      ? "bg-[#ccffe8] text-[#023030]"
                      : "bg-[#e8eef2] text-[#023030]"
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3 px-4 pb-4 pt-3">
          <div>
            <h3 className="text-[18px] font-semibold leading-tight text-[#025252] font-poppins">
              {item.mealName}
            </h3>

            <div className="mt-1 flex items-center gap-1 text-[12px] text-[#023030]/75 font-helvetica">
              <Store className="h-3.5 w-3.5" />
              <span>{item.establishment}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[13px]">
            <div className="flex items-center gap-1.5 text-[#023030]/75">
              <Star className="h-3.5 w-3.5 text-[#f4c86a]" />
              <span>{item.rating}</span>
            </div>

            <div className="font-semibold text-[#025252]">
              ₱{item.price}
            </div>
          </div>

          <div className="flex justify-end">
            <Button className="h-10 rounded-[10px] bg-[linear-gradient(135deg,#022b2b_0%,#033f3f_45%,#046d6d_90%,#0a8f8f_100%)] px-5 text-[13px] font-medium text-white hover:bg-[#023f3f] font-poppins">
              Add to Plan
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}