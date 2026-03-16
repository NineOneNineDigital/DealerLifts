import type { Metadata } from "next";
import { ServicesGrid } from "./ServicesGrid";
import { ProcessSection } from "./ProcessSection";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Lift kits, suspension, wheels & tires, bumpers, lighting, oil changes, brakes, engine service, and custom off-road builds at Dealer Lifts.",
};

export default function ServicesPage() {
  return (
    <>
      <section className="pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#077BFF] text-sm font-semibold tracking-wide uppercase mb-3">
            Services
          </p>
          <h1 className="font-heading text-4xl md:text-5xl font-bold">
            Everything your truck needs, under one roof.
          </h1>
          <p className="mt-4 text-gray-500 text-lg max-w-2xl mx-auto">
            From full custom builds to routine oil changes — expert service
            backed by 30+ years and 40+ premium brands.
          </p>
        </div>
      </section>

      <ServicesGrid />
      <ProcessSection />
    </>
  );
}
