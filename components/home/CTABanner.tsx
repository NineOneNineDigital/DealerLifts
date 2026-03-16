"use client";

import Link from "next/link";
import { IconArrowRight, IconPhone } from "@tabler/icons-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

export function CTABanner() {
  return (
    <section className="py-20 md:py-28 bg-gray-950 relative overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#077BFF]/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
        <ScrollReveal>
          <p className="text-[#077BFF] text-sm font-semibold tracking-wide uppercase mb-4">
            Ready to start?
          </p>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Let&apos;s build something
            <br className="hidden sm:block" /> worth&nbsp;showing&nbsp;off.
          </h2>
          <p className="mt-5 text-gray-400 text-lg leading-relaxed max-w-xl mx-auto">
            Whether it&apos;s a full custom build or your next oil change —
            we treat every vehicle like it&apos;s our own.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-[#077BFF] text-white font-semibold text-sm rounded-lg hover:bg-[#0565D4] transition-colors shadow-lg shadow-[#077BFF]/20"
            >
              Get a free quote
              <IconArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
            <a
              href="tel:919-275-8095"
              className="inline-flex items-center gap-2 px-8 py-4 text-gray-300 font-semibold text-sm rounded-lg border border-white/10 hover:border-white/25 transition-colors"
            >
              <IconPhone size={16} />
              (919) 275-8095
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
