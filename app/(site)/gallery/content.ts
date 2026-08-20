import { cache } from "react";
import { optStr, str } from "@/lib/content/merge";
import type { RawPageHero } from "@/lib/content/types";
import { hygraphFetchSafe } from "@/lib/hygraph";
import type { GalleryContentData } from "./defaults";
import { GALLERY_DEFAULTS } from "./defaults";

/*
 * GALLERY_DEFAULTS and the GalleryContentData type live in ./defaults, which
 * has no runtime imports, so scripts/hygraph-seed.mjs can load the copy
 * under Node's type stripping without resolving the `@/` alias or pulling in
 * React. Import them from ./defaults directly rather than through this
 * module.
 */

interface RawGalleryPage {
  hero?: RawPageHero | null;
  seoDescription?: string | null;
  seoTitle?: string | null;
}

const QUERY = /* GraphQL */ `
  query GalleryPageContent {
    galleryPages(first: 1) {
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

/** Pure merge of a Hygraph response over GALLERY_DEFAULTS. Exported for tests. */
export function mergeGalleryContent(
  cms: RawGalleryPage | null
): GalleryContentData {
  const src = cms ?? {};
  const d = GALLERY_DEFAULTS;

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
 * Fetch and merge Gallery page content.
 *
 * cache() dedupes across generateMetadata() and the page component, so a
 * render performs exactly one Hygraph request.
 */
export const getGalleryContent = cache(
  async (): Promise<GalleryContentData> => {
    const data = await hygraphFetchSafe<{
      galleryPages: RawGalleryPage[] | null;
    }>(QUERY);

    const entry = data?.galleryPages?.[0] ?? null;
    if (data && !entry) {
      const msg =
        "[hygraph] galleryPages returned no entry — rendering defaults";
      if (process.env.HYGRAPH_STRICT === "1") {
        throw new Error(msg);
      }
      console.warn(msg);
    }

    return mergeGalleryContent(entry);
  }
);
