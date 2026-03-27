"use client";

import * as React from "react";
import { Info } from "lucide-react";

type HoverTooltipProps = {
  content: React.ReactNode;
  className?: string;
  panelClassName?: string;
  iconClassName?: string;
};

export function HoverTooltip({
  content,
  className = "",
  panelClassName = "",
  iconClassName = "",
}: HoverTooltipProps) {
  return (
    <div className={`group/tooltip relative inline-flex ${className}`}>
      <button
        type="button"
        tabIndex={0}
        className="inline-flex items-center justify-center rounded-full"
        aria-label="More information"
      >
        <Info className={`h-3.5 w-3.5 text-[#026d6d] ${iconClassName}`} />
      </button>

      <div
        className={`pointer-events-none absolute bottom-[calc(100%+10px)] right-0 z-30 w-56 translate-y-1 rounded-2xl border border-white/50 bg-white/92 p-3 text-xs leading-5 text-[#023030]/80 opacity-0 shadow-[0_12px_30px_rgba(2,48,48,0.12)] backdrop-blur-xl transition-all duration-200 group-hover/tooltip:translate-y-0 group-hover/tooltip:opacity-100 group-focus-within/tooltip:translate-y-0 group-focus-within/tooltip:opacity-100 ${panelClassName}`}
      >
        {content}

        <div className="absolute -bottom-1 right-3 h-2.5 w-2.5 rotate-45 border-b border-r border-white/50 bg-white/92" />
      </div>
    </div>
  );
}