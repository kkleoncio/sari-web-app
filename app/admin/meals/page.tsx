"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Beef,
  CircleDollarSign,
  Clock3,
  Flame,
  Leaf,
  Pencil,
  Plus,
  ShieldAlert,
  Soup,
  Sparkles,
  Store,
  Tag,
  Trash2,
  UtensilsCrossed,
  CheckCircle2,
  XCircle,
  MapPin,
  HeartPulse,
} from "lucide-react";

type Establishment = {
  _id: string;
  name: string;
  category: string;
  location: string;
};

type Meal = {
  _id: string;
  mealName: string;
  foodType: string;
  category: string;
  price: number;
  establishmentName: string;
  establishmentCategory: string;
  location: string;
  mealTime: string[];
  healthScore: number;
  isFried: boolean;
  isSoup: boolean;
  isVegetarian: boolean;
  tags: string[];
  allergens: string[];
  isAvailable: boolean;
};

type MealForm = {
  mealName: string;
  foodType: string;
  category: string;
  price: string;
  establishmentId: string;
  mealTime: string;
  healthScore: string;
  isFried: boolean;
  isSoup: boolean;
  isVegetarian: boolean;
  tags: string;
  allergens: string;
  isAvailable: boolean;
};

const initialForm: MealForm = {
  mealName: "",
  foodType: "",
  category: "",
  price: "",
  establishmentId: "",
  mealTime: "",
  healthScore: "5",
  isFried: false,
  isSoup: false,
  isVegetarian: false,
  tags: "",
  allergens: "",
  isAvailable: true,
};

