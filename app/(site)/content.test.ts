import { describe, expect, it } from "vitest";
import { mergeHomeContent } from "@/app/(site)/content";
import { HOME_DEFAULTS } from "@/app/(site)/home-defaults";

describe("mergeHomeContent", () => {
  it("returns the full defaults when the entry is unpublished or the fetch failed", () => {
    expect(mergeHomeContent(null)).toEqual(HOME_DEFAULTS);
  });

  it("returns the full defaults for an entry with every field empty", () => {
    expect(mergeHomeContent({})).toEqual(HOME_DEFAULTS);
  });

  it("does not return the shared defaults arrays by reference", () => {
    const result = mergeHomeContent(null);
    expect(result.stats).not.toBe(HOME_DEFAULTS.stats);
    expect(result.testimonials).not.toBe(HOME_DEFAULTS.testimonials);
  });

  it("lets CMS values win over defaults", () => {
    const result = mergeHomeContent({ seoTitle: "Dealer Lifts Inc" });
    expect(result.seoTitle).toBe("Dealer Lifts Inc");
  });

  it("falls back per field when one hero field is cleared", () => {
    const result = mergeHomeContent({
      hero: { headline: "New", buttonLabel: "" },
    });
    expect(result.hero.headline).toBe("New");
    expect(result.hero.buttonLabel).toBe(HOME_DEFAULTS.hero.buttonLabel);
  });

  it("lets an editor clear the optional hero eyebrow", () => {
    const result = mergeHomeContent({ hero: { eyebrow: "" } });
    expect(result.hero.eyebrow).toBe("");
  });

  it("replaces the whole stats list rather than interleaving", () => {
    const result = mergeHomeContent({
      stats: [{ value: 1, suffix: "x", label: "Only" }],
    });
    expect(result.stats).toHaveLength(1);
  });

  it("falls back to default stats when the CMS list is empty", () => {
    expect(mergeHomeContent({ stats: [] }).stats).toEqual(HOME_DEFAULTS.stats);
  });

  it("preserves a stat value of zero", () => {
    const result = mergeHomeContent({
      stats: [{ value: 0, suffix: "", label: "Zero" }],
    });
    expect(result.stats[0].value).toBe(0);
  });

  it("merges testimonials independently of stats", () => {
    const result = mergeHomeContent({
      testimonials: [{ name: "N", vehicle: "V", quote: "Q" }],
    });
    expect(result.testimonials).toHaveLength(1);
    expect(result.stats).toEqual(HOME_DEFAULTS.stats);
  });

  it("falls back to the default CTA banner when the block is absent", () => {
    expect(mergeHomeContent({}).ctaBanner).toEqual(HOME_DEFAULTS.ctaBanner);
  });
});

describe("HOME_DEFAULTS", () => {
  it("holds the four stats currently rendered", () => {
    expect(HOME_DEFAULTS.stats).toHaveLength(4);
  });

  it("holds the three testimonials currently rendered", () => {
    expect(HOME_DEFAULTS.testimonials).toHaveLength(3);
  });

  it("preserves the non-breaking space in the hero subhead", () => {
    expect(HOME_DEFAULTS.hero.subhead).toContain("30 years");
  });

  it("preserves the non-breaking spaces in the CTA banner accent", () => {
    expect(HOME_DEFAULTS.ctaBanner.headlineAccent).toBe("running its best.");
  });

  it("leaves the home hero eyebrow empty — it opens on the h1", () => {
    expect(HOME_DEFAULTS.hero.eyebrow).toBe("");
  });
});
