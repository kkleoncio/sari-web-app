"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";


import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { RotateCcw, UtensilsCrossed, Wallet } from "lucide-react";

import type { AllowanceType } from "@/app/home/types";
import { StatCardGlass } from "../cards/stat-card";

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

type BudgetSectionProps = {
  innerRef?: React.RefObject<HTMLDivElement | null>;
  fadeUp: FadeUpType;
  stagger: StaggerType;
  glassCard: string;

  allowanceType: AllowanceType;
  setAllowanceType: React.Dispatch<React.SetStateAction<AllowanceType>>;

  budget: string;
  setBudget: React.Dispatch<React.SetStateAction<string>>;

  mealsPerDay: number;
  setMealsPerDay: React.Dispatch<React.SetStateAction<number>>;

  numericBudget: number;
  remaining: number;
  totalCost: number;

  openBudgetModal: boolean;
  setOpenBudgetModal: React.Dispatch<React.SetStateAction<boolean>>;

  loading: boolean;
  saving: boolean;

  resetAll: () => void;
  handleGenerate: () => void;
  formatPeso: (n: number) => string;
};


export function BudgetSection({
  innerRef,
  fadeUp,
  stagger,
  glassCard,
  allowanceType,
  setAllowanceType,
  budget,
  setBudget,
  mealsPerDay,
  setMealsPerDay,
  numericBudget,
  remaining,
  totalCost,
  openBudgetModal,
  setOpenBudgetModal,
  loading,
  saving,
  resetAll,
  handleGenerate,
  formatPeso,
}: BudgetSectionProps) {
  return (
    <motion.section
      ref={innerRef}
      className="scroll-mt-8"
      variants={fadeUp}
      initial="hidden"
      animate="show"
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl border border-white/45 bg-[linear-gradient(135deg,rgba(255,255,255,0.50),rgba(227,242,253,0.34)_38%,rgba(204,255,232,0.28)_100%)] p-5 backdrop-blur-xl shadow-[0_12px_34px_rgba(2,48,48,0.10)]",
          "before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(135deg,rgba(255,255,255,0.22),transparent_42%)]",
          "after:pointer-events-none after:absolute after:-right-10 after:top-0 after:h-36 after:w-36 after:rounded-full after:bg-[#ccffe8]/30 after:blur-3xl"
        )}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0 rounded-xl border border-white/50 p-2 text-[#023030] backdrop-blur-md">
              <Wallet className="h-8 w-8" />
            </div>

            <div>
              <h2 className="font-poppins text-lg font-semibold text-[#023030]">
                Current Budget
              </h2>
              <p className="font-helvetica text-sm font-light text-[#023030]/65">
                {allowanceType === "daily" ? "Daily allowance" : "Weekly allowance"}{" "}
                - {mealsPerDay} meals per day
              </p>
            </div>
          </div>

          <Dialog open={openBudgetModal} onOpenChange={setOpenBudgetModal}>
            <DialogTrigger asChild>
              <Button className="font-poppins rounded-xl bg-[#E3F2FD] text-[#023030] hover:bg-[#d1eafb] focus-visible:ring-2 focus-visible:ring-[#023030] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                <Wallet className="mr-2 h-4 w-4" />
                Set Budget
              </Button>
            </DialogTrigger>

            <DialogContent className="rounded-3xl">
              <DialogHeader>
                <DialogTitle>Set your budget</DialogTitle>
                <DialogDescription>
                  Update your allowance type, budget, and meals per day.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label>Allowance type</Label>
                  <Select
                    value={allowanceType}
                    onValueChange={(v) => setAllowanceType(v as AllowanceType)}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Budget amount</Label>
                  <Input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="Enter your budget"
                    className="rounded-xl"
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Meals per day</Label>
                  <Input
                    type="number"
                    min={1}
                    max={6}
                    value={mealsPerDay}
                    onChange={(e) =>
                      setMealsPerDay(
                        Math.min(6, Math.max(1, Number(e.target.value) || 1))
                      )
                    }
                    className="rounded-xl"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setOpenBudgetModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="rounded-xl bg-[#026d6d] text-white hover:bg-[#023030]"
                  onClick={() => setOpenBudgetModal(false)}
                >
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <motion.div
          className="font-poppins mt-5 grid grid-cols-1 gap-3 md:grid-cols-3"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={fadeUp}>
            <StatCardGlass label="Budget" value={formatPeso(numericBudget || 0)} />
          </motion.div>
          <motion.div variants={fadeUp}>
            <StatCardGlass label="Remaining" value={formatPeso(remaining)} />
          </motion.div>
          <motion.div variants={fadeUp}>
            <StatCardGlass label="Used" value={formatPeso(totalCost)} />
          </motion.div>
        </motion.div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-helvetica text-sm font-light text-[#023030]/70">
            Set a budget to generate meal combinations.
          </p>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="rounded-xl border-[#d9e4e4] bg-[#E3F2FD] text-[#023030] hover:bg-[#d4ebfb]"
              onClick={resetAll}
              disabled={loading || saving}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>

            <Button
              onClick={handleGenerate}
              disabled={loading || saving || !numericBudget}
              className="rounded-xl bg-[#FBE1AD] text-[#023030] hover:bg-[#f7d692]"
            >
              <UtensilsCrossed className="mr-2 h-4 w-4" />
              {loading ? "Generating..." : "Generate Options"}
            </Button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}