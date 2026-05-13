"use client";

import Image from "next/image";

type Brand = {
  name: string;
  src: string;
  /** True if the logo is white/light on transparent — render on blue card without the white inner tile. */
  light?: boolean;
};

const brands: Brand[] = [
  { name: "Carli Suspension", src: "/images/webflow/home/65ca32fad1677bacee95136b-carli-official-logo-black.png" },
  { name: "BDS Suspension", src: "/images/webflow/home/65329e3f6147bad0d847c7ed-bds-1a.png" },
  { name: "Method Race Wheels", src: "/images/webflow/home/6532a552a00bf12f7a46660b-methodwheels-logo.png" },
  { name: "Morimoto", src: "/images/webflow/home/6532a556cdf8540e14c1f622-morimoto-logo-afab92d07f-seeklogo-com.png" },
  { name: "Borla Exhaust", src: "/images/webflow/home/65329e48cb6ba5eb3cd5299d-borla-01-logo-png-transparent.png" },
  { name: "Fuel Off-Road", src: "/images/webflow/home/65329bf5706150d71169cd77-fuel-logo.png" },
  { name: "King Shocks", src: "/images/webflow/home/64e57bf763a54a2e3f7fd2ca-toppng-com-king-off-road-shocks-sponsor-decal-1471x508.png" },
  { name: "Falken Tires", src: "/images/webflow/home/64e7749c0c2d7985657e597a-falken-logo.png" },
  { name: "Factor 55", src: "/images/webflow/home/6532981440deddaf9589d34d-factor55-logo.png", light: true },
  { name: "Vision X", src: "/images/webflow/home/65329818f296df6b772bcd11-visionx-logo.png" },
  { name: "MBRP", src: "/images/webflow/home/6532981e0e736ee4eed4097b-mbrp-logow-01.png" },
  { name: "KG1 Forged", src: "/images/webflow/home/65329825e0e49e4b66c1eda9-kg1-logo.png" },
  { name: "Mickey Thompson", src: "/images/webflow/home/65329e3f6147bad0d847c77b-mickeythompson.png" },
  { name: "Synergy MFG", src: "/images/webflow/home/6532a552f7cfc7ca80fb3025-synergy-logo.png" },
  { name: "Apex Chassis", src: "/images/webflow/home/65a5922d301a404a97170e20-apex-chassis-logo-vertical-1600x.png" },
];

export function BrandPartners() {
  const loop = [...brands, ...brands];

  return (
    <section className="relative py-20 bg-gradient-to-b from-white via-gray-50 to-white overflow-hidden">
      {/* Subtle backdrop grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          Authorized Dealer
        </span>
        <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Trusted partners. <span className="gradient-text">Best-in-class parts.</span>
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          We install &amp; service 40+ premium off-road brands
        </p>
      </div>

      <div className="relative">
        {/* Edge fades */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-32 sm:w-48 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-32 sm:w-48 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />

        <div className="group flex">
          <div className="animate-scroll-left group-hover:[animation-play-state:paused] flex items-center gap-5 sm:gap-7 w-max py-4">
            {loop.map((brand, i) => (
              <div
                key={`${brand.name}-${i}`}
                title={brand.name}
                className="group/item relative flex items-center justify-center h-24 sm:h-28 w-44 sm:w-52 p-3 rounded-2xl bg-gradient-to-br from-[#077BFF] to-[#0565D4] border border-blue-400/40 shadow-[0_1px_2px_rgba(15,23,42,0.08),0_10px_28px_-12px_rgba(7,123,255,0.55)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_4px_8px_rgba(7,123,255,0.25),0_20px_36px_-12px_rgba(7,123,255,0.7)] hover:border-blue-300"
              >
                <div className="relative w-full h-full rounded-xl bg-white flex items-center justify-center overflow-hidden">
                  <Image
                    src={brand.src}
                    alt={`${brand.name} logo`}
                    fill
                    sizes="(min-width: 640px) 13rem, 11rem"
                    className={`object-contain p-3 sm:p-4 grayscale opacity-80 transition-all duration-300 group-hover/item:grayscale-0 group-hover/item:opacity-100${
                      brand.light ? " invert" : ""
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
