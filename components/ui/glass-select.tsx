"use client";

import * as React from "react";
import * as Select from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";

type Option = {
  value: string;
  label: string;
};

type GlassSelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
};

export function GlassSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  className = "",
}: GlassSelectProps) {
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger
        className={`group inline-flex h-12 w-full items-center justify-between rounded-2xl border border-white/50 bg-white/55 px-4 text-sm font-medium text-[#023030] shadow-[0_8px_24px_rgba(2,48,48,0.06)] backdrop-blur-xl outline-none transition-all data-[placeholder]:text-[#023030]/42 hover:bg-white/62 focus:border-[#026d6d]/35 focus:shadow-[0_10px_28px_rgba(2,48,48,0.10)] ${className}`}
        aria-label={placeholder}
      >
        <Select.Value placeholder={placeholder} />
        <Select.Icon>
          <ChevronDown className="h-4 w-4 text-[#023030]/45 transition group-data-[state=open]:rotate-180" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={8}
          className="z-50 overflow-hidden rounded-2xl border border-white/60 bg-white/78 shadow-[0_18px_45px_rgba(2,48,48,0.16)] backdrop-blur-2xl"
        >
          <Select.Viewport className="p-2">
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className="relative flex min-h-[42px] cursor-pointer select-none items-center rounded-xl px-10 py-2 text-sm font-medium text-[#023030] outline-none transition hover:bg-white/70 focus:bg-white/78 data-[state=checked]:bg-[#eaf6f6]"
              >
                <Select.ItemText>{option.label}</Select.ItemText>

                <span className="absolute left-3 inline-flex items-center justify-center">
                  <Select.ItemIndicator>
                    <Check className="h-4 w-4 text-[#026d6d]" />
                  </Select.ItemIndicator>
                </span>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}