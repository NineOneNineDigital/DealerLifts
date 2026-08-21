import { cache } from "react";
import { selectEntry } from "@/lib/content/entry";
import { list, optStr, str } from "@/lib/content/merge";
import { toIconLabel } from "@/lib/content/normalize";
import type { RawIconLabel, RawPageHero } from "@/lib/content/types";
import { hygraphFetchSafe } from "@/lib/hygraph";
import type { CareersContentData } from "./defaults";
import { CAREERS_DEFAULTS } from "./defaults";

/*
 * CAREERS_DEFAULTS and the CareersContentData type live in ./defaults, which
 * has no runtime imports, so scripts/hygraph-seed.mjs can load the copy
 * under Node's type stripping without resolving the `@/` alias or pulling in
 * React. Import them from ./defaults directly rather than through this
 * module.
 */

interface RawCareersPage {
  applyEmail?: string | null;
  hero?: RawPageHero | null;
  perks?: RawIconLabel[] | null;
  positionsHeading?: string | null;
  seoDescription?: string | null;
  seoTitle?: string | null;
}

const QUERY = /* GraphQL */ `
  query CareersPageContent {
    careersPages(first: 1) {
      seoTitle
      seoDescription
      hero {
        eyebrow
        headline
        headlineAccent
        subhead
      }
      perks {
        icon
        label
      }
      positionsHeading
      applyEmail
    }
  }
`;

/** Pure merge of a Hygraph response over CAREERS_DEFAULTS. Exported for tests. */
export function mergeCareersContent(
  cms: RawCareersPage | null
): CareersContentData {
  const src = cms ?? {};
  const d = CAREERS_DEFAULTS;

  return {
    seoTitle: str(src.seoTitle, d.seoTitle),
    seoDescription: str(src.seoDescription, d.seoDescription),
    hero: {
      eyebrow: str(src.hero?.eyebrow, d.hero.eyebrow),
      headline: str(src.hero?.headline, d.hero.headline),
      headlineAccent: optStr(src.hero?.headlineAccent, d.hero.headlineAccent),
      subhead: str(src.hero?.subhead, d.hero.subhead),
    },
    perks: list(src.perks?.map(toIconLabel), d.perks),
    positionsHeading: str(src.positionsHeading, d.positionsHeading),
    applyEmail: str(src.applyEmail, d.applyEmail),
  };
}

/**
 * Fetch and merge Careers page content.
 *
 * cache() dedupes across generateMetadata() and the page component, so a
 * render performs exactly one Hygraph request.
 */
export const getCareersContent = cache(
  async (): Promise<CareersContentData> => {
    const data = await hygraphFetchSafe<{
      careersPages: RawCareersPage[] | null;
    }>(QUERY);

    const entry = selectEntry(data, "careersPages");

    return mergeCareersContent(entry);
  }
);
