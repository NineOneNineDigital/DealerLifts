"use client";

import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { resolveIcon } from "@/lib/content/icons";
import type { IconCard } from "@/lib/content/types";

interface Props {
  items: IconCard[];
}

export function ServicesGrid({ items }: Props) {
  return (
    <section className="pb-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Two-column layout: first 4 services in left col, next 4 in right, with staggered sizing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
          {items.map((service, i) => {
            const Icon = resolveIcon(service.icon);
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: title alone can collide when CMS cards are mid-edit; index disambiguates
              <ScrollReveal key={`${i}-${service.title}`} delay={i * 0.05}>
                <div className="flex gap-4 p-5 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors group">
                  <div className="w-10 h-10 bg-[#077BFF]/10 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-[#077BFF]/15 transition-colors">
                    <Icon size={20} className="text-[#077BFF]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-heading text-base font-bold mb-1">
                      {service.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-2">
                      {service.description}
                    </p>
                    {service.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {service.tags.map((brand) => (
                          <span
                            key={brand}
                            className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded"
                          >
                            {brand}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
