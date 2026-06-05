import type { Icon } from "@tabler/icons-react";
import {
  IconBolt,
  IconCar,
  IconCarSuv,
  IconCompass,
  IconSettings,
  IconShieldCheck,
  IconTool,
  IconWind,
} from "@tabler/icons-react";
import Link from "next/link";

interface Category {
  gradient: string;
  handle: string;
  icon: Icon;
  name: string;
}

// Curated from real, well-stocked collections (handles verified against the
// storefront). Collections carry no images, so tiles use the gradient+icon
// treatment, matching Shop by Build.
const CATEGORIES: Category[] = [
  {
    gradient: "from-blue-500 to-blue-700",
    handle: "suspension",
    icon: IconCarSuv,
    name: "Suspension",
  },
  {
    gradient: "from-cyan-500 to-teal-700",
    handle: "air-suspension-kits",
    icon: IconWind,
    name: "Air Suspension",
  },
  {
    gradient: "from-violet-500 to-indigo-700",
    handle: "coilovers",
    icon: IconSettings,
    name: "Coilovers",
  },
  {
    gradient: "from-slate-600 to-zinc-800",
    handle: "bumpers-steel",
    icon: IconShieldCheck,
    name: "Bumpers",
  },
  {
    gradient: "from-amber-500 to-orange-600",
    handle: "lights",
    icon: IconBolt,
    name: "Lighting",
  },
  {
    gradient: "from-emerald-500 to-green-700",
    handle: "roof-rack",
    icon: IconCompass,
    name: "Roof Racks",
  },
  {
    gradient: "from-stone-600 to-stone-800",
    handle: "running-boards",
    icon: IconCar,
    name: "Running Boards",
  },
  {
    gradient: "from-rose-500 to-red-700",
    handle: "air-compressors",
    icon: IconTool,
    name: "Air Compressors",
  },
];

export function CategoryGrid() {
  return (
    <section>
      <div className="mb-6">
        <h2 className="font-bold font-heading text-2xl text-gray-900">
          Shop by Category
        </h2>
        <p className="mt-1 text-gray-500 text-sm">
          Browse our most-shopped parts
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {CATEGORIES.map(({ gradient, handle, icon: CatIcon, name }) => (
          <Link
            className="group relative aspect-[4/3] overflow-hidden rounded-xl shadow-sm transition-all hover:shadow-lg"
            href={`/shop/categories/${handle}`}
            key={handle}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}>
              <CatIcon
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/30 transition-transform duration-500 group-hover:scale-110"
                size={72}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <h3 className="font-bold font-heading text-base text-white leading-tight">
                {name}
              </h3>
              <p className="mt-0.5 font-medium text-white/80 text-xs">
                Shop now &rarr;
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
