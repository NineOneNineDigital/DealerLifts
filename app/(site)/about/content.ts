import { cache } from "react";
import { list, optStr, str } from "@/lib/content/merge";
import { toIconLabel } from "@/lib/content/normalize";
import type { RawIconLabel, RawPageHero } from "@/lib/content/types";
import { hygraphFetchSafe } from "@/lib/hygraph";
import type { AboutContentData } from "./defaults";
import { ABOUT_DEFAULTS } from "./defaults";

/*
 * ABOUT_DEFAULTS and the AboutContentData type live in ./defaults, which has
 * no runtime imports, so scripts/hygraph-seed.mjs can load the copy under
 * Node's type stripping without resolving the `@/` alias or pulling in React.
 * Import them from ./defaults directly rather than through this module.
 */

interface RawAboutPage {
  hero?: RawPageHero | null;
  seoDescription?: string | null;
  seoTitle?: string | null;
  storyBody?: { html?: string | null } | null;
  storyHeading?: string | null;
  strengths?: RawIconLabel[] | null;
  teamEyebrow?: string | null;
  teamHeading?: string | null;
  teamSubhead?: string | null;
}

const QUERY = /* GraphQL */ `
  query AboutPageContent {
    aboutPages(first: 1) {
      seoTitle
      seoDescription
      hero {
        eyebrow
        headline
        headlineAccent
        subhead
      }
      storyHeading
      storyBody {
        html
      }
      strengths {
        icon
        label
      }
      teamEyebrow
      teamHeading
      teamSubhead
    }
  }
`;

/** Pure merge of a Hygraph response over ABOUT_DEFAULTS. Exported for tests. */
export function mergeAboutContent(cms: RawAboutPage | null): AboutContentData {
  const src = cms ?? {};
  const d = ABOUT_DEFAULTS;

  return {
    seoTitle: str(src.seoTitle, d.seoTitle),
    seoDescription: str(src.seoDescription, d.seoDescription),
    hero: {
      eyebrow: str(src.hero?.eyebrow, d.hero.eyebrow),
      headline: str(src.hero?.headline, d.hero.headline),
      headlineAccent: optStr(src.hero?.headlineAccent, d.hero.headlineAccent),
      subhead: str(src.hero?.subhead, d.hero.subhead),
    },
    storyHeading: str(src.storyHeading, d.storyHeading),
    storyBody: str(src.storyBody?.html, d.storyBody),
    strengths: list(src.strengths?.map(toIconLabel), d.strengths),
    teamEyebrow: str(src.teamEyebrow, d.teamEyebrow),
    teamHeading: str(src.teamHeading, d.teamHeading),
    teamSubhead: str(src.teamSubhead, d.teamSubhead),
  };
}

/**
 * Fetch and merge About page content.
 *
 * cache() dedupes across generateMetadata() and the page component, so a
 * render performs exactly one Hygraph request.
 */
export const getAboutContent = cache(async (): Promise<AboutContentData> => {
  const data = await hygraphFetchSafe<{
    aboutPages: RawAboutPage[] | null;
  }>(QUERY);

  const entry = data?.aboutPages?.[0] ?? null;
  if (data && !entry) {
    const msg = "[hygraph] aboutPages returned no entry — rendering defaults";
    if (process.env.HYGRAPH_STRICT === "1") {
      throw new Error(msg);
    }
    console.warn(msg);
  }

  return mergeAboutContent(entry);
});
