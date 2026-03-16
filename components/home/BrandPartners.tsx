"use client";

const brands = [
  "Carli Suspension",
  "BDS Suspension",
  "Method Race Wheels",
  "Morimoto",
  "Borla Exhaust",
  "Fox Shocks",
  "Icon Vehicle Dynamics",
  "King Shocks",
  "Rigid Industries",
  "Fuel Off-Road",
  "Nitto Tires",
  "Toyo Tires",
  "BFGoodrich",
  "Warn Winches",
  "ARB 4x4",
  "Magnaflow",
  "AFE Power",
  "Banks Power",
  "Fab Fours",
  "Addictive Desert Designs",
];

export function BrandPartners() {
  return (
    <section className="py-14 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <p className="text-center text-gray-400 text-sm font-medium uppercase tracking-wider">
          Authorized dealer &amp; installer for 40+ brands
        </p>
      </div>

      {/* Single-row marquee — no heading, just the scroll */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-gray-50 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-gray-50 to-transparent z-10" />

        <div className="animate-scroll-left flex items-center gap-10 w-max">
          {[...brands, ...brands].map((brand, i) => (
            <span
              key={`${brand}-${i}`}
              className="text-gray-400 text-sm font-semibold uppercase tracking-wider whitespace-nowrap hover:text-gray-600 transition-colors cursor-default"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
