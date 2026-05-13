import { Hero } from "@/components/home/Hero";
import { ServicesPreview } from "@/components/home/ServicesPreview";
import { FeaturedBuilds } from "@/components/home/FeaturedBuilds";
import { BrandPartners } from "@/components/home/BrandPartners";
import { StatsBar } from "@/components/home/StatsBar";
import { Testimonials } from "@/components/home/Testimonials";
import { CTABanner } from "@/components/home/CTABanner";
import { getCompletedProjects } from "@/lib/hygraph";

export const revalidate = 60;

export default async function Home() {
  const allProjects = await getCompletedProjects();
  const featured = allProjects
    .filter((p) => p.featuredProject && (p.mainImage || p.images?.[0]))
    .slice(0, 3);

  return (
    <>
      <Hero />
      <StatsBar />
      <ServicesPreview />
      <FeaturedBuilds projects={featured} />
      <BrandPartners />
      <Testimonials />
      <CTABanner />
    </>
  );
}
