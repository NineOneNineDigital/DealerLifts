"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { IconArrowRight } from "@tabler/icons-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

const builds = [
  {
    title: "2024 Ford F-250 Platinum",
    services: "6\" BDS Lift · Method Wheels · 37\" Nitto",
    image: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&q=80",
    span: "lg:col-span-7 lg:row-span-2",
    aspect: "aspect-[4/3] lg:aspect-auto lg:h-full",
  },
  {
    title: "2023 Jeep Wrangler Rubicon",
    services: "4.5\" Carli · 40\" BFG KM3 · Morimoto XB",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80",
    span: "lg:col-span-5",
    aspect: "aspect-[3/2]",
  },
  {
    title: "2024 Ram 2500 Power Wagon",
    services: "Carli Pintop · Method 305 · Rigid Lights",
    image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80",
    span: "lg:col-span-5",
    aspect: "aspect-[3/2]",
  },
];

export function FeaturedBuilds() {
  return (
    <section className="py-20 md:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-[#077BFF] text-sm font-semibold tracking-wide uppercase mb-2">
                Recent work
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold">
                Featured Builds
              </h2>
            </div>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-1.5 text-[#077BFF] font-semibold text-sm hover:gap-2.5 transition-all"
            >
              See all builds
              <IconArrowRight size={15} />
            </Link>
          </div>
        </ScrollReveal>

        {/* Bento-ish grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {builds.map((build, i) => (
            <ScrollReveal
              key={build.title}
              delay={i * 0.1}
              className={build.span}
            >
              <motion.div
                className={`group relative overflow-hidden rounded-xl ${build.aspect} cursor-pointer`}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={build.image}
                  alt={build.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                  <h3 className="font-heading text-lg md:text-xl font-bold text-white leading-snug">
                    {build.title}
                  </h3>
                  <p className="text-white/70 text-sm mt-1">{build.services}</p>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
