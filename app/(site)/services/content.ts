import { cache } from "react";
import { list, optStr, str } from "@/lib/content/merge";
import { toIconCard } from "@/lib/content/normalize";
import type { RawIconCard, RawPageHero } from "@/lib/content/types";
import { hygraphFetchSafe } from "@/lib/hygraph";
import type { ServicesContent } from "./defaults";
import { SERVICES_DEFAULTS } from "./defaults";

/*
 * SERVICES_DEFAULTS and the ServicesContent type live in ./defaults, which has
 * no runtime imports, so scripts/hygraph-seed.mjs can load the copy under
 * Node's type stripping without resolving the `@/` alias or pulling in React.
 * Import them from ./defaults directly rather than through this module.
 */

interface RawServicesPage {
  hero?: RawPageHero | null;
  processCtaHref?: string | null;
  processCtaLabel?: string | null;
  processEyebrow?: string | null;
  processHeading?: string | null;
  processSteps?: RawIconCard[] | null;
  seoDescription?: string | null;
  seoTitle?: string | null;
  services?: RawIconCard[] | null;
}

const QUERY = /* GraphQL */ `
  query ServicesPageContent {
    servicesPages(first: 1) {
      seoTitle
      seoDescription
      hero {
        eyebrow
        headline
        headlineAccent
        subhead
      }
      services {
        icon
        title
        description
        tags
        href
      }
      processEyebrow
      processHeading
      processCtaLabel
      processCtaHref
      processSteps {
        icon
        title
        description
        tags
        href
      }
    }
  }
`;

/** Pure merge of a Hygraph response over SERVICES_DEFAULTS. Exported for tests. */
export function mergeServicesContent(
  cms: RawServicesPage | null
): ServicesContent {
  const src = cms ?? {};
  const d = SERVICES_DEFAULTS;

  return {
    seoTitle: str(src.seoTitle, d.seoTitle),
    seoDescription: str(src.seoDescription, d.seoDescription),
    hero: {
      eyebrow: str(src.hero?.eyebrow, d.hero.eyebrow),
      headline: str(src.hero?.headline, d.hero.headline),
      headlineAccent: optStr(src.hero?.headlineAccent, d.hero.headlineAccent),
      subhead: str(src.hero?.subhead, d.hero.subhead),
    },
    services: list(src.services?.map(toIconCard), d.services),
    processEyebrow: str(src.processEyebrow, d.processEyebrow),
    processHeading: str(src.processHeading, d.processHeading),
    processCtaLabel: str(src.processCtaLabel, d.processCtaLabel),
    processCtaHref: str(src.processCtaHref, d.processCtaHref),
    processSteps: list(src.processSteps?.map(toIconCard), d.processSteps),
  };
}

/**
 * Fetch and merge Services page content.
 *
 * cache() dedupes across generateMetadata() and the page component, so a
 * render performs exactly one Hygraph request.
 */
export const getServicesContent = cache(async (): Promise<ServicesContent> => {
  const data = await hygraphFetchSafe<{
    servicesPages: RawServicesPage[] | null;
  }>(QUERY);

  const entry = data?.servicesPages?.[0] ?? null;
  if (data && !entry) {
    const msg =
      "[hygraph] servicesPages returned no entry — rendering defaults";
    if (process.env.HYGRAPH_STRICT === "1") {
      throw new Error(msg);
    }
    console.warn(msg);
  }

  return mergeServicesContent(entry);
});
