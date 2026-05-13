"use client";

import { IconArrowRight, IconPhone } from "@tabler/icons-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative z-0 flex min-h-[100svh] flex-col overflow-hidden bg-gray-950">
      {/* Background image */}
      <Image
        alt="Dealer Lifts shop in Raleigh, NC"
        className="object-cover"
        fill
        priority
        quality={90}
        sizes="100vw"
        src="/dealerlifts-building.jpeg"
      />

      {/* Soft left-side scrim for headline legibility — right side stays clean so the building/sign show through */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-950/55 to-transparent"
        aria-hidden
      />
      {/* Just enough bottom shading to ground the stat bar */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-gray-950/85 to-transparent"
        aria-hidden
      />

      {/* Brand-blue glow accent */}
      <div
        className="pointer-events-none absolute -bottom-32 -right-32 h-[520px] w-[520px] rounded-full bg-[#077BFF]/20 blur-[140px]"
        aria-hidden
      />

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 pt-32 pb-16 sm:px-6 lg:px-8">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mb-7 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3.5 py-1.5 backdrop-blur-md"
            initial={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.5 }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-400" />
            </span>
            <span className="font-medium text-white/85 text-xs tracking-wide">
              Now booking builds for 2026
            </span>
          </motion.div>

          <motion.h1
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl font-bold font-heading text-white text-[2.75rem] leading-[1.02] tracking-tight sm:text-6xl md:text-7xl xl:text-[5.5rem]"
            initial={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Raleigh&rsquo;s home for
            <br />
            <span className="bg-gradient-to-r from-[#3D9BFF] via-[#077BFF] to-[#0565D4] bg-clip-text text-transparent">
              custom truck builds.
            </span>
          </motion.h1>

          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="mt-7 max-w-2xl text-gray-300 text-lg leading-relaxed md:text-xl"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Lifts, suspensions, wheels, and full-service repair — under one
            roof, backed by 30&nbsp;years of experience.
          </motion.p>

          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 flex flex-wrap items-center gap-3 sm:gap-4"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <Link
              className="group inline-flex items-center gap-2 rounded-lg bg-[#077BFF] px-7 py-4 font-semibold text-sm text-white shadow-[#077BFF]/30 shadow-lg transition-all hover:bg-[#0565D4] hover:shadow-[#077BFF]/50 hover:shadow-xl"
              href="/contact"
            >
              Get a free quote
              <IconArrowRight
                className="transition-transform group-hover:translate-x-0.5"
                size={16}
              />
            </Link>
            <a
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/[0.04] px-7 py-4 font-semibold text-sm text-white backdrop-blur-md transition-colors hover:border-white/40 hover:bg-white/[0.08]"
              href="tel:919-275-8095"
            >
              <IconPhone size={16} />
              (919) 275-8095
            </a>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
