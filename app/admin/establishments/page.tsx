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
  priceRange: string;
  openingHours: string;
  isOpen: boolean;
  tags: string;
};

const initialForm: EstablishmentForm = {
  name: "",
  category: "",
  location: "",
  priceRange: "",
  openingHours: "",
  isOpen: true,
  tags: "",
};

export default function AdminEstablishmentsPage() {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<EstablishmentForm>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSubmitting(true);

      const payload = {
        ...form,
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
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

      if (!res.ok) {
        throw new Error(
          editingId
            ? "Failed to update establishment"
            : "Failed to create establishment"
        );
      }

      setForm(initialForm);
      setEditingId(null);
      fetchEstablishments();
    } catch (error) {
      console.error(error);
      alert("Something went wrong while saving the establishment.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(item: Establishment) {
    setForm({
      name: item.name,
      category: item.category,
      location: item.location,
      priceRange: item.priceRange,
      openingHours: item.openingHours,
      isOpen: item.isOpen,
      tags: item.tags.join(", "),
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
      {/* Header */}
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

      {/* Form */}
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
            <input
              type="text"
              placeholder="e.g. Carinderia, Cafe, Stall"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-[#fbfcfc] px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#1f5c42]/30 focus:bg-white focus:ring-4 focus:ring-emerald-50 font-helvetica"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.15em] text-slate-400 font-helvetica">
              Location
            </label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. UPLB Campus"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-[#fbfcfc] py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#1f5c42]/30 focus:bg-white focus:ring-4 focus:ring-emerald-50 font-helvetica"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.15em] text-slate-400 font-helvetica">
              Price Range
            </label>
            <div className="relative">
              <Wallet className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. ₱50 - ₱120"
                value={form.priceRange}
                onChange={(e) => setForm({ ...form, priceRange: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-[#fbfcfc] py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#1f5c42]/30 focus:bg-white focus:ring-4 focus:ring-emerald-50 font-helvetica"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.15em] text-slate-400 font-helvetica">
              Opening Hours
            </label>
            <div className="relative">
              <Clock3 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. 8:00 AM - 7:00 PM"
                value={form.openingHours}
                onChange={(e) =>
                  setForm({ ...form, openingHours: e.target.value })
                }
                className="w-full rounded-2xl border border-slate-200 bg-[#fbfcfc] py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#1f5c42]/30 focus:bg-white focus:ring-4 focus:ring-emerald-50 font-helvetica"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.15em] text-slate-400 font-helvetica">
              Tags
            </label>
            <div className="relative">
              <Tags className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="budget-friendly, near gate, student favorite"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-[#fbfcfc] py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#1f5c42]/30 focus:bg-white focus:ring-4 focus:ring-emerald-50 font-helvetica"
              />
            </div>
          </div>

          <div className="md:col-span-2 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#fafcfb] px-4 py-3 text-sm text-slate-700 font-helvetica">
              <input
                type="checkbox"
                checked={form.isOpen}
                onChange={(e) => setForm({ ...form, isOpen: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-[#1f5c42] focus:ring-[#1f5c42]"
              />
              Currently Open
            </label>

            <div className="flex flex-wrap gap-3">
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
          </div>
        </form>
      </section>

      {/* List */}
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
                        {item.category}
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
                        {item.location}
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
                          {tag}
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
    </div>
  );
}