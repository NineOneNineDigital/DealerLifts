import { IconSearch, IconTruck } from "@tabler/icons-react";
import Link from "next/link";
import { VehicleSelector } from "./VehicleSelector";

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
    <section className="relative overflow-hidden bg-gradient-to-br from-[#077BFF] via-[#0565D4] to-[#044AAF] pt-32 pb-12 md:pt-40 md:pb-20">
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
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left: hero copy + search + quick categories */}
          <div className="lg:col-span-7">
            <div className="mb-5 flex items-center gap-2">
              <IconTruck className="text-blue-200" size={18} />
              <span className="font-medium text-blue-100 text-sm">
                Free shipping on orders over $99
              </span>
            </div>

            <h1 className="mb-4 font-bold font-heading text-4xl text-white tracking-tight md:text-5xl lg:text-6xl">
              Quality Parts,
              <br className="hidden sm:block" /> Delivered
            </h1>
            <p className="mb-7 max-w-xl text-blue-100 text-lg md:text-xl">
              Thousands of parts from top brands. Find exactly what your build
              needs.
            </p>

            {/* Search */}
            <form
              action="/store/search"
              className="relative mb-6 max-w-2xl"
              method="get"
            >
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
            <div className="flex flex-wrap items-center gap-2">
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

          {/* Right: YMM widget */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <VehicleSelector />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
