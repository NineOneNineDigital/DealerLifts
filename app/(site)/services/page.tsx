import type { Metadata } from "next";
import { ServicesGrid } from "./ServicesGrid";
import { ProcessSection } from "./ProcessSection";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Oil changes, scheduled maintenance, brakes, engine and drivetrain repair, diagnostics, plus performance upgrades and custom builds at Dealer Lifts.",
};

export default function ServicesPage() {
  return (
    <>
      <section className="pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#077BFF] text-sm font-semibold tracking-wide uppercase mb-3">
            Services
          </p>
          <h1 className="font-heading text-4xl md:text-5xl font-bold leading-tight">
            Performance pedigree,{" "}
            <span className="bg-gradient-to-r from-[#3D9BFF] via-[#077BFF] to-[#0565D4] bg-clip-text text-transparent">
              full-service shop.
            </span>
          </h1>
          <p className="mt-4 text-gray-500 text-lg max-w-2xl mx-auto">
            From oil changes and brakes to lift kits and custom builds —
            expert service for every make and model, backed by 30+ years and
            40+ premium brands.
          </p>
        </div>
      </section>

      <ServicesGrid />
      <ProcessSection />
    </>
  );
}
