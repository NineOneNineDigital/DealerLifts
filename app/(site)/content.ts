import { cache } from "react";
import { list, optStr, str } from "@/lib/content/merge";
import {
  toCtaBlock,
  toIconCard,
  toStat,
  toTestimonial,
} from "@/lib/content/normalize";
import type {
  RawCtaBlock,
  RawIconCard,
  RawStat,
  RawTestimonial,
} from "@/lib/content/types";
import { hygraphFetchSafe } from "@/lib/hygraph";
import type { HomeContent } from "./home-defaults";
import { HOME_DEFAULTS } from "./home-defaults";

/*
 * HOME_DEFAULTS and the HomeContent type live in ./home-defaults, which has
 * no runtime imports, so scripts/hygraph-seed.mjs can load the copy under
 * Node's type stripping without resolving the `@/` alias or pulling in React.
 * Import them from ./home-defaults directly rather than through this module.
 */

interface RawHomePage {
  ctaBanner?: RawCtaBlock | null;
  hero?: RawCtaBlock | null;
  seoDescription?: string | null;
  seoTitle?: string | null;
  servicesEyebrow?: string | null;
  servicesHeading?: string | null;
  servicesLinkHref?: string | null;
  servicesLinkLabel?: string | null;
  servicesPreview?: RawIconCard[] | null;
  servicesSubhead?: string | null;
  stats?: RawStat[] | null;
  testimonials?: RawTestimonial[] | null;
  testimonialsEyebrow?: string | null;
  testimonialsHeading?: string | null;
  testimonialsRatingLabel?: string | null;
}

const QUERY = /* GraphQL */ `
  query HomePageContent {
    homePages(first: 1) {
      seoTitle
      seoDescription
      hero {
        eyebrow
        headline
        headlineAccent
        subhead
        buttonLabel
        buttonHref
        phoneLabel
        phoneHref
      }
      stats {
        value
        suffix
        label
      }
      servicesEyebrow
      servicesHeading
      servicesSubhead
      servicesLinkLabel
      servicesLinkHref
      servicesPreview {
        icon
        title
        description
        tags
        href
      }
      testimonialsEyebrow
      testimonialsHeading
      testimonialsRatingLabel
      testimonials {
        name
        vehicle
        quote
      }
      ctaBanner {
        eyebrow
        headline
        headlineAccent
        subhead
        buttonLabel
        buttonHref
        phoneLabel
        phoneHref
      }
    }
  }
`;

/** Pure merge of a Hygraph response over HOME_DEFAULTS. Exported for tests. */
export function mergeHomeContent(cms: RawHomePage | null): HomeContent {
  const src = cms ?? {};
  const d = HOME_DEFAULTS;

  const hero = toCtaBlock(src.hero ?? {});
  const ctaBanner = toCtaBlock(src.ctaBanner ?? {});

  return {
    seoTitle: str(src.seoTitle, d.seoTitle),
    seoDescription: str(src.seoDescription, d.seoDescription),
    hero: {
      eyebrow: optStr(src.hero?.eyebrow, d.hero.eyebrow),
      headline: str(hero.headline, d.hero.headline),
      headlineAccent: str(hero.headlineAccent, d.hero.headlineAccent),
      subhead: str(hero.subhead, d.hero.subhead),
      buttonLabel: str(hero.buttonLabel, d.hero.buttonLabel),
      buttonHref: str(hero.buttonHref, d.hero.buttonHref),
      phoneLabel: str(hero.phoneLabel, d.hero.phoneLabel),
      phoneHref: str(hero.phoneHref, d.hero.phoneHref),
    },
    stats: list(src.stats?.map(toStat), d.stats),
    servicesEyebrow: str(src.servicesEyebrow, d.servicesEyebrow),
    servicesHeading: str(src.servicesHeading, d.servicesHeading),
    servicesSubhead: str(src.servicesSubhead, d.servicesSubhead),
    servicesLinkLabel: str(src.servicesLinkLabel, d.servicesLinkLabel),
    servicesLinkHref: str(src.servicesLinkHref, d.servicesLinkHref),
    servicesPreview: list(
      src.servicesPreview?.map(toIconCard),
      d.servicesPreview
    ),
    testimonialsEyebrow: str(src.testimonialsEyebrow, d.testimonialsEyebrow),
    testimonialsHeading: str(src.testimonialsHeading, d.testimonialsHeading),
    testimonialsRatingLabel: str(
      src.testimonialsRatingLabel,
      d.testimonialsRatingLabel
    ),
    testimonials: list(src.testimonials?.map(toTestimonial), d.testimonials),
    ctaBanner: {
      eyebrow: str(ctaBanner.eyebrow, d.ctaBanner.eyebrow),
      headline: str(ctaBanner.headline, d.ctaBanner.headline),
      headlineAccent: optStr(
        src.ctaBanner?.headlineAccent,
        d.ctaBanner.headlineAccent
      ),
      subhead: str(ctaBanner.subhead, d.ctaBanner.subhead),
      buttonLabel: str(ctaBanner.buttonLabel, d.ctaBanner.buttonLabel),
      buttonHref: str(ctaBanner.buttonHref, d.ctaBanner.buttonHref),
      phoneLabel: str(ctaBanner.phoneLabel, d.ctaBanner.phoneLabel),
      phoneHref: str(ctaBanner.phoneHref, d.ctaBanner.phoneHref),
    },
  };
}

/**
 * Fetch and merge Home page content.
 *
 * cache() dedupes across generateMetadata() and the page component, so a
 * render performs exactly one Hygraph request.
 */
export const getHomeContent = cache(async (): Promise<HomeContent> => {
  const data = await hygraphFetchSafe<{
    homePages: RawHomePage[] | null;
  }>(QUERY);

  const entry = data?.homePages?.[0] ?? null;
  if (data && !entry) {
    const msg = "[hygraph] homePages returned no entry — rendering defaults";
    if (process.env.HYGRAPH_STRICT === "1") {
      throw new Error(msg);
    }
    console.warn(msg);
  }

  return mergeHomeContent(entry);
});
