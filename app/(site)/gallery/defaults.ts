import type { PageHero } from "@/lib/content/types";

/*
 * Gallery page content shape and defaults.
 *
 * Deliberately free of runtime imports so scripts/hygraph-seed.mjs can load
 * it under Node's type stripping. See app/(site)/services/defaults.ts.
 */

export interface GalleryContentData {
  hero: PageHero;
  seoDescription: string;
  seoTitle: string;
}

/** Today's hardcoded copy, lifted verbatim. Renders when Hygraph has nothing. */
export const GALLERY_DEFAULTS: GalleryContentData = {
  seoTitle: "Gallery",
  seoDescription:
    "Browse our portfolio of custom truck builds, Jeep modifications, and off-road builds. Photos of lift kits, wheels, lighting, and more.",
  hero: {
    eyebrow: "Our Work",
    headline: "Builds that speak for themselves.",
    headlineAccent: "",
    subhead:
      "Browse recent projects — from full suspension overhauls to lighting upgrades and custom off-road packages.",
  },
};
