"use client";

import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import type { Stat } from "@/lib/content/types";

interface Props {
  stats: Stat[];
}

export function StatsBar({ stats }: Props) {
  return (
    <section className="border-gray-100 border-y py-16 md:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="grid grid-cols-2 divide-x divide-gray-100 md:grid-cols-4">
            {stats.map((s, i) => (
              <AnimatedCounter
                // biome-ignore lint/suspicious/noArrayIndexKey: label alone can collide when CMS stats are mid-edit; index disambiguates
                key={`${i}-${s.label}`}
                label={s.label}
                suffix={s.suffix}
                target={s.value}
              />
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
