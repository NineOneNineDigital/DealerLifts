import { describe, expect, it } from "vitest";
import { mergeContactContent } from "@/app/(site)/contact/content";
import { CONTACT_DEFAULTS } from "@/app/(site)/contact/defaults";

describe("mergeContactContent", () => {
  it("returns the full defaults when the entry is unpublished or the fetch failed", () => {
    expect(mergeContactContent(null)).toEqual(CONTACT_DEFAULTS);
  });

  it("returns the full defaults for an entry with every field empty", () => {
    expect(mergeContactContent({})).toEqual(CONTACT_DEFAULTS);
  });

  it("lets CMS values win over defaults", () => {
    const result = mergeContactContent({
      seoTitle: "Get In Touch",
      hero: { headline: "New headline" },
    });

    expect(result.seoTitle).toBe("Get In Touch");
    expect(result.hero.headline).toBe("New headline");
  });

  it("falls back per field, not per object, when a hero field is cleared", () => {
    const result = mergeContactContent({
      hero: { headline: "New headline", eyebrow: "" },
    });

    expect(result.hero.headline).toBe("New headline");
    expect(result.hero.eyebrow).toBe(CONTACT_DEFAULTS.hero.eyebrow);
    expect(result.hero.subhead).toBe(CONTACT_DEFAULTS.hero.subhead);
  });

  it("lets an editor clear headlineAccent to render a one-line headline, while a cleared headline still falls back", () => {
    const result = mergeContactContent({
      hero: { headline: "", headlineAccent: "" },
    });

    expect(result.hero.headlineAccent).toBe("");
    expect(result.hero.headline).toBe(CONTACT_DEFAULTS.hero.headline);
  });
});

describe("CONTACT_DEFAULTS", () => {
  it("preserves the escaped apostrophe in the headline", () => {
    expect(CONTACT_DEFAULTS.hero.headline).toContain("Let's talk");
  });
});
