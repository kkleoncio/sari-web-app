"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wallet,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Heart,
  Ban,
} from "lucide-react";

import type {
  AllowanceType,
  PreferenceMode,
  MealType,
} from "@/app/home/types";

type BudgetModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allowanceType: AllowanceType;
  setAllowanceType: React.Dispatch<React.SetStateAction<AllowanceType>>;
  budget: string;
  setBudget: React.Dispatch<React.SetStateAction<string>>;
  mealsPerDay: number;
  setMealsPerDay: React.Dispatch<React.SetStateAction<number>>;
  preferenceMode: PreferenceMode;
  setPreferenceMode: React.Dispatch<React.SetStateAction<PreferenceMode>>;
  mealType: MealType;
  setMealType: React.Dispatch<React.SetStateAction<MealType>>;
  excludeAllergens: string[];
  setExcludeAllergens: React.Dispatch<React.SetStateAction<string[]>>;
  preferredTags: string[];
  setPreferredTags: React.Dispatch<React.SetStateAction<string[]>>;
  dislikedTags: string[];
  setDislikedTags: React.Dispatch<React.SetStateAction<string[]>>;
  onSave?: () => void;
};

const allergenOptions = [
  "egg",
  "dairy",
  "gluten",
  "soy",
  "seafood",
  "peanuts",
];
const preferredTagOptions = [
  "filling",
  "light",
  "vegetarian",
  "vegetables",
  "rice",
  "chicken",
];
const dislikedTagOptions = [
  "fried",
  "spicy",
  "soup",
  "heavy",
];

function ToggleChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "border-[#046d6d] bg-[#046d6d] text-white shadow-sm"
          : "border-[#dceaea] bg-white text-[#023030]/75 hover:border-[#b7d3d3] hover:bg-[#f7fbfb]"
      }`}
    >
      {label}
    </button>
  );
}

function CollapsibleSection({
  title,
  subtitle,
  icon,
  open,
  onToggle,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[22px] border border-[#e4f0f0] bg-white/80">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="rounded-xl bg-[#f2fbfb] p-2 text-[#026d6d] shadow-sm">
            {icon}
          </div>
          <div className="min-w-0">
            <p className="font-poppins text-sm font-semibold text-[#023030]">
              {title}
            </p>
            <p className="text-xs text-[#023030]/58">{subtitle}</p>
          </div>
        </div>

        <div className="shrink-0 text-[#023030]/55">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {open && <div className="border-t border-[#edf4f4] px-4 pb-4 pt-3">{children}</div>}
    </div>
  );
}

export function BudgetModal({
  open,
  onOpenChange,
  allowanceType,
  setAllowanceType,
  budget,
  setBudget,
  mealsPerDay,
  setMealsPerDay,
  preferenceMode,
  setPreferenceMode,
  mealType,
  setMealType,
  excludeAllergens,
  setExcludeAllergens,
  preferredTags,
  setPreferredTags,
  dislikedTags,
  setDislikedTags,
  onSave,
}: BudgetModalProps) {
  const [openAllergens, setOpenAllergens] = React.useState(false);
  const [openPreferred, setOpenPreferred] = React.useState(false);
  const [openDisliked, setOpenDisliked] = React.useState(false);

  const toggleInArray = (
    value: string,
    list: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (list.includes(value)) {
      setter(list.filter((item) => item !== value));
    } else {
      setter([...list, value]);
    }
  };

  const selectedCount =
    excludeAllergens.length + preferredTags.length + dislikedTags.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88vh] w-[calc(100vw-24px)] max-w-xl flex-col overflow-hidden rounded-[28px] border border-white/50 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,251,251,0.96))] p-0 shadow-[0_24px_80px_rgba(2,48,48,0.16)]">
        <div className="relative flex min-h-0 flex-1 flex-col">
          <div className="pointer-events-none absolute -left-8 top-0 h-28 w-28 rounded-full bg-[#E3F2FD] blur-3xl" />
          <div className="pointer-events-none absolute -right-8 top-8 h-28 w-28 rounded-full bg-[#ccffe8] blur-3xl" />

          <DialogHeader className="relative shrink-0 border-b border-[#edf3f3] px-5 pb-4 pt-5 sm:px-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <DialogTitle className="font-poppins text-xl font-semibold tracking-tight text-[#023030] sm:text-2xl">
                  Adjust your budget
                </DialogTitle>
                <DialogDescription className="mt-1 max-w-md text-sm leading-5 text-[#023030]/65">
                  Set your budget, meal style, and optional food preferences.
                </DialogDescription>
              </div>

              {selectedCount > 0 && (
                <div className="rounded-full border border-[#d6ecec] bg-white/80 px-3 py-1 text-[11px] font-medium text-[#026d6d]">
                  {selectedCount} preference{selectedCount > 1 ? "s" : ""} selected
                </div>
              )}
            </div>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
            <div className="space-y-4">
              <div className="rounded-[24px] border border-white/60 bg-white/75 p-4 shadow-[0_10px_30px_rgba(2,48,48,0.05)] backdrop-blur-xl">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-xl bg-[#E3F2FD] p-2 text-[#023030]">
                    <Wallet className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-poppins text-sm font-semibold text-[#023030]">
                      Budget details
                    </p>
                    <p className="text-xs text-[#023030]/58">
                      Set the basics for your meal plan
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label
                        htmlFor="allowanceType"
                        className="text-xs font-medium text-[#023030]/75"
                      >
                        Allowance type
                      </Label>
                      <Select
                        value={allowanceType}
                        onValueChange={(value) =>
                          setAllowanceType(value as AllowanceType)
                        }
                      >
                        <SelectTrigger
                          id="allowanceType"
                          className="h-11 rounded-2xl border-[#dceaea] bg-white/90 shadow-none"
                        >
                          <SelectValue placeholder="Select allowance type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label
                        htmlFor="mealsPerDay"
                        className="text-xs font-medium text-[#023030]/75"
                      >
                        Meals per day
                      </Label>
                      <Select
                        value={String(mealsPerDay)}
                        onValueChange={(value) => setMealsPerDay(Number(value))}
                      >
                        <SelectTrigger
                          id="mealsPerDay"
                          className="h-11 rounded-2xl border-[#dceaea] bg-white/90 shadow-none"
                        >
                          <SelectValue placeholder="Select meals per day" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 meal</SelectItem>
                          <SelectItem value="2">2 meals</SelectItem>
                          <SelectItem value="3">3 meals</SelectItem>
                          <SelectItem value="4">4 meals</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label
                      htmlFor="budget"
                      className="text-xs font-medium text-[#023030]/75"
                    >
                      Budget
                    </Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#023030]/55">
                        PHP
                      </span>
                      <Input
                        id="budget"
                        type="number"
                        min="1"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder="Enter your budget"
                        className="h-11 rounded-2xl border-[#dceaea] bg-white/90 pl-14 shadow-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-[#e4f0f0] bg-[linear-gradient(180deg,#f8fcfc_0%,#f4fbf8_100%)] p-4 shadow-[0_10px_30px_rgba(2,48,48,0.04)]">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-xl bg-white p-2 text-[#026d6d] shadow-sm">
                    <SlidersHorizontal className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-poppins text-sm font-semibold text-[#023030]">
                      Meal preferences
                    </p>
                    <p className="text-xs text-[#023030]/58">
                      Help SARI generate options that match your vibe
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label
                      htmlFor="preferenceMode"
                      className="text-xs font-medium text-[#023030]/75"
                    >
                      Preference style
                    </Label>
                    <Select
                      value={preferenceMode}
                      onValueChange={(value) =>
                        setPreferenceMode(value as PreferenceMode)
                      }
                    >
                      <SelectTrigger
                        id="preferenceMode"
                        className="h-11 rounded-2xl border-[#dceaea] bg-white shadow-none"
                      >
                        <SelectValue placeholder="Select preference style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cheapest">Cheapest</SelectItem>
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="variety">Variety</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label
                      htmlFor="mealType"
                      className="text-xs font-medium text-[#023030]/75"
                    >
                      Meal type
                    </Label>
                    <Select
                      value={mealType}
                      onValueChange={(value) => setMealType(value as MealType)}
                    >
                      <SelectTrigger
                        id="mealType"
                        className="h-11 rounded-2xl border-[#dceaea] bg-white shadow-none"
                      >
                        <SelectValue placeholder="Select meal type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-meals">Full meals</SelectItem>
                        <SelectItem value="snacks">Snacks</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-white/70 bg-white/70 px-3 py-2 text-xs leading-5 text-[#023030]/65">
                  <span className="font-medium text-[#023030]">Tip:</span> Use{" "}
                  <span className="font-medium">Cheapest</span> when you want to
                  save more, <span className="font-medium">Balanced</span> for
                  everyday choices, and <span className="font-medium">Variety</span>{" "}
                  when you want less repetitive meal plans.
                </div>
              </div>

              <div className="space-y-3">
                <CollapsibleSection
                  title="Avoid allergens"
                  subtitle="Filter out meals with ingredients you want to avoid"
                  icon={<ShieldAlert className="h-4 w-4" />}
                  open={openAllergens}
                  onToggle={() => setOpenAllergens((prev) => !prev)}
                >
                  <div className="flex flex-wrap gap-2">
                    {allergenOptions.map((item) => (
                      <ToggleChip
                        key={item}
                        label={item}
                        active={excludeAllergens.includes(item)}
                        onClick={() =>
                          toggleInArray(item, excludeAllergens, setExcludeAllergens)
                        }
                      />
                    ))}
                  </div>
                </CollapsibleSection>

                <CollapsibleSection
                  title="Preferred meal tags"
                  subtitle="Give SARI a better idea of what you usually want"
                  icon={<Heart className="h-4 w-4" />}
                  open={openPreferred}
                  onToggle={() => setOpenPreferred((prev) => !prev)}
                >
                  <div className="flex flex-wrap gap-2">
                    {preferredTagOptions.map((item) => (
                      <ToggleChip
                        key={item}
                        label={item}
                        active={preferredTags.includes(item)}
                        onClick={() =>
                          toggleInArray(item, preferredTags, setPreferredTags)
                        }
                      />
                    ))}
                  </div>
                </CollapsibleSection>

                <CollapsibleSection
                  title="Disliked meal tags"
                  subtitle="Reduce options that do not fit your food preferences"
                  icon={<Ban className="h-4 w-4" />}
                  open={openDisliked}
                  onToggle={() => setOpenDisliked((prev) => !prev)}
                >
                  <div className="flex flex-wrap gap-2">
                    {dislikedTagOptions.map((item) => (
                      <ToggleChip
                        key={item}
                        label={item}
                        active={dislikedTags.includes(item)}
                        onClick={() =>
                          toggleInArray(item, dislikedTags, setDislikedTags)
                        }
                      />
                    ))}
                  </div>
                </CollapsibleSection>
              </div>
            </div>
          </div>

          <DialogFooter className="shrink-0 border-t border-[#edf3f3] bg-white/80 px-5 py-4 sm:px-6">
            <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-11 rounded-2xl border-[#d8e6e6] bg-white text-[#023030] hover:bg-[#f6fbfb]"
              >
                Close
              </Button>

              <Button
                onClick={() => {
                  onSave?.();
                  onOpenChange(false);
                }}
                className="h-11 rounded-2xl bg-[linear-gradient(135deg,#022b2b_0%,#033f3f_45%,#046d6d_90%,#0a8f8f_100%)] px-5 text-white shadow-[0_10px_24px_rgba(2,48,48,0.16)] hover:opacity-95"
              >
                Save preferences
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}