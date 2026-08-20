import { describe, expect, it } from "vitest";
import { mergeGalleryContent } from "@/app/(site)/gallery/content";
import { GALLERY_DEFAULTS } from "@/app/(site)/gallery/defaults";

describe("mergeGalleryContent", () => {
  it("returns the full defaults when the entry is unpublished or the fetch failed", () => {
    expect(mergeGalleryContent(null)).toEqual(GALLERY_DEFAULTS);
  });

  it("returns the full defaults for an entry with every field empty", () => {
    expect(mergeGalleryContent({})).toEqual(GALLERY_DEFAULTS);
  });

  it("lets CMS values win over defaults", () => {
    const result = mergeGalleryContent({
      seoTitle: "Our Builds",
      hero: { headline: "New headline" },
    });

    expect(result.seoTitle).toBe("Our Builds");
    expect(result.hero.headline).toBe("New headline");
  });

  it("falls back per field, not per object, when a hero field is cleared", () => {
    const result = mergeGalleryContent({
      hero: { headline: "New headline", eyebrow: "" },
    });

    expect(result.hero.headline).toBe("New headline");
    expect(result.hero.eyebrow).toBe(GALLERY_DEFAULTS.hero.eyebrow);
    expect(result.hero.subhead).toBe(GALLERY_DEFAULTS.hero.subhead);
  });

  it("lets an editor clear headlineAccent to render a one-line headline, while a cleared headline still falls back", () => {
    const result = mergeGalleryContent({
      hero: { headline: "", headlineAccent: "" },
    });

    expect(result.hero.headlineAccent).toBe("");
    expect(result.hero.headline).toBe(GALLERY_DEFAULTS.hero.headline);
  });
});

describe("GALLERY_DEFAULTS", () => {
  it("preserves the em dash in the hero subhead", () => {
    expect(GALLERY_DEFAULTS.hero.subhead).toContain("—");
  });
});
