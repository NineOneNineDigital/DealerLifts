import { cache } from "react";
import { optStr, str } from "@/lib/content/merge";
import type { RawPageHero } from "@/lib/content/types";
import { hygraphFetchSafe } from "@/lib/hygraph";
import type { ContactContentData } from "./defaults";
import { CONTACT_DEFAULTS } from "./defaults";

/*
 * CONTACT_DEFAULTS and the ContactContentData type live in ./defaults, which
 * has no runtime imports, so scripts/hygraph-seed.mjs can load the copy
 * under Node's type stripping without resolving the `@/` alias or pulling in
 * React. Import them from ./defaults directly rather than through this
 * module.
 */

interface RawContactPage {
  hero?: RawPageHero | null;
  seoDescription?: string | null;
  seoTitle?: string | null;
}

const QUERY = /* GraphQL */ `
  query ContactPageContent {
    contactPages(first: 1) {
      seoTitle
      seoDescription
      hero {
        eyebrow
        headline
        headlineAccent
        subhead
      }
    }
  }
`;

/** Pure merge of a Hygraph response over CONTACT_DEFAULTS. Exported for tests. */
export function mergeContactContent(
  cms: RawContactPage | null
): ContactContentData {
  const src = cms ?? {};
  const d = CONTACT_DEFAULTS;

  return {
    seoTitle: str(src.seoTitle, d.seoTitle),
    seoDescription: str(src.seoDescription, d.seoDescription),
    hero: {
      eyebrow: str(src.hero?.eyebrow, d.hero.eyebrow),
      headline: str(src.hero?.headline, d.hero.headline),
      headlineAccent: optStr(src.hero?.headlineAccent, d.hero.headlineAccent),
      subhead: str(src.hero?.subhead, d.hero.subhead),
    },
  };
}

/**
 * Fetch and merge Contact page content.
 *
 * cache() dedupes across generateMetadata() and the page component, so a
 * render performs exactly one Hygraph request.
 */
export const getContactContent = cache(
  async (): Promise<ContactContentData> => {
    const data = await hygraphFetchSafe<{
      contactPages: RawContactPage[] | null;
    }>(QUERY);

    const entry = data?.contactPages?.[0] ?? null;
    if (data && !entry) {
      const msg =
        "[hygraph] contactPages returned no entry — rendering defaults";
      if (process.env.HYGRAPH_STRICT === "1") {
        throw new Error(msg);
      }
      console.warn(msg);
    }

    return mergeContactContent(entry);
  }
);