export default function AdminMealsPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<MealForm>(initialForm);
  const [editingMealId, setEditingMealId] = useState<string | null>(null);

  async function fetchMeals() {
    try {
      const res = await fetch("/api/admin/meals");
      const data = await res.json();
      setMeals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch meals:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchEstablishments() {
    try {
      const res = await fetch("/api/admin/establishments");
      const data = await res.json();
      setEstablishments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch establishments:", error);
    }
  }

  useEffect(() => {
    fetchMeals();
    fetchEstablishments();
  }, []);

  const selectedEstablishment = useMemo(() => {
    return establishments.find((est) => est._id === form.establishmentId);
  }, [form.establishmentId, establishments]);

  const availableCount = useMemo(
    () => meals.filter((meal) => meal.isAvailable).length,
    [meals]
  );

  const vegetarianCount = useMemo(
    () => meals.filter((meal) => meal.isVegetarian).length,
    [meals]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedEstablishment) {
      alert("Please select an establishment.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        mealName: form.mealName,
        foodType: form.foodType,
        category: form.category,
        price: Number(form.price),
        establishmentName: selectedEstablishment.name,
        establishmentCategory: selectedEstablishment.category,
        location: selectedEstablishment.location,
        mealTime: form.mealTime
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        healthScore: Number(form.healthScore),
        isFried: form.isFried,
        isSoup: form.isSoup,
        isVegetarian: form.isVegetarian,
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        allergens: form.allergens
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        isAvailable: form.isAvailable,
      };

      const url = editingMealId
        ? `/api/admin/meals/${editingMealId}`
        : "/api/admin/meals";

      const method = editingMealId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(
          editingMealId ? "Failed to update meal" : "Failed to create meal"
        );
      }

      setForm(initialForm);
      setEditingMealId(null);
      fetchMeals();
    } catch (error) {
      console.error(error);
      alert("Something went wrong while saving the meal.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(meal: Meal) {
    const matchedEstablishment = establishments.find(
      (est) =>
        est.name === meal.establishmentName &&
        est.category === meal.establishmentCategory &&
        est.location === meal.location
    );

    setForm({
      mealName: meal.mealName,
      foodType: meal.foodType,
      category: meal.category,
      price: String(meal.price),
      establishmentId: matchedEstablishment?._id || "",
      mealTime: meal.mealTime.join(", "),
      healthScore: String(meal.healthScore),
      isFried: meal.isFried,
      isSoup: meal.isSoup,
      isVegetarian: meal.isVegetarian,
      tags: meal.tags.join(", "),
      allergens: meal.allergens.join(", "),
      isAvailable: meal.isAvailable,
    });

    setEditingMealId(meal._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setForm(initialForm);
    setEditingMealId(null);
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Delete this meal?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/meals/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete meal");
      }

      if (editingMealId === id) {
        handleCancelEdit();
      }

      fetchMeals();
    } catch (error) {
      console.error(error);
      alert("Failed to delete meal.");
    }
  }

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
              Meal Management
            </div>

            <h1 className="mt-4 font-poppins text-3xl font-semibold tracking-[-0.03em] text-[#023030]">
              Meals
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 font-helvetica">
              Manage menu records, food categories, pricing, and meal attributes
              to keep SARI recommendations accurate and useful.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-helvetica">
                Total
              </p>
              <p className="mt-1 font-poppins text-lg font-semibold text-[#023030]">
                {meals.length}
              </p>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-helvetica">
                Available
              </p>
              <p className="mt-1 font-poppins text-lg font-semibold text-[#1f5c42]">
                {availableCount}
              </p>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm col-span-2 sm:col-span-1">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-helvetica">
                Vegetarian
              </p>
              <p className="mt-1 font-poppins text-lg font-semibold text-[#023030]">
                {vegetarianCount}
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
              {editingMealId ? "Edit Meal" : "Add New Meal"}
            </h2>
            <p className="mt-1 text-sm text-slate-500 font-helvetica">
              Complete the meal details and link it to an establishment.
            </p>
          </div>

          <div
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-helvetica ${
              editingMealId
                ? "bg-amber-50 text-amber-700"
                : "bg-emerald-50 text-[#1f5c42]"
            }`}
          >
            {editingMealId ? (
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
              Meal Name
            </label>
            <div className="relative">
              <UtensilsCrossed className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Chicken Adobo"
                value={form.mealName}
                onChange={(e) => setForm({ ...form, mealName: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-[#fbfcfc] py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#1f5c42]/30 focus:bg-white focus:ring-4 focus:ring-emerald-50 font-helvetica"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.15em] text-slate-400 font-helvetica">
              Food Type
            </label>
            <div className="relative">
              <Beef className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Rice Meal, Snack, Drink"
                value={form.foodType}
                onChange={(e) => setForm({ ...form, foodType: e.target.value })}
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
              placeholder="e.g. Main Dish"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-[#fbfcfc] px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#1f5c42]/30 focus:bg-white focus:ring-4 focus:ring-emerald-50 font-helvetica"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.15em] text-slate-400 font-helvetica">
              Price
            </label>
            <div className="relative">
              <CircleDollarSign className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                placeholder="e.g. 85"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-[#fbfcfc] py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#1f5c42]/30 focus:bg-white focus:ring-4 focus:ring-emerald-50 font-helvetica"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.15em] text-slate-400 font-helvetica">
              Establishment
            </label>
            <div className="relative">
              <Store className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={form.establishmentId}
                onChange={(e) =>
                  setForm({ ...form, establishmentId: e.target.value })
                }
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-[#fbfcfc] py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#1f5c42]/30 focus:bg-white focus:ring-4 focus:ring-emerald-50 font-helvetica"
                required
              >
                <option value="">Select Establishment</option>
                {establishments.map((est) => (
                  <option key={est._id} value={est._id}>
                    {est.name} — {est.category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-[#f8fbfa] px-4 py-3 text-sm text-slate-600">
            {selectedEstablishment ? (
              <div className="space-y-2 font-helvetica">
                <p className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-slate-400" />
                  <span className="font-medium text-slate-700">Category:</span>
                  {selectedEstablishment.category}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span className="font-medium text-slate-700">Location:</span>
                  {selectedEstablishment.location}
                </p>
              </div>
            ) : (
              <p className="font-helvetica">
                Select an establishment to auto-fill its details.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.15em] text-slate-400 font-helvetica">
              Meal Time
            </label>
            <div className="relative">
              <Clock3 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="breakfast, lunch, dinner"
                value={form.mealTime}
                onChange={(e) => setForm({ ...form, mealTime: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-[#fbfcfc] py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#1f5c42]/30 focus:bg-white focus:ring-4 focus:ring-emerald-50 font-helvetica"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.15em] text-slate-400 font-helvetica">
              Health Score
            </label>
            <div className="relative">
              <HeartPulse className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                min="1"
                max="10"
                placeholder="1 - 10"
                value={form.healthScore}
                onChange={(e) =>
                  setForm({ ...form, healthScore: e.target.value })
                }
                className="w-full rounded-2xl border border-slate-200 bg-[#fbfcfc] py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#1f5c42]/30 focus:bg-white focus:ring-4 focus:ring-emerald-50 font-helvetica"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.15em] text-slate-400 font-helvetica">
              Tags
            </label>
            <div className="relative">
              <Tag className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="budget, student-favorite, heavy meal"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-[#fbfcfc] py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#1f5c42]/30 focus:bg-white focus:ring-4 focus:ring-emerald-50 font-helvetica"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.15em] text-slate-400 font-helvetica">
              Allergens
            </label>
            <div className="relative">
              <ShieldAlert className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="nuts, dairy, shellfish"
                value={form.allergens}
                onChange={(e) =>
                  setForm({ ...form, allergens: e.target.value })
                }
                className="w-full rounded-2xl border border-slate-200 bg-[#fbfcfc] py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#1f5c42]/30 focus:bg-white focus:ring-4 focus:ring-emerald-50 font-helvetica"
              />
            </div>
          </div>

          <div className="md:col-span-2 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#fafcfb] px-4 py-3 text-sm text-slate-700 font-helvetica">
              <input
                type="checkbox"
                checked={form.isFried}
                onChange={(e) => setForm({ ...form, isFried: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300"
              />
              <Flame className="h-4 w-4 text-amber-500" />
              Fried
            </label>

            <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#fafcfb] px-4 py-3 text-sm text-slate-700 font-helvetica">
              <input
                type="checkbox"
                checked={form.isSoup}
                onChange={(e) => setForm({ ...form, isSoup: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300"
              />
              <Soup className="h-4 w-4 text-sky-500" />
              Soup
            </label>

            <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#fafcfb] px-4 py-3 text-sm text-slate-700 font-helvetica">
              <input
                type="checkbox"
                checked={form.isVegetarian}
                onChange={(e) =>
                  setForm({ ...form, isVegetarian: e.target.checked })
                }
                className="h-4 w-4 rounded border-slate-300"
              />
              <Leaf className="h-4 w-4 text-emerald-600" />
              Vegetarian
            </label>

            <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#fafcfb] px-4 py-3 text-sm text-slate-700 font-helvetica">
              <input
                type="checkbox"
                checked={form.isAvailable}
                onChange={(e) =>
                  setForm({ ...form, isAvailable: e.target.checked })
                }
                className="h-4 w-4 rounded border-slate-300"
              />
              <CheckCircle2 className="h-4 w-4 text-[#1f5c42]" />
              Available
            </label>
          </div>

          <div className="md:col-span-2 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#0a8f8f_0%,#046d6d_45%,#033f3f_90%,#022b2b_100%)] px-5 py-3 text-sm font-medium text-white shadow-[0_12px_26px_rgba(2,48,48,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(2,48,48,0.3)] disabled:cursor-not-allowed disabled:opacity-60 font-helvetica"
            >
              {editingMealId ? (
                <>
                  <Pencil className="h-4 w-4" />
                  Save Changes
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Meal
                </>
              )}
            </button>

            {editingMealId && (
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

      {/* List */}
      <section className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-2 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-poppins text-xl font-semibold text-[#023030]">
              All Meals
            </h2>
            <p className="mt-1 text-sm text-slate-500 font-helvetica">
              Review and manage all meal records in the system.
            </p>
          </div>

          <div className="rounded-full bg-slate-50 px-3 py-1.5 text-xs text-slate-500 font-helvetica">
            {meals.length} total records
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-14 text-center">
              <p className="font-poppins text-lg font-medium text-[#023030]">
                Loading meals...
              </p>
              <p className="mt-2 text-sm text-slate-500 font-helvetica">
                Please wait while SARI fetches your meal records.
              </p>
            </div>
          ) : meals.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-[#1f5c42]">
                <UtensilsCrossed className="h-6 w-6" />
              </div>
              <p className="mt-4 font-poppins text-lg font-medium text-[#023030]">
                No meals yet
              </p>
              <p className="mt-2 text-sm text-slate-500 font-helvetica">
                Add your first meal entry to start building your meal database.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {meals.map((meal) => (
                <div
                  key={meal._id}
                  className="group rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#fbfcfc)] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(15,23,42,0.06)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-poppins text-lg font-semibold text-[#023030]">
                          {meal.mealName}
                        </h3>

                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-helvetica ${
                            meal.isAvailable
                              ? "bg-emerald-50 text-[#1f5c42]"
                              : "bg-rose-50 text-rose-600"
                          }`}
                        >
                          {meal.isAvailable ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5" />
                          )}
                          {meal.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-slate-500 font-helvetica">
                        {meal.establishmentName}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-1">
                      <button
                        onClick={() => handleEdit(meal)}
                        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-black transition hover:bg-amber-100 font-helvetica"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(meal._id)}
                        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-100 font-helvetica"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-[#f8fbfa] p-3">
                      <div className="flex items-center gap-2 text-slate-400">
                        <CircleDollarSign className="h-4 w-4" />
                        <span className="text-[11px] uppercase tracking-[0.14em] font-helvetica">
                          Price
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-700 font-helvetica">
                        PHP {meal.price}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#f8fbfa] p-3">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Beef className="h-4 w-4" />
                        <span className="text-[11px] uppercase tracking-[0.14em] font-helvetica">
                          Food Type
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-700 font-helvetica">
                        {meal.foodType}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#f8fbfa] p-3">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Tag className="h-4 w-4" />
                        <span className="text-[11px] uppercase tracking-[0.14em] font-helvetica">
                          Category
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-700 font-helvetica">
                        {meal.category}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#f8fbfa] p-3">
                      <div className="flex items-center gap-2 text-slate-400">
                        <HeartPulse className="h-4 w-4" />
                        <span className="text-[11px] uppercase tracking-[0.14em] font-helvetica">
                          Health Score
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-700 font-helvetica">
                        {meal.healthScore}/10
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#f8fbfa] p-3 sm:col-span-2">
                      <div className="flex items-center gap-2 text-slate-400">
                        <MapPin className="h-4 w-4" />
                        <span className="text-[11px] uppercase tracking-[0.14em] font-helvetica">
                          Location
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-700 font-helvetica">
                        {meal.location}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {meal.isFried && (
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-700 font-helvetica">
                        Fried
                      </span>
                    )}
                    {meal.isSoup && (
                      <span className="rounded-full bg-sky-50 px-3 py-1 text-xs text-sky-700 font-helvetica">
                        Soup
                      </span>
                    )}
                    {meal.isVegetarian && (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700 font-helvetica">
                        Vegetarian
                      </span>
                    )}
                    {meal.mealTime?.map((time, index) => (
                      <span
                        key={`${time}-${index}`}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 font-helvetica"
                      >
                        {time}
                      </span>
                    ))}
                  </div>

                  {meal.tags?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {meal.tags.map((tag, index) => (
                        <span
                          key={`${tag}-${index}`}
                          className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs text-[#1f5c42] font-helvetica"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {meal.allergens?.length > 0 && (
                    <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50/70 p-3">
                      <p className="text-xs uppercase tracking-[0.14em] text-rose-400 font-helvetica">
                        Allergens
                      </p>
                      <p className="mt-2 text-sm text-rose-700 font-helvetica">
                        {meal.allergens.join(", ")}
                      </p>
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