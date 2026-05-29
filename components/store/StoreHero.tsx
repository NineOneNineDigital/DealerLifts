import { IconSearch, IconTruck } from "@tabler/icons-react";
import Link from "next/link";

const QUICK_CATEGORIES = [
  { href: "/store/categories/suspension", label: "Suspension" },
  { href: "/store/categories/brakes", label: "Brakes" },
  { href: "/store/categories/exhaust", label: "Exhaust" },
  { href: "/store/categories/wheels-tires", label: "Wheels & Tires" },
  { href: "/store/categories/lighting", label: "Lighting" },
  { href: "/store/categories/engine", label: "Engine" },
];

export function StoreHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#077BFF] via-[#0565D4] to-[#044AAF] pt-32 pb-12 md:pt-40 md:pb-16">
      {/* Subtle pattern overlay for depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Free shipping callout */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <IconTruck className="text-blue-200" size={18} />
          <span className="font-medium text-blue-100 text-sm">
            Free shipping on orders over $99
          </span>
        </div>

        <div className="mb-8 text-center">
          <h1 className="mb-3 font-bold font-heading text-4xl text-white tracking-tight md:text-6xl">
            Quality Parts, Delivered
          </h1>
          <p className="mx-auto max-w-2xl text-blue-100 text-lg md:text-xl">
            Thousands of parts from top brands. Find exactly what your build
            needs.
          </p>
        </div>

        {/* Search */}
        <form action="/store/search" className="relative mx-auto mb-8 max-w-2xl" method="get">
          <IconSearch
            className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-4 text-gray-400"
            size={20}
          />
          <input
            className="w-full rounded-xl bg-white py-4 pr-32 pl-12 text-base text-gray-900 placeholder-gray-400 shadow-xl focus:outline-none focus:ring-2 focus:ring-white/50"
            name="q"
            placeholder="Search by part name, number, or brand..."
            type="text"
          />
          <button
            className="-translate-y-1/2 absolute top-1/2 right-2 rounded-lg bg-[#077BFF] px-5 py-2.5 font-semibold text-sm text-white transition-colors hover:bg-[#0565D4]"
            type="submit"
          >
            Search
          </button>
        </form>

        {/* Quick category pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="mr-1 text-blue-200 text-sm">Browse:</span>
          {QUICK_CATEGORIES.map((cat) => (
            <Link
              className="rounded-full border border-white/20 bg-white/15 px-4 py-1.5 font-medium text-sm text-white transition-colors hover:bg-white/25"
              href={cat.href}
              key={cat.href}
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
