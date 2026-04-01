"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Store,
  MapPin,
  Clock3,
  Wallet,
  Tags,
  Pencil,
  Trash2,
  Plus,
  Sparkles,
  CheckCircle2,
  XCircle,
} from "lucide-react";

type Establishment = {
  _id: string;
  name: string;
  category: string;
  location: string;
  priceRange: string;
  openingHours: string;
  isOpen: boolean;
  tags: string[];
};

type EstablishmentForm = {
  name: string;
  category: string;
  location: string;
  priceMin: string;
  priceMax: string;
  openingTime: string;
  closingTime: string;
  isOpen: boolean;
  tags: string[];
};

const CATEGORY_OPTIONS = [
  { value: "carinderia", label: "Carinderia" },
  { value: "cafeteria", label: "Cafeteria" },
  { value: "restaurant", label: "Restaurant" },
  { value: "food_stall", label: "Food Stall" },
  { value: "bakery", label: "Bakery" },
  { value: "milk_tea_shop", label: "Milk Tea Shop" },
  { value: "snack_house", label: "Snack House" },
];

const LOCATION_OPTIONS = [
  { value: "es_plaza", label: "ES Plaza" },
  { value: "street_food", label: "Street Food" },
  { value: "raymundo_gate", label: "Raymundo Gate" },
  { value: "vega_center", label: "Vega Center" },
  { value: "demarses", label: "Demarses" },
  { value: "fo_santos", label: "F.O. Santos" },
  { value: "agapita", label: "Agapita" },
  { value: "grove", label: "Grove" },
  { value: "lopez_avenue", label: "Lopez Avenue" },
  { value: "uplb_campus", label: "UPLB Campus" },
];

const TAG_OPTIONS = [
  "budget-friendly",
  "student-favorite",
  "near-campus",
  "near-gate",
  "affordable",
  "sulit",
  "popular",
  "quick-service",
  "cozy",
  "study-friendly",
];

const initialForm: EstablishmentForm = {
  name: "",
  category: "",
  location: "",
  priceMin: "",
  priceMax: "",
  openingTime: "",
  closingTime: "",
  isOpen: true,
  tags: [],
};

