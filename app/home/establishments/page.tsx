"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Clock3,
  PhilippinePeso,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GlassSelect } from "@/components/ui/glass-select";

type Establishment = {
  _id: string;
  name: string;
  category: string;
  location: string;
  priceRange: string;
  openingHours?: string;
  isOpen?: boolean;
  tags?: string[];
};

type SortOption =
  | "name-asc"
  | "name-desc"
  | "price-low-high"
  | "price-high-low"
  | "open-first";

function formatLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function parsePriceRange(priceRange: string) {
  const matches = priceRange.match(/\d+/g);

  if (!matches || matches.length === 0) {
    return { min: Number.POSITIVE_INFINITY, max: Number.POSITIVE_INFINITY };
  }

  const nums = matches.map(Number);

  return {
    min: nums[0] ?? Number.POSITIVE_INFINITY,
    max: nums[1] ?? nums[0] ?? Number.POSITIVE_INFINITY,
  };
}

export default function AllEstablishmentsPage() {
  const [establishments, setEstablishments] = React.useState<Establishment[]>(
    []
  );
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [selectedLocation, setSelectedLocation] = React.useState("all");
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [sortBy, setSortBy] = React.useState<SortOption>("name-asc");

  React.useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/establishments");
        const data = await res.json();

        if (data.ok) {
          setEstablishments(data.establishments ?? []);
        }
      } catch (error) {
        console.error("Failed to load establishments:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const locations = React.useMemo(() => {
    return Array.from(
      new Set(establishments.map((e) => e.location).filter(Boolean))
    ).sort();
  }, [establishments]);

  const categories = React.useMemo(() => {
    return Array.from(
      new Set(establishments.map((e) => e.category).filter(Boolean))
    ).sort();
  }, [establishments]);

  const locationOptions = React.useMemo(
    () => [
      { value: "all", label: "All locations" },
      ...locations.map((location) => ({
        value: location,
        label: formatLabel(location),
      })),
    ],
    [locations]
  );

  const categoryOptions = React.useMemo(
    () => [
      { value: "all", label: "All categories" },
      ...categories.map((category) => ({
        value: category,
        label: formatLabel(category),
      })),
    ],
    [categories]
  );

  const sortOptions = React.useMemo(
    () => [
      { value: "name-asc", label: "Name: A to Z" },
      { value: "name-desc", label: "Name: Z to A" },
      { value: "price-low-high", label: "Price: Low to High" },
      { value: "price-high-low", label: "Price: High to Low" },
      { value: "open-first", label: "Open now first" },
    ],
    []
  );

  const filteredAndSortedEstablishments = React.useMemo(() => {
    const filtered = establishments.filter((est) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        est.name.toLowerCase().includes(searchValue) ||
        est.location.toLowerCase().includes(searchValue) ||
        est.category.toLowerCase().includes(searchValue) ||
        (est.tags ?? []).some((tag) => tag.toLowerCase().includes(searchValue));

      const matchesLocation =
        selectedLocation === "all" || est.location === selectedLocation;

      const matchesCategory =
        selectedCategory === "all" || est.category === selectedCategory;

      return matchesSearch && matchesLocation && matchesCategory;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);

      if (sortBy === "price-low-high") {
        return (
          parsePriceRange(a.priceRange).min - parsePriceRange(b.priceRange).min
        );
      }

      if (sortBy === "price-high-low") {
        return (
          parsePriceRange(b.priceRange).min - parsePriceRange(a.priceRange).min
        );
      }

      if (sortBy === "open-first") {
        return Number(b.isOpen ?? false) - Number(a.isOpen ?? false);
      }

      return 0;
    });

    return sorted;
  }, [establishments, search, selectedLocation, selectedCategory, sortBy]);

  const hasActiveFilters =
    search.trim() !== "" ||
    selectedLocation !== "all" ||
    selectedCategory !== "all" ||
    sortBy !== "name-asc";

  function clearFilters() {
    setSearch("");
    setSelectedLocation("all");
    setSelectedCategory("all");
    setSortBy("name-asc");
  }

  return (
    <div
      className="min-h-screen text-[#023030]"
      style={{
        background:
          "radial-gradient(circle at top right, rgba(204,255,232,0.82) 0%, rgba(204,255,232,0) 24%), radial-gradient(circle at bottom left, rgba(227,242,253,0.9) 0%, rgba(227,242,253,0) 30%), linear-gradient(180deg, #f8fcfc 0%, #eef7f7 100%)",
      }}
    >
      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 lg:px-12 lg:py-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[32px] border border-white/50 bg-white/50 p-6 shadow-[0_16px_50px_rgba(2,48,48,0.08)] backdrop-blur-2xl md:p-8"
        >
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.45),rgba(255,255,255,0.08))]" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <Link
                href="/home"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#026d6d] transition hover:text-[#023030]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </Link>

              {/* <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/50 bg-[#FBE1AD]/75 px-3.5 py-1.5 text-xs font-medium text-[#025a5a] shadow-sm backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" />
                Discover food spots around Elbi
              </div> */}

              <h1 className="font-poppins mt-4 text-3xl font-semibold tracking-[-0.02em] text-[#023030] md:text-4xl">
                Browse all establishments
              </h1>

              <p className="font-helvetica mt-3 max-w-xl text-sm leading-6 text-[#023030]/68 md:text-[15px]">
                Explore nearby kainan, compare price ranges, and find spots that
                match your budget, cravings, and usual campus route.
              </p>
            </div>

            <div className="relative rounded-[24px] border border-white/50 bg-white/60 px-5 py-4 shadow-[0_8px_24px_rgba(2,48,48,0.06)] backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.18em] text-[#023030]/45">
                Showing
              </p>
              <p className="font-poppins mt-1 text-2xl font-semibold text-[#023030]">
                {filteredAndSortedEstablishments.length}
              </p>
              <p className="text-sm text-[#023030]/60">food spots</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative mt-6 overflow-hidden"
        >
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.42),rgba(255,255,255,0.08))]" />

          <div className="relative">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#f6fbfb] px-3 py-1.5 text-sm font-medium text-[#023030]/75 ring-1 ring-[#023030]/6">
                <SlidersHorizontal className="h-4 w-4 text-[#026d6d]" />
                Filters and sorting
              </div>

              <Button
                type="button"
                variant="ghost"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="rounded-2xl px-4 text-[#026d6d] hover:bg-white/50 hover:text-[#023030]"
              >
                Clear all
              </Button>
            </div>

            <div className="grid gap-3 lg:grid-cols-[1.35fr_0.55fr_0.55fr_0.6fr]">
              <div className="relative h-12 overflow-hidden rounded-2xl border border-white/50 bg-white/55 shadow-[0_8px_24px_rgba(2,48,48,0.06)] backdrop-blur-xl transition hover:bg-white/62 focus-within:border-[#026d6d]/35 focus-within:shadow-[0_10px_28px_rgba(2,48,48,0.10)]">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#023030]/45" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, location, category, or tag"
                  className="h-full border-0 bg-transparent pl-11 pr-4 text-sm text-[#023030] placeholder:text-[#023030]/42 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>

              <GlassSelect
                value={selectedLocation}
                onValueChange={setSelectedLocation}
                options={locationOptions}
                placeholder="All locations"
              />

              <GlassSelect
                value={selectedCategory}
                onValueChange={setSelectedCategory}
                options={categoryOptions}
                placeholder="All categories"
              />

              <GlassSelect
                value={sortBy}
                onValueChange={(value) => setSortBy(value as SortOption)}
                options={sortOptions}
                placeholder="Sort by"
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#f4fbfb] px-3 py-1.5 text-xs text-[#023030]/70 ring-1 ring-[#023030]/6">
                <ArrowUpDown className="h-3.5 w-3.5 text-[#026d6d]" />
                Sorted by:
                <span className="font-medium text-[#023030]">
                  {sortBy === "name-asc" && "Name A–Z"}
                  {sortBy === "name-desc" && "Name Z–A"}
                  {sortBy === "price-low-high" && "Lowest price"}
                  {sortBy === "price-high-low" && "Highest price"}
                  {sortBy === "open-first" && "Open now first"}
                </span>
              </div>

              {selectedLocation !== "all" && (
                <div className="rounded-full bg-white/70 px-3 py-1.5 text-xs text-[#023030]/75 ring-1 ring-[#023030]/6">
                  Location:{" "}
                  <span className="font-medium text-[#023030]">
                    {formatLabel(selectedLocation)}
                  </span>
                </div>
              )}

              {selectedCategory !== "all" && (
                <div className="rounded-full bg-white/70 px-3 py-1.5 text-xs text-[#023030]/75 ring-1 ring-[#023030]/6">
                  Category:{" "}
                  <span className="font-medium text-[#023030]">
                    {formatLabel(selectedCategory)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="mt-6 rounded-[30px] border border-white/50 bg-white/50 p-8 shadow-[0_12px_32px_rgba(2,48,48,0.06)] backdrop-blur-2xl">
            <p className="font-poppins text-lg font-semibold text-[#023030]">
              Loading establishments...
            </p>
            <p className="mt-2 text-sm text-[#023030]/60">
              Gathering food spots around campus for you.
            </p>
          </div>
        ) : filteredAndSortedEstablishments.length === 0 ? (
          <div className="mt-6 rounded-[30px] border border-white/50 bg-white/50 p-10 text-center shadow-[0_12px_32px_rgba(2,48,48,0.06)] backdrop-blur-2xl">
            <p className="font-poppins text-xl font-semibold text-[#023030]">
              No establishments found
            </p>
            <p className="mt-2 text-sm text-[#023030]/62">
              Try changing your search term, category, location, or sorting.
            </p>

            <Button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-2xl bg-[#023030] px-5 text-white hover:bg-[#034646]"
            >
              Reset filters
            </Button>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredAndSortedEstablishments.map((est, index) => (
              <motion.article
                key={est._id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="group relative overflow-hidden rounded-[30px] border border-white/50 bg-white/52 p-5 shadow-[0_12px_34px_rgba(2,48,48,0.07)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_46px_rgba(2,48,48,0.12)]"
              >
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.42),rgba(255,255,255,0.08))]" />

                <div className="relative">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-poppins truncate text-xl font-semibold tracking-[-0.01em] text-[#023030]">
                        {est.name}
                      </h2>

                      <div className="mt-1.5 flex items-center gap-1.5 text-sm text-[#023030]/62">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-[#026d6d]" />
                        <span className="truncate">
                          {formatLabel(est.location)}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 rounded-full border border-white/50 bg-[#EAF6F6]/88 px-3 py-1.5 text-[11px] font-medium text-[#025a5a] backdrop-blur-md">
                      {formatLabel(est.category)}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#f7fcfc] px-3 py-2 ring-1 ring-[#023030]/6">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E6F4F1] text-[#026d6d]">
                        <PhilippinePeso className="h-4 w-4" />
                      </span>
                      <span className="text-sm font-medium text-[#023030]">
                        {est.priceRange}
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full bg-[#f7fcfc] px-3 py-2 ring-1 ring-[#023030]/6">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E6F1F7] text-[#026d6d]">
                        <Clock3 className="h-4 w-4" />
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          est.openingHours
                            ? "text-[#023030]"
                            : "italic text-[#023030]/42"
                        }`}
                      >
                        {est.openingHours || "Hours not available"}
                      </span>
                    </div>
                  </div>

                  {!!est.tags?.length && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {est.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/50 bg-white/72 px-3 py-1 text-xs font-medium text-[#023030]/74 backdrop-blur-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-5">
                    <Link
                      href={`/home/establishments/${est._id}`}
                      className="font-poppins inline-flex w-full items-center justify-center rounded-2xl bg-[#023030] px-4 py-3 text-sm font-medium text-white transition duration-200 hover:bg-[#034646]"
                    >
                      View establishment
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}