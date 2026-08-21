import type { Metadata } from "next";
import { BrandPartners } from "@/components/home/BrandPartners";
import { CTABanner } from "@/components/home/CTABanner";
import { FeaturedBuilds } from "@/components/home/FeaturedBuilds";
import { Hero } from "@/components/home/Hero";
import { ServicesPreview } from "@/components/home/ServicesPreview";
import { StatsBar } from "@/components/home/StatsBar";
import { Testimonials } from "@/components/home/Testimonials";
import { getCompletedProjects } from "@/lib/hygraph";
import { getHomeContent } from "./content";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const content = await getHomeContent();

  return {
    title: { absolute: content.seoTitle },
    description: content.seoDescription,
  };
}

export default async function Home() {
  const [content, allProjects] = await Promise.all([
    getHomeContent(),
    getCompletedProjects(),
  ]);

  const featured = allProjects
    .filter((p) => p.featuredProject && (p.mainImage || p.images?.[0]))
    .slice(0, 3);

  return (
    <>
      <Hero content={content.hero} />
      <StatsBar stats={content.stats} />
      <ServicesPreview
        eyebrow={content.servicesEyebrow}
        heading={content.servicesHeading}
        items={content.servicesPreview}
        linkHref={content.servicesLinkHref}
        linkLabel={content.servicesLinkLabel}
        subhead={content.servicesSubhead}
      />
      <FeaturedBuilds projects={featured} />
      <BrandPartners />
      <Testimonials
        eyebrow={content.testimonialsEyebrow}
        heading={content.testimonialsHeading}
        items={content.testimonials}
        ratingLabel={content.testimonialsRatingLabel}
      />
      <CTABanner content={content.ctaBanner} />
    </>
  );
}
