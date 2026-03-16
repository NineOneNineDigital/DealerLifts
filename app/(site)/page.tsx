import { Hero } from "@/components/home/Hero";
import { ServicesPreview } from "@/components/home/ServicesPreview";
import { FeaturedBuilds } from "@/components/home/FeaturedBuilds";
import { BrandPartners } from "@/components/home/BrandPartners";
import { StatsBar } from "@/components/home/StatsBar";
import { Testimonials } from "@/components/home/Testimonials";
import { CTABanner } from "@/components/home/CTABanner";

export default function Home() {
  return (
    <>
      <Hero />
      <StatsBar />
      <ServicesPreview />
      <FeaturedBuilds />
      <BrandPartners />
      <Testimonials />
      <CTABanner />
    </>
  );
}
