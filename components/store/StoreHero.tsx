"use client";

import Link from "next/link";
import { IconSearch, IconTruck } from "@tabler/icons-react";
import { SearchBar } from "./SearchBar";

const QUICK_CATEGORIES = [
  { label: "Suspension", href: "/store/categories/suspension" },
  { label: "Brakes", href: "/store/categories/brakes" },
  { label: "Exhaust", href: "/store/categories/exhaust" },
  { label: "Wheels & Tires", href: "/store/categories/wheels-tires" },
  { label: "Lighting", href: "/store/categories/lighting" },
  { label: "Engine", href: "/store/categories/engine" },
];

export function StoreHero() {
  return (
    <section className="bg-gradient-to-br from-[#077BFF] via-[#0565D4] to-[#044AAF] pt-32 pb-12 md:pt-40 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Free shipping callout */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <IconTruck size={18} className="text-blue-200" />
          <span className="text-blue-100 text-sm font-medium">
            Free shipping on orders over $99
          </span>
        </div>

        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-white mb-3 tracking-tight">
            Quality Parts, Delivered
          </h1>
          <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto">
            Thousands of parts from top brands. Find exactly what your build needs.
          </p>
        </div>

        {/* Prominent search bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const input = (e.currentTarget as HTMLFormElement).querySelector("input");
              if (input?.value.trim()) {
                window.location.href = `/store/search?q=${encodeURIComponent(input.value.trim())}`;
              }
            }}
            className="relative"
          >
            <IconSearch
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by part name, number, or brand..."
              className="w-full pl-12 pr-32 py-4 rounded-xl text-base text-gray-900 placeholder-gray-400 bg-white shadow-xl focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-[#077BFF] text-white text-sm font-semibold rounded-lg hover:bg-[#0565D4] transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Quick category pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-blue-200 text-sm mr-1">Browse:</span>
          {QUICK_CATEGORIES.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="px-4 py-1.5 bg-white/15 hover:bg-white/25 text-white text-sm font-medium rounded-full border border-white/20 transition-colors"
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
