"use client";

import Link from "next/link";
import {
  IconMessageCircle,
  IconFileDescription,
  IconHammer,
  IconCircleCheck,
} from "@tabler/icons-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

const steps = [
  { icon: IconMessageCircle, title: "Consult", description: "Tell us about your vehicle and your vision." },
  { icon: IconFileDescription, title: "Quote", description: "Transparent pricing — no hidden fees." },
  { icon: IconHammer, title: "Build", description: "Premium parts, installed with precision." },
  { icon: IconCircleCheck, title: "Deliver", description: "Walk-through and you drive away." },
];

export function ProcessSection() {
  return (
    <section className="py-20 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <p className="text-[#077BFF] text-sm font-semibold tracking-wide uppercase mb-2">
                How It Works
              </p>
              <h2 className="font-heading text-3xl font-bold">
                Four steps to your dream ride.
              </h2>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#077BFF] text-white text-sm font-semibold rounded-lg hover:bg-[#0565D4] transition-colors w-fit"
            >
              Request a Quote
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <ScrollReveal key={step.title} delay={i * 0.1}>
              <div className="relative">
                <span className="text-6xl font-heading font-bold text-gray-100 leading-none select-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="mt-2">
                  <step.icon size={20} className="text-[#077BFF] mb-2" />
                  <h3 className="font-heading text-base font-bold mb-1">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
