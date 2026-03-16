"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { IconArrowRight, IconPhone } from "@tabler/icons-react";

export function Hero() {
  return (
    <section className="relative z-0 min-h-screen flex items-end pb-16 md:items-center md:pb-0 overflow-hidden bg-gray-950">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Accent shapes */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#077BFF]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#077BFF]/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-32 md:pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left — copy */}
          <div>
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 mb-8"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-gray-400 text-xs font-medium tracking-wide">
                Now booking builds for 2026
              </span>
            </motion.div>

            <motion.h1
              className="font-heading text-[2.75rem] sm:text-5xl md:text-6xl xl:text-7xl font-bold leading-[1.08] tracking-tight text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              We build trucks
              <br />
              <span className="text-[#077BFF]">people remember.</span>
            </motion.h1>

            <motion.p
              className="mt-6 text-gray-400 text-lg md:text-xl leading-relaxed max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Lifts, suspensions, wheels, and full-service repair — backed by
              30&nbsp;years of experience in Raleigh, NC.
            </motion.p>

            <motion.div
              className="mt-10 flex flex-wrap items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2 px-7 py-3.5 bg-[#077BFF] text-white font-semibold text-sm rounded-lg hover:bg-[#0565D4] transition-colors shadow-lg shadow-[#077BFF]/20"
              >
                Get a free quote
                <IconArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
              <a
                href="tel:919-275-8095"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-gray-300 font-semibold text-sm rounded-lg border border-white/10 hover:border-white/25 transition-colors"
              >
                <IconPhone size={16} />
                (919) 275-8095
              </a>
            </motion.div>

            {/* Social proof strip */}
            <motion.div
              className="mt-14 flex items-center gap-6 text-sm text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-yellow-400 text-base">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
                <span>100+ reviews</span>
              </div>
              <span className="w-px h-4 bg-white/10" />
              <span>40+ brand partners</span>
              <span className="w-px h-4 bg-white/10 hidden sm:block" />
              <span className="hidden sm:inline">30+ years</span>
            </motion.div>
          </div>

          {/* Right — visual element */}
          <motion.div
            className="relative hidden lg:block"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/10">
              <img
                src="https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&q=80"
                alt="Lifted truck build by Dealer Lifts"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/60 via-transparent to-transparent" />
            </div>
            {/* Floating card */}
            <div className="absolute -bottom-4 -left-6 bg-white rounded-xl shadow-xl p-4 pr-6 border border-gray-100">
              <p className="text-xs text-gray-500 font-medium mb-0.5">Latest build</p>
              <p className="font-heading text-sm font-bold text-gray-900">
                2024 F-250 &middot; 6&quot; BDS Lift
              </p>
              <p className="text-xs text-[#077BFF] font-medium mt-0.5">
                Method Wheels &bull; 37&quot; Nitto
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
