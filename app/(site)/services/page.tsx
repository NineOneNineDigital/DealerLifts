import type { Metadata } from "next";
import { getServicesContent } from "./content";
import { ProcessSection } from "./ProcessSection";
import { ServicesGrid } from "./ServicesGrid";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const content = await getServicesContent();

  return {
    title: content.seoTitle,
    description: content.seoDescription,
  };
}

export default async function ServicesPage() {
  const content = await getServicesContent();
  const { hero } = content;

  return (
    <>
      <section className="pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#077BFF] text-sm font-semibold tracking-wide uppercase mb-3">
            {hero.eyebrow}
          </p>
          <h1 className="font-heading text-4xl md:text-5xl font-bold leading-tight">
            {hero.headline}
            {hero.headlineAccent && (
              <>
                {" "}
                <span className="bg-gradient-to-r from-[#3D9BFF] via-[#077BFF] to-[#0565D4] bg-clip-text text-transparent">
                  {hero.headlineAccent}
                </span>
              </>
            )}
          </h1>
          <p className="mt-4 text-gray-500 text-lg max-w-2xl mx-auto">
            {hero.subhead}
          </p>
        </div>
      </section>

      <ServicesGrid items={content.services} />
      <ProcessSection
        ctaHref={content.processCtaHref}
        ctaLabel={content.processCtaLabel}
        eyebrow={content.processEyebrow}
        heading={content.processHeading}
        steps={content.processSteps}
      />
    </>
  );
}
