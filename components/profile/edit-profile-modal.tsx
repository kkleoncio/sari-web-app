"use client";

import * as React from "react";
import {
  User,
  Mail,
  MapPin,
  FileText,
  Heart,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ProfileFormData = {
  name: string;
  username: string;
  email: string;
  location: string;
  bio: string;
  budgetStyle: string;
  favoriteFood: string;
};

type EditProfileModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: ProfileFormData;
  onChange: (field: keyof ProfileFormData, value: string) => void;
  onSave: () => void;
};

export function EditProfileModal({
  open,
  onOpenChange,
  formData,
  onChange,
  onSave,
}: EditProfileModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88vh] w-[95vw] max-w-[720px] flex-col overflow-hidden rounded-[30px] border border-[#dcefe8] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(237,247,243,0.95))] p-0 shadow-[0_24px_80px_rgba(2,48,48,0.14)]">
        <div className="relative overflow-hidden border-b border-[#023030]/8 px-6 py-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.10),transparent_30%),radial-gradient(circle_at_top_left,rgba(45,212,191,0.10),transparent_24%)]" />
          <div className="relative">
            <DialogHeader>
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d7eee6] bg-white/80 text-[#0f766e] shadow-sm">
                <Sparkles className="h-5 w-5" />
              </div>

              <DialogTitle className="font-poppins text-xl font-semibold text-[#1f2937]">
                Edit Profile
              </DialogTitle>
            </DialogHeader>

            <p className="mt-1 text-sm text-[#4b635d]">
              Update your SARI profile details and make it feel more like you.
            </p>
          </div>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Full Name"
              icon={<User className="h-4 w-4" />}
              value={formData.name}
              onChange={(value) => onChange("name", value)}
              placeholder="Enter your full name"
            />

            <Field
              label="Username"
              icon={<User className="h-4 w-4" />}
              value={formData.username}
              onChange={(value) => onChange("username", value)}
              placeholder="@yourusername"
            />

            <Field
              label="Email"
              icon={<Mail className="h-4 w-4" />}
              value={formData.email}
              onChange={(value) => onChange("email", value)}
              placeholder="Enter your email"
              type="email"
            />

            <Field
              label="Location"
              icon={<MapPin className="h-4 w-4" />}
              value={formData.location}
              onChange={(value) => onChange("location", value)}
              placeholder="Los Baños, Laguna"
            />

            <Field
              label="Food Personality"
              icon={<Heart className="h-4 w-4" />}
              value={formData.budgetStyle}
              onChange={(value) => onChange("budgetStyle", value)}
              placeholder="Budget-conscious foodie"
            />

            <Field
              label="Favorite Food Type"
              icon={<Heart className="h-4 w-4" />}
              value={formData.favoriteFood}
              onChange={(value) => onChange("favoriteFood", value)}
              placeholder="Rice meals & sulit snacks"
            />

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-[#1f2937]">
                Bio
              </label>

              <div className="rounded-[24px] border border-[#dcefe8] bg-white/80 px-4 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.04)] transition focus-within:border-[#86d6bf] focus-within:ring-2 focus-within:ring-[#10b981]/10">
                <div className="mb-2 flex items-center gap-2 text-[#0f766e]">
                  <FileText className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-[0.12em]">
                    About You
                  </span>
                </div>

                <textarea
                  value={formData.bio}
                  onChange={(e) => onChange("bio", e.target.value)}
                  placeholder="Write something about yourself..."
                  rows={5}
                  className="max-h-40 min-h-[120px] w-full resize-none bg-transparent text-sm leading-6 text-[#1f2937] outline-none placeholder:text-[#7b8a85]"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-[#023030]/8 bg-white/55 px-6 py-4 backdrop-blur-sm">
          <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-2xl border-[#cfe8df] bg-white/80 text-[#134e4a] hover:bg-[#f8fffd]"
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={onSave}
              className="rounded-2xl bg-[#0f766e] text-white hover:bg-[#115e59]"
            >
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  icon,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#1f2937]">
        {label}
      </label>

      <div className="rounded-[24px] border border-[#dcefe8] bg-white/80 px-4 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.04)] transition focus-within:border-[#86d6bf] focus-within:ring-2 focus-within:ring-[#10b981]/10">
        <div className="mb-2 flex items-center gap-2 text-[#0f766e]">
          {icon}
          <span className="text-xs font-medium uppercase tracking-[0.12em]">
            {label}
          </span>
        </div>

        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-[#1f2937] outline-none placeholder:text-[#7b8a85]"
        />
      </div>
    </div>
  );
}