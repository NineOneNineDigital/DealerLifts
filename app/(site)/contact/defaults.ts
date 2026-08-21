import type { PageHero } from "@/lib/content/types";

/*
 * Contact page content shape and defaults.
 *
 * Deliberately free of runtime imports so scripts/hygraph-seed.mjs can load
 * it under Node's type stripping. See app/(site)/services/defaults.ts.
 *
 * The sidebar (phone, email, address, hours, socials, map) is out of scope —
 * it is global rather than page-scoped and is the deferred SiteSettings
 * follow-up.
 */

export interface ContactContentData {
  hero: PageHero;
  seoDescription: string;
  seoTitle: string;
}

/** Today's hardcoded copy, lifted verbatim. Renders when Hygraph has nothing. */
export const CONTACT_DEFAULTS: ContactContentData = {
  seoTitle: "Contact",
  seoDescription:
    "Get a free quote for your next build or schedule service at Dealer Lifts. Call (919) 275-8095 or fill out our online form.",
  hero: {
    eyebrow: "Get In Touch",
    headline: "Let's talk about your build.",
    headlineAccent: "",
    subhead:
      "Request a quote, ask a question, or schedule a consultation. We typically respond within 24 hours.",
  },
};