function formatLabel(value: string) {
  const specialCases: Record<string, string> = {
    es_plaza: "ES Plaza",
    street_food: "Street Food",
    milk_tea_shop: "Milk Tea Shop",
    food_stall: "Food Stall",
    raymundo_gate: "Raymundo Gate",
    fo_santos: "F.O. Santos",
    uplb_campus: "UPLB Campus",
    "near-campus": "Near Campus",
    "near-gate": "Near Gate",
    "quick-service": "Quick Service",
    "study-friendly": "Study Friendly",
    "student-favorite": "Student Favorite",
    "budget-friendly": "Budget Friendly",
  };

  if (specialCases[value]) return specialCases[value];

  return value
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatTime12Hour(time: string) {
  if (!time) return "";

  const [hourStr, minute] = time.split(":");
  const hour = Number(hourStr);
  const suffix = hour >= 12 ? "PM" : "AM";
  const normalizedHour = hour % 12 || 12;

  return `${normalizedHour}:${minute} ${suffix}`;
}

function parsePriceRange(priceRange: string) {
  const matches = priceRange.match(/\d+/g);
  if (!matches || matches.length < 2) {
    return { priceMin: "", priceMax: "" };
  }

  return {
    priceMin: matches[0] ?? "",
    priceMax: matches[1] ?? "",
  };
}

function parseOpeningHours(openingHours: string) {
  if (!openingHours || openingHours.toLowerCase() === "closed") {
    return {
      openingTime: "",
      closingTime: "",
    };
  }

  const match = openingHours.match(
    /(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i
  );

  if (!match) {
    return {
      openingTime: "",
      closingTime: "",
    };
  }

  const [, openHour, openMinute, openSuffix, closeHour, closeMinute, closeSuffix] =
    match;

  const to24Hour = (hourStr: string, minuteStr: string, suffix: string) => {
    let hour = Number(hourStr);

    if (suffix.toUpperCase() === "AM") {
      if (hour === 12) hour = 0;
    } else {
      if (hour !== 12) hour += 12;
    }

    return `${String(hour).padStart(2, "0")}:${minuteStr}`;
  };

  return {
    openingTime: to24Hour(openHour, openMinute, openSuffix),
    closingTime: to24Hour(closeHour, closeMinute, closeSuffix),
  };
}

export default function AdminEstablishmentsPage() {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<EstablishmentForm>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [successOpen, setSuccessOpen] = useState(false);
  const [successMode, setSuccessMode] = useState<"create" | "update">("create");

  async function fetchEstablishments() {
    try {
      const res = await fetch("/api/admin/establishments");
      const data = await res.json();
      setEstablishments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch establishments:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEstablishments();
  }, []);

  function toggleTag(tag: string) {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((item) => item !== tag)
        : [...prev.tags, tag],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSubmitting(true);

      const min = Number(form.priceMin);
      const max = Number(form.priceMax);

      if (!form.priceMin || !form.priceMax || Number.isNaN(min) || Number.isNaN(max)) {
        throw new Error("Please enter a valid minimum and maximum price.");
      }

      if (min > max) {
        throw new Error("Minimum price cannot be higher than maximum price.");
      }

      const payload = {
        name: form.name,
        category: form.category,
        location: form.location,
        priceRange: `₱${min} - ₱${max}`,
        openingHours: form.isOpen

          ? "Closed"
          : `${formatTime12Hour(form.openingTime)} - ${formatTime12Hour(
              form.closingTime
            )}`,
        isOpen: form.isOpen,
        tags: form.tags,
      };

      const url = editingId
        ? `/api/admin/establishments/${editingId}`
        : "/api/admin/establishments";

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.message ||
            (editingId
              ? "Failed to update establishment"
              : "Failed to create establishment")
        );
      }

      const mode = editingId ? "update" : "create";

      setForm(initialForm);
      setEditingId(null);
      await fetchEstablishments();

      setSuccessMode(mode);
      setSuccessOpen(true);
    } catch (error: any) {
      console.error(error);
      alert(
        error.message || "Something went wrong while saving the establishment."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(item: Establishment) {
    const { priceMin, priceMax } = parsePriceRange(item.priceRange);
    const { openingTime, closingTime} = parseOpeningHours(
      item.openingHours
    );

    setForm({
      name: item.name,
      category: item.category,
      location: item.location,
      priceMin,
      priceMax,
      openingTime,
      closingTime,
      isOpen: item.isOpen,
      tags: item.tags ?? [],
    });

    setEditingId(item._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setForm(initialForm);
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Delete this establishment?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/establishments/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete establishment");
      }

      if (editingId === id) {
        handleCancelEdit();
      }

      fetchEstablishments();
    } catch (error) {
      console.error(error);
      alert("Failed to delete establishment.");
    }
  }

  const openCount = useMemo(
    () => establishments.filter((item) => item.isOpen).length,
    [establishments]
  );

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[28px] border border-white/60 bg-[linear-gradient(135deg,rgba(10,143,143,0.08),rgba(255,255,255,0.94),rgba(31,92,66,0.08))] p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
        <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-emerald-100/50 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-24 w-24 rounded-full bg-teal-100/40 blur-2xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0d3626]/10 bg-white/80 px-3 py-1.5 text-xs text-[#1f5c42] shadow-sm font-helvetica">
              <Sparkles className="h-3.5 w-3.5" />
              Establishment Management
            </div>

            <h1 className="mt-4 font-poppins text-3xl font-semibold tracking-[-0.03em] text-[#023030]">
              Establishments
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 font-helvetica">
              Add, update, and organize food places so student meal planning
              stays accurate, clean, and easy to manage.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-helvetica">
                Total
              </p>
              <p className="mt-1 font-poppins text-lg font-semibold text-[#023030]">
                {establishments.length}
              </p>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-helvetica">
                Open
              </p>
              <p className="mt-1 font-poppins text-lg font-semibold text-[#1f5c42]">
                {openCount}
              </p>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm col-span-2 sm:col-span-1">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-helvetica">
                Mode
              </p>
              <p className="mt-1 font-poppins text-lg font-semibold text-[#023030]">
                {editingId ? "Editing" : "Create"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-poppins text-xl font-semibold text-[#023030]">
              {editingId ? "Edit Establishment" : "Add New Establishment"}
            </h2>
            <p className="mt-1 text-sm text-slate-500 font-helvetica">
              Fill in the establishment details below.
            </p>
          </div>

          <div
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-helvetica ${
              editingId
                ? "bg-amber-50 text-amber-700"
                : "bg-emerald-50 text-[#1f5c42]"
            }`}
          >
            {editingId ? (
              <>
                <Pencil className="h-3.5 w-3.5" />
                Editing record
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                New record
              </>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.15em] text-slate-400 font-helvetica">
              Establishment Name
            </label>
            <div className="relative">
              <Store className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Isko Meals"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-[#fbfcfc] py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#1f5c42]/30 focus:bg-white focus:ring-4 focus:ring-emerald-50 font-helvetica"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.15em] text-slate-400 font-helvetica">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-[#fbfcfc] px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#1f5c42]/30 focus:bg-white focus:ring-4 focus:ring-emerald-50 font-helvetica"
              required
            >
              <option value="">Select a category</option>
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.15em] text-slate-400 font-helvetica">
              Location
            </label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-[#fbfcfc] py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#1f5c42]/30 focus:bg-white focus:ring-4 focus:ring-emerald-50 font-helvetica"
                required
              >
                <option value="">Select a location</option>
                {LOCATION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.15em] text-slate-400 font-helvetica">
              Status
            </label>
            <label className="inline-flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-[#fafcfb] px-4 py-3 text-sm text-slate-700 font-helvetica">
              <input
                type="checkbox"
                checked={form.isOpen}
                onChange={(e) => setForm({ ...form, isOpen: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-[#1f5c42] focus:ring-[#1f5c42]"
              />
              Currently Open
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.15em] text-slate-400 font-helvetica">
              Minimum Price
            </label>
            <div className="relative">
              <Wallet className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                min="0"
                placeholder="e.g. 50"
                value={form.priceMin}
                onChange={(e) => setForm({ ...form, priceMin: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-[#fbfcfc] py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#1f5c42]/30 focus:bg-white focus:ring-4 focus:ring-emerald-50 font-helvetica"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.15em] text-slate-400 font-helvetica">
              Maximum Price
            </label>
            <div className="relative">
              <Wallet className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                min="0"
                placeholder="e.g. 120"
                value={form.priceMax}
                onChange={(e) => setForm({ ...form, priceMax: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-[#fbfcfc] py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#1f5c42]/30 focus:bg-white focus:ring-4 focus:ring-emerald-50 font-helvetica"
                required
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-xs uppercase tracking-[0.15em] text-slate-400 font-helvetica">
              Opening Hours
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-helvetica">
                  Opens At
                </label>
                <div className="relative">
                  <Clock3 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="time"
                    value={form.openingTime}
                    onChange={(e) =>
                      setForm({ ...form, openingTime: e.target.value })
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-[#fbfcfc] py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 focus:border-[#1f5c42]/30 focus:bg-white focus:ring-4 focus:ring-emerald-50 font-helvetica"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-helvetica">
                  Closes At
                </label>
                <div className="relative">
                  <Clock3 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="time"
                    value={form.closingTime}
                    onChange={(e) =>
                      setForm({ ...form, closingTime: e.target.value })
                    }
              
                    className="w-full rounded-2xl border border-slate-200 bg-[#fbfcfc] py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 focus:border-[#1f5c42]/30 focus:bg-white focus:ring-4 focus:ring-emerald-50 font-helvetica"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-xs uppercase tracking-[0.15em] text-slate-400 font-helvetica">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-[#fbfcfc] p-3">
              {TAG_OPTIONS.map((tag) => {
                const checked = form.tags.includes(tag);

                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-helvetica transition ${
                      checked
                        ? "border-emerald-200 bg-emerald-50 text-[#1f5c42]"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {formatLabel(tag)}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 font-helvetica">
              Select tags that best describe the establishment.
            </p>
          </div>

          <div className="md:col-span-2 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#0a8f8f_0%,#046d6d_45%,#033f3f_90%,#022b2b_100%)] px-5 py-3 text-sm font-medium text-white shadow-[0_12px_26px_rgba(2,48,48,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(2,48,48,0.3)] disabled:cursor-not-allowed disabled:opacity-60 font-helvetica"
            >
              {editingId ? (
                <>
                  <Pencil className="h-4 w-4" />
                  Save Changes
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Establishment
                </>
              )}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 font-helvetica"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-2 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-poppins text-xl font-semibold text-[#023030]">
              All Establishments
            </h2>
            <p className="mt-1 text-sm text-slate-500 font-helvetica">
              Review and manage all food locations in the system.
            </p>
          </div>

          <div className="rounded-full bg-slate-50 px-3 py-1.5 text-xs text-slate-500 font-helvetica">
            {establishments.length} total records
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-14 text-center">
              <p className="font-poppins text-lg font-medium text-[#023030]">
                Loading establishments...
              </p>
              <p className="mt-2 text-sm text-slate-500 font-helvetica">
                Please wait while SARI fetches your records.
              </p>
            </div>
          ) : establishments.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-[#1f5c42]">
                <Store className="h-6 w-6" />
              </div>
              <p className="mt-4 font-poppins text-lg font-medium text-[#023030]">
                No establishments yet
              </p>
              <p className="mt-2 text-sm text-slate-500 font-helvetica">
                Add your first establishment to start building your admin data.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {establishments.map((item) => (
                <div
                  key={item._id}
                  className="group rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#fbfcfc)] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(15,23,42,0.06)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-poppins text-lg font-semibold text-[#023030]">
                          {item.name}
                        </h3>

                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-helvetica ${
                            item.isOpen
                              ? "bg-emerald-50 text-[#1f5c42]"
                              : "bg-rose-50 text-rose-600"
                          }`}
                        >
                          {item.isOpen ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5" />
                          )}
                          {item.isOpen ? "Open" : "Closed"}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-slate-500 font-helvetica">
                        {formatLabel(item.category)}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-1">
                      <button
                        onClick={() => handleEdit(item)}
                        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-black transition hover:bg-amber-100 font-helvetica"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(item._id)}
                        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-100 font-helvetica"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-[#f8fbfa] p-3">
                      <div className="flex items-center gap-2 text-slate-400">
                        <MapPin className="h-4 w-4" />
                        <span className="text-[11px] uppercase tracking-[0.14em] font-helvetica">
                          Location
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-700 font-helvetica">
                        {formatLabel(item.location)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#f8fbfa] p-3">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Wallet className="h-4 w-4" />
                        <span className="text-[11px] uppercase tracking-[0.14em] font-helvetica">
                          Price Range
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-700 font-helvetica">
                        {item.priceRange}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#f8fbfa] p-3 sm:col-span-2">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Clock3 className="h-4 w-4" />
                        <span className="text-[11px] uppercase tracking-[0.14em] font-helvetica">
                          Opening Hours
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-700 font-helvetica">
                        {item.openingHours}
                      </p>
                    </div>
                  </div>

                  {item.tags?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.tags.map((tag, index) => (
                        <span
                          key={`${tag}-${index}`}
                          className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs text-[#1f5c42] font-helvetica"
                        >
                          {formatLabel(tag)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {successOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#023030]/25 px-4 backdrop-blur-sm"
          onClick={() => setSuccessOpen(false)}
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(244,251,249,0.98)_100%)] p-6 shadow-[0_24px_80px_rgba(2,48,48,0.22)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-100/70 blur-3xl" />
            <div className="pointer-events-none absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-teal-100/60 blur-2xl" />

            <div className="relative">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,#dcfce7_0%,#d1fae5_45%,#ccfbf1_100%)] shadow-inner">
                <CheckCircle2 className="h-8 w-8 text-[#1f5c42]" />
              </div>

              <div className="mt-5 text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#0d3626]/10 bg-white/80 px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-[#1f5c42] shadow-sm font-helvetica">
                  Success
                </div>

                <h3 className="mt-4 font-poppins text-2xl font-semibold tracking-[-0.03em] text-[#023030]">
                  {successMode === "create"
                    ? "Establishment added successfully"
                    : "Establishment updated successfully"}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600 font-helvetica">
                  {successMode === "create"
                    ? "The new establishment has been added to your SARI database."
                    : "Your establishment changes have been saved successfully."}
                </p>
              </div>

              <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm text-[#1f5c42] font-helvetica">
                {successMode === "create"
                  ? "You can add another establishment or review it in the list below."
                  : "The updated establishment record is now reflected in your list."}
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => setSuccessOpen(false)}
                  className="inline-flex items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0a8f8f_0%,#046d6d_45%,#033f3f_90%,#022b2b_100%)] px-6 py-3 text-sm font-medium text-white shadow-[0_12px_26px_rgba(2,48,48,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(2,48,48,0.3)] font-helvetica"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}