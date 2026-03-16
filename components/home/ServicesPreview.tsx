"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  IconArrowUp,
  IconTool,
  IconCalendarCheck,
  IconArrowRight,
} from "@tabler/icons-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

const services = [
  {
    icon: IconArrowUp,
    title: "Performance Upgrades",
    description:
      "Lift kits, suspension, wheels & tires, bumpers, lighting, and custom off-road builds from 40+ premium brands.",
    tags: ["Carli", "BDS", "Fox", "Method"],
    href: "/services",
  },
  {
    icon: IconTool,
    title: "Auto Repair",
    description:
      "Expert diagnostics and repair for all makes and models. Brakes, engine, drivetrain — done right the first time.",
    tags: ["Diagnostics", "Brakes", "Engine"],
    href: "/services",
  },
  {
    icon: IconCalendarCheck,
    title: "Scheduled Maintenance",
    description:
      "Oil changes, fluid flushes, tire rotations, and routine maintenance to keep your vehicle at peak performance.",
    tags: ["Oil Change", "Tires", "Fluids"],
    href: "/services",
  },
];

export function ServicesPreview() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left sticky header */}
          <div className="lg:col-span-4 lg:sticky lg:top-32 lg:self-start">
            <ScrollReveal>
              <p className="text-[#077BFF] text-sm font-semibold tracking-wide uppercase mb-3">
                What we do
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold leading-tight">
                Three ways we keep your&nbsp;ride dialed.
              </h2>
              <p className="mt-4 text-gray-500 leading-relaxed">
                Whether you want to go higher, look meaner, or just keep things
                running smooth — we&apos;ve got you.
              </p>
              <Link
                href="/services"
                className="mt-6 inline-flex items-center gap-1.5 text-[#077BFF] font-semibold text-sm hover:gap-2.5 transition-all"
              >
                View all services
                <IconArrowRight size={15} />
              </Link>
            </ScrollReveal>
          </div>

          {/* Right — service cards with stagger */}
          <div className="lg:col-span-8 space-y-5">
            {services.map((service, i) => (
              <ScrollReveal key={service.title} delay={i * 0.12}>
                <Link href={service.href}>
                  <motion.div
                    className="group relative bg-white border border-gray-200 rounded-xl p-6 md:p-8 flex flex-col sm:flex-row gap-5 hover:border-[#077BFF]/40 hover:shadow-lg hover:shadow-[#077BFF]/5 transition-all duration-300"
                    whileHover={{ x: 4 }}
                  >
                    {/* Number */}
                    <span className="absolute top-5 right-6 font-heading text-6xl font-bold text-gray-100 leading-none select-none pointer-events-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    <div className="w-12 h-12 rounded-lg bg-[#077BFF]/10 flex items-center justify-center shrink-0 group-hover:bg-[#077BFF]/15 transition-colors">
                      <service.icon size={22} className="text-[#077BFF]" />
                    </div>

                    <div className="relative z-10">
                      <h3 className="font-heading text-lg font-bold mb-1.5 group-hover:text-[#077BFF] transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-gray-500 text-sm leading-relaxed mb-3">
                        {service.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {service.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-0.5 bg-gray-100 text-gray-500 rounded text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
