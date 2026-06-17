import Link from "next/link";

interface BuildType {
  description: string;
  href: string;
  name: string;
}

const BUILD_TYPES: BuildType[] = [
  {
    description: "Lift kits, leveling, suspension",
    href: "/shop/search?q=lift+kit",
    name: "Lifted Trucks",
  },
  {
    description: "Wrangler, Gladiator, Cherokee",
    href: "/shop/search?q=jeep",
    name: "Jeeps",
  },
  {
    description: "RZR, Maverick, Ranger",
    href: "/shop/search?q=utv",
    name: "UTV / SXS",
  },
  {
    description: "Performance, tuning, intakes",
    href: "/shop/search?q=performance",
    name: "Cars",
  },
  {
    description: "Skid plates, lighting, armor",
    href: "/shop/search?q=off+road",
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
        {BUILD_TYPES.map(({ description, href, name }, index) => (
          <Link
            className="group relative flex aspect-[5/6] flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 p-5 transition-colors duration-300 hover:border-primary"
            href={href}
            key={name}
          >
            {/* Dot-grid texture for an industrial feel */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "18px 18px",
              }}
            />
            {/* Left accent bar that grows on hover */}
            <span
              aria-hidden
              className="absolute top-0 left-0 h-full w-1 origin-top scale-y-0 bg-primary transition-transform duration-300 group-hover:scale-y-100"
            />
            <span className="relative font-condensed text-sm text-white/30 tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="relative">
              <h3 className="font-bold font-condensed text-2xl text-white uppercase leading-none tracking-wide">
                {name}
              </h3>
              <span className="mt-2 block h-0.5 w-8 bg-primary transition-all duration-300 group-hover:w-14" />
              <p className="mt-2 line-clamp-2 text-white/50 text-xs">
                {description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
