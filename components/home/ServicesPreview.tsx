"use client";

import { IconArrowRight } from "@tabler/icons-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { resolveIcon } from "@/lib/content/icons";
import type { IconCard } from "@/lib/content/types";

interface Props {
  eyebrow: string;
  heading: string;
  items: IconCard[];
  linkHref: string;
  linkLabel: string;
  subhead: string;
}

export function ServicesPreview({
  eyebrow,
  heading,
  items,
  linkHref,
  linkLabel,
  subhead,
}: Props) {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left sticky header */}
          <div className="lg:sticky lg:top-32 lg:col-span-4 lg:self-start">
            <ScrollReveal>
              <p className="mb-3 font-semibold text-[#077BFF] text-sm uppercase tracking-wide">
                {eyebrow}
              </p>
              <h2 className="font-bold font-heading text-3xl leading-tight md:text-4xl">
                {heading}
              </h2>
              <p className="mt-4 text-gray-500 leading-relaxed">{subhead}</p>
              <Link
                className="mt-6 inline-flex items-center gap-1.5 font-semibold text-[#077BFF] text-sm transition-all hover:gap-2.5"
                href={linkHref}
              >
                {linkLabel}
                <IconArrowRight size={15} />
              </Link>
            </ScrollReveal>
          </div>

          {/* Right — service cards with stagger */}
          <div className="space-y-5 lg:col-span-8">
            {items.map((service, i) => {
              const Icon = resolveIcon(service.icon);
              return (
                <ScrollReveal delay={i * 0.12} key={service.title}>
                  <Link href={service.href}>
                    <motion.div
                      className="group relative flex flex-col gap-5 rounded-xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:border-[#077BFF]/40 hover:shadow-[#077BFF]/5 hover:shadow-lg sm:flex-row md:p-8"
                      whileHover={{ x: 4 }}
                    >
                      {/* Number */}
                      <span className="pointer-events-none absolute top-5 right-6 select-none font-bold font-heading text-6xl text-gray-100 leading-none">
                        {String(i + 1).padStart(2, "0")}
                      </span>

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#077BFF]/10 transition-colors group-hover:bg-[#077BFF]/15">
                        <Icon className="text-[#077BFF]" size={22} />
                      </div>

                      <div className="relative z-10">
                        <h3 className="mb-1.5 font-bold font-heading text-lg transition-colors group-hover:text-[#077BFF]">
                          {service.title}
                        </h3>
                        <p className="mb-3 text-gray-500 text-sm leading-relaxed">
                          {service.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {service.tags.map((tag) => (
                            <span
                              className="rounded bg-gray-100 px-2.5 py-0.5 font-medium text-gray-500 text-xs"
                              key={tag}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
