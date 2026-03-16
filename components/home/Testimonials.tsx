"use client";

import { IconStar, IconQuote } from "@tabler/icons-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

const testimonials = [
  {
    name: "Mike J.",
    vehicle: "2023 Ford F-250",
    quote:
      "The 6-inch BDS lift with Method wheels looks absolutely amazing. Professional crew, fair pricing, and they finished ahead of schedule.",
  },
  {
    name: "Sarah W.",
    vehicle: "2024 Jeep Wrangler",
    quote:
      "Best off-road shop in NC, hands down. Carli suspension rides like a dream on and off the trail.",
  },
  {
    name: "Chris M.",
    vehicle: "2023 Toyota Tacoma",
    quote:
      "I've been bringing all my vehicles here for years. Their maintenance work is top-notch and their custom builds are on another level.",
  },
];

export function Testimonials() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left — headline */}
          <div className="lg:col-span-4">
            <ScrollReveal>
              <p className="text-[#077BFF] text-sm font-semibold tracking-wide uppercase mb-3">
                Reviews
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold leading-tight">
                Don&apos;t take our word for&nbsp;it.
              </h2>
              <div className="flex items-center gap-1 mt-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <IconStar
                    key={`review-star-${i}`}
                    size={18}
                    className="text-yellow-400 fill-yellow-400"
                  />
                ))}
                <span className="ml-2 text-gray-500 text-sm font-medium">
                  100+ five-star reviews
                </span>
              </div>
            </ScrollReveal>
          </div>

          {/* Right — cards, stacked with slight offset feel */}
          <div className="lg:col-span-8 space-y-5">
            {testimonials.map((t, i) => (
              <ScrollReveal key={t.name} delay={i * 0.1}>
                <div className="relative bg-white border border-gray-200 rounded-xl p-6 md:p-8 hover:border-gray-300 transition-colors">
                  <IconQuote
                    size={28}
                    className="text-gray-100 absolute top-5 right-5"
                  />
                  <p className="text-gray-700 leading-relaxed pr-8">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#077BFF]/10 flex items-center justify-center text-[#077BFF] text-xs font-bold">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.vehicle}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
