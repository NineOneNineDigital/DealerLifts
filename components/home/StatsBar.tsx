"use client";

import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

export function StatsBar() {
  return (
    <section className="py-16 md:py-20 border-y border-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
            <AnimatedCounter target={100} suffix="+" label="Five-Star Reviews" />
            <AnimatedCounter target={30} suffix="+" label="Years Experience" />
            <AnimatedCounter target={40} suffix="+" label="Brand Partners" />
            <AnimatedCounter target={1000} suffix="+" label="Builds Completed" />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
