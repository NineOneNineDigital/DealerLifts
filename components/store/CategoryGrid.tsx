import Link from "next/link";

interface Category {
  handle: string;
  name: string;
}

// Curated from real, well-stocked collections (handles verified against the
// storefront). Rendered as typographic industrial cards rather than imagery —
// consistent, branded, and resilient to catalog changes.
const CATEGORIES: Category[] = [
  { handle: "suspension", name: "Suspension" },
  { handle: "air-suspension-kits", name: "Air Suspension" },
  { handle: "coilovers", name: "Coilovers" },
  { handle: "bumpers-steel", name: "Bumpers" },
  { handle: "lights", name: "Lighting" },
  { handle: "roof-rack", name: "Roof Racks" },
  { handle: "running-boards", name: "Running Boards" },
  { handle: "air-compressors", name: "Air Compressors" },
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
        {CATEGORIES.map(({ handle, name }, index) => (
          <Link
            className="group relative flex aspect-[4/3] flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-neutral-900 p-4 transition-colors duration-300 hover:border-primary"
            href={`/shop/categories/${handle}`}
            key={handle}
          >
            {/* Left accent bar that grows on hover */}
            <span
              aria-hidden
              className="absolute top-0 left-0 h-full w-1 origin-top scale-y-0 bg-primary transition-transform duration-300 group-hover:scale-y-100"
            />
            <span className="font-condensed text-sm text-white/30 tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="font-bold font-condensed text-2xl text-white uppercase leading-none tracking-wide">
                {name}
              </h3>
              <span className="mt-2 block h-0.5 w-8 bg-primary transition-all duration-300 group-hover:w-14" />
              <p className="mt-2 font-medium text-white/40 text-xs uppercase tracking-wider transition-colors group-hover:text-white/70">
                Shop now &rarr;
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
