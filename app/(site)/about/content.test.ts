import { describe, expect, it } from "vitest";
import { mergeAboutContent } from "@/app/(site)/about/content";
import { ABOUT_DEFAULTS } from "@/app/(site)/about/defaults";

describe("mergeAboutContent", () => {
  it("returns the full defaults when the entry is unpublished or the fetch failed", () => {
    expect(mergeAboutContent(null)).toEqual(ABOUT_DEFAULTS);
  });

  it("returns the full defaults for an entry with every field empty", () => {
    expect(mergeAboutContent({})).toEqual(ABOUT_DEFAULTS);
  });

  it("returns a fresh strengths array on a null CMS response, not the defaults singleton", () => {
    const result = mergeAboutContent(null);

    expect(result.strengths).not.toBe(ABOUT_DEFAULTS.strengths);
  });

  it("lets CMS values win over defaults", () => {
    const result = mergeAboutContent({
      seoTitle: "Our Story",
      hero: { headline: "New headline" },
    });

    expect(result.seoTitle).toBe("Our Story");
    expect(result.hero.headline).toBe("New headline");
  });

  it("falls back to the default storyHeading when the CMS value is cleared", () => {
    const result = mergeAboutContent({ storyHeading: "" });

    expect(result.storyHeading).toBe(ABOUT_DEFAULTS.storyHeading);
  });

  it("falls back to the default strengths list when the CMS list is empty", () => {
    const result = mergeAboutContent({ strengths: [] });

    expect(result.strengths).toEqual(ABOUT_DEFAULTS.strengths);
  });

  it("replaces the whole strengths list rather than interleaving", () => {
    const result = mergeAboutContent({
      strengths: [{ icon: "Heart", label: "Only strength" }],
    });

    expect(result.strengths).toHaveLength(1);
    expect(result.strengths[0].label).toBe("Only strength");
  });

  it("reads storyBody from cms.storyBody.html", () => {
    const result = mergeAboutContent({
      storyBody: { html: "<p>New story.</p>" },
    });

    expect(result.storyBody).toBe("<p>New story.</p>");
  });

  it("falls back to the default storyBody when storyBody.html is blank", () => {
    const result = mergeAboutContent({ storyBody: { html: "" } });

    expect(result.storyBody).toBe(ABOUT_DEFAULTS.storyBody);
  });

  it("falls back to the default storyBody when storyBody is null", () => {
    const result = mergeAboutContent({ storyBody: null });

    expect(result.storyBody).toBe(ABOUT_DEFAULTS.storyBody);
  });

  it("lets a CMS accent through while a cleared headline falls back", () => {
    const result = mergeAboutContent({
      hero: { headline: "", headlineAccent: "Custom accent" },
    });

    expect(result.hero.headlineAccent).toBe("Custom accent");
    expect(result.hero.headline).toBe(ABOUT_DEFAULTS.hero.headline);
  });
});

describe("ABOUT_DEFAULTS", () => {
  it("holds the six strengths currently rendered on the site", () => {
    expect(ABOUT_DEFAULTS.strengths).toHaveLength(6);
  });

  it("holds three story paragraphs", () => {
    expect(ABOUT_DEFAULTS.storyBody.match(/<p>/g)).toHaveLength(3);
  });

  it("preserves the escaped apostrophes in the story copy", () => {
    expect(ABOUT_DEFAULTS.hero.headline).toContain("we're");
    expect(ABOUT_DEFAULTS.storyBody).toContain("We've built our reputation");
  });

  it("preserves the em dash in the story copy", () => {
    expect(ABOUT_DEFAULTS.storyBody).toContain("commitment to excellence —");
  });
});
