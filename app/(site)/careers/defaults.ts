import type { IconLabel, PageHero } from "@/lib/content/types";

/*
 * Careers page content shape and defaults.
 *
 * Deliberately free of runtime imports so scripts/hygraph-seed.mjs can load it
 * under Node's type stripping. See app/(site)/services/defaults.ts.
 */

export interface CareersContentData {
  applyEmail: string;
  hero: PageHero;
  perks: IconLabel[];
  positionsHeading: string;
  seoDescription: string;
  seoTitle: string;
}

/** Today's hardcoded copy, lifted verbatim. Renders when Hygraph has nothing. */
export const CAREERS_DEFAULTS: CareersContentData = {
  seoTitle: "Careers",
  seoDescription:
    "Join the Dealer Lifts team. We're looking for passionate automotive technicians, fabricators, and service professionals in Eastern NC.",
  hero: {
    eyebrow: "Careers",
    headline: "Build trucks. Build a career.",
    headlineAccent: "",
    subhead:
      "We're always looking for talented, passionate people to join the Dealer Lifts crew.",
  },
  perks: [
    { icon: "Tool", label: "Top-tier brands & parts" },
    { icon: "Users", label: "Team-first culture" },
    { icon: "Heart", label: "Competitive pay & benefits" },
    { icon: "Trophy", label: "Growth opportunities" },
  ],
  positionsHeading: "Open Positions",
  applyEmail: "info@dealerliftsinc.com",
};
