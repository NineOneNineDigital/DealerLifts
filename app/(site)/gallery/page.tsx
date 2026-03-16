import type { Metadata } from "next";
import { GalleryContent } from "./GalleryContent";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Browse our portfolio of custom truck builds, Jeep modifications, and off-road builds. Before and after photos of lift kits, wheels, lighting, and more.",
};

export default function GalleryPage() {
  return (
    <>
      <section className="pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#077BFF] text-sm font-semibold tracking-wide uppercase mb-3">
            Our Work
          </p>
          <h1 className="font-heading text-4xl md:text-5xl font-bold">
            Builds that speak for themselves.
          </h1>
          <p className="mt-4 text-gray-500 text-lg max-w-2xl mx-auto">
            Browse recent projects — from full suspension overhauls to lighting
            upgrades and custom off-road packages.
          </p>
        </div>
      </section>

      <GalleryContent />
    </>
  );
}
