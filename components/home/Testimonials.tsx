"use client";

import { IconQuote, IconStar } from "@tabler/icons-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import type { Testimonial } from "@/lib/content/types";

interface Props {
  eyebrow: string;
  heading: string;
  items: Testimonial[];
  ratingLabel: string;
}

export function Testimonials({ eyebrow, heading, items, ratingLabel }: Props) {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left — headline */}
          <div className="lg:col-span-4">
            <ScrollReveal>
              <p className="mb-3 font-semibold text-[#077BFF] text-sm uppercase tracking-wide">
                {eyebrow}
              </p>
              <h2 className="font-bold font-heading text-3xl leading-tight md:text-4xl">
                {heading}
              </h2>
              <div className="mt-4 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <IconStar
                    className="fill-yellow-400 text-yellow-400"
                    key={`review-star-${i}`}
                    size={18}
                  />
                ))}
                <span className="ml-2 font-medium text-gray-500 text-sm">
                  {ratingLabel}
                </span>
              </div>
            </ScrollReveal>
          </div>

          {/* Right — cards, stacked with slight offset feel */}
          <div className="space-y-5 lg:col-span-8">
            {items.map((t, i) => (
              <ScrollReveal
                delay={i * 0.1}
                // biome-ignore lint/suspicious/noArrayIndexKey: name alone can collide when CMS testimonials are mid-edit; index disambiguates
                key={`${i}-${t.name}`}
              >
                <div className="relative rounded-xl border border-gray-200 bg-white p-6 transition-colors hover:border-gray-300 md:p-8">
                  <IconQuote
                    className="absolute top-5 right-5 text-gray-100"
                    size={28}
                  />
                  <p className="pr-8 text-gray-700 leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#077BFF]/10 font-bold text-[#077BFF] text-xs">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {t.name}
                      </p>
                      <p className="text-gray-400 text-xs">{t.vehicle}</p>
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
