import type { IconLabel, PageHero } from "@/lib/content/types";

/*
 * About page content shape and defaults.
 *
 * Deliberately free of runtime imports so scripts/hygraph-seed.mjs can load it
 * under Node's type stripping. See app/(site)/services/defaults.ts.
 */

export interface AboutContentData {
  hero: PageHero;
  seoDescription: string;
  seoTitle: string;
  storyBody: string;
  storyHeading: string;
  strengths: IconLabel[];
  teamEyebrow: string;
  teamHeading: string;
  teamSubhead: string;
}

/** Today's hardcoded copy, lifted verbatim. Renders when Hygraph has nothing. */
export const ABOUT_DEFAULTS: AboutContentData = {
  seoTitle: "About",
  seoDescription:
    "Learn about Dealer Lifts — North Carolina's trusted automotive performance shop with 30+ years of experience. Our story, our team, and our commitment to excellence.",
  hero: {
    eyebrow: "About Us",
    headline: "More than a shop — we're builders.",
    headlineAccent: "",
    subhead:
      "30+ years of turning stock trucks into something worth talking about. Based in Eastern NC.",
  },
  storyHeading: "Built on passion, driven by results.",
  storyBody:
    "<p>Dealer Lifts started over 30 years ago with a simple mission: build the best trucks and off-road vehicles in North Carolina. What began as a small garage operation has grown into a full-service performance shop trusted by hundreds of satisfied customers.</p><p>We've built our reputation on quality workmanship, honest pricing, and a genuine love for what we do. Every vehicle that rolls out of our shop is a testament to our commitment to excellence — from a simple oil change to a complete custom build.</p><p>With partnerships with over 40 premium brands including Carli Suspension, BDS, Method Race Wheels, Morimoto, and Borla, we have access to the best parts in the industry. And our team of certified technicians knows how to install them right.</p>",
  strengths: [
    { icon: "Clock24", label: "30+ Years Experience" },
    { icon: "Star", label: "100+ Five Star Reviews" },
    { icon: "Certificate", label: "Certified Technicians" },
    { icon: "ShieldCheck", label: "Warranty Backed" },
    { icon: "Tool", label: "40+ Brand Partners" },
    { icon: "Users", label: "Customer First" },
  ],
  teamEyebrow: "The Crew",
  teamHeading: "Meet the team behind the builds.",
  teamSubhead:
    "Every member of our crew brings real-world experience and a passion for getting it right the first time.",
};
