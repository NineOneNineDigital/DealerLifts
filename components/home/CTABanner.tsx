"use client";

import { IconArrowRight, IconPhone } from "@tabler/icons-react";
import Link from "next/link";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import type { CtaBlock } from "@/lib/content/types";

interface Props {
  content: CtaBlock;
}

export function CTABanner({ content }: Props) {
  return (
    <section className="relative overflow-hidden bg-gray-950 py-20 md:py-28">
      {/* Subtle radial glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#077BFF]/8 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
        <ScrollReveal>
          <p className="mb-4 font-semibold text-[#077BFF] text-sm uppercase tracking-wide">
            {content.eyebrow}
          </p>
          <h2 className="font-bold font-heading text-3xl text-white leading-tight md:text-4xl lg:text-5xl">
            {content.headline}
            <br className="hidden sm:block" />{" "}
            {content.headlineAccent}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-gray-400 text-lg leading-relaxed">
            {content.subhead}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              className="group inline-flex items-center gap-2 rounded-lg bg-[#077BFF] px-8 py-4 font-semibold text-sm text-white shadow-[#077BFF]/20 shadow-lg transition-colors hover:bg-[#0565D4]"
              href={content.buttonHref}
            >
              {content.buttonLabel}
              <IconArrowRight
                className="transition-transform group-hover:translate-x-0.5"
                size={16}
              />
            </Link>
            <a
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-8 py-4 font-semibold text-gray-300 text-sm transition-colors hover:border-white/25"
              href={content.phoneHref}
            >
              <IconPhone size={16} />
              {content.phoneLabel}
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
