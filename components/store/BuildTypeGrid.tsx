import type { Icon } from "@tabler/icons-react";
import {
  IconBolt,
  IconCar,
  IconCarSuv,
  IconCompass,
  IconTruck,
} from "@tabler/icons-react";
import Link from "next/link";

interface BuildType {
  description: string;
  gradient: string;
  href: string;
  icon: Icon;
  name: string;
}

const BUILD_TYPES: BuildType[] = [
  {
    description: "Lift kits, leveling, suspension",
    gradient: "from-orange-500 via-red-500 to-amber-600",
    href: "/shop/search?q=lift+kit",
    icon: IconTruck,
    name: "Lifted Trucks",
  },
  {
    description: "Wrangler, Gladiator, Cherokee",
    gradient: "from-green-600 via-emerald-600 to-teal-700",
    href: "/shop/search?q=jeep",
    icon: IconCarSuv,
    name: "Jeeps",
  },
  {
    description: "RZR, Maverick, Ranger",
    gradient: "from-yellow-500 via-amber-500 to-orange-600",
    href: "/shop/search?q=utv",
    icon: IconBolt,
    name: "UTV / SXS",
  },
  {
    description: "Performance, tuning, intakes",
    gradient: "from-blue-600 via-indigo-600 to-purple-700",
    href: "/shop/search?q=performance",
    icon: IconCar,
    name: "Cars",
  },
  {
    description: "Skid plates, lighting, armor",
    gradient: "from-stone-700 via-stone-800 to-zinc-900",
    href: "/shop/search?q=off+road",
    icon: IconCompass,
    name: "Off-Road",
  },
];

export function BuildTypeGrid() {
  return (
    <section>
      <div className="mb-6">
        <h2 className="font-bold font-heading text-2xl text-gray-900">
          Shop by Build
        </h2>
        <p className="mt-1 text-gray-500 text-sm">
          Find parts tuned for your style of build
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {BUILD_TYPES.map(
          ({ description, gradient, href, icon: BuildIcon, name }) => (
            <Link
              className="group relative aspect-[5/6] overflow-hidden rounded-2xl shadow-md transition-all hover:shadow-xl"
              href={href}
              key={name}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${gradient}`}
              />
              {/* Pattern overlay */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.12]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                  backgroundSize: "20px 20px",
                }}
              />
              <BuildIcon
                className="absolute top-6 left-1/2 -translate-x-1/2 text-white/40 transition-transform duration-500 group-hover:scale-110"
                size={64}
              />
              {/* Bottom darken gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h3 className="font-bold font-heading text-lg text-white leading-tight">
                  {name}
                </h3>
                <p className="mt-1 line-clamp-2 text-white/85 text-xs">
                  {description}
                </p>
              </div>
            </Link>
          )
        )}
      </div>
    </section>
  );
}
