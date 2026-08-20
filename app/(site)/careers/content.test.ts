import { describe, expect, it } from "vitest";
import { mergeCareersContent } from "@/app/(site)/careers/content";
import { CAREERS_DEFAULTS } from "@/app/(site)/careers/defaults";

describe("mergeCareersContent", () => {
  it("returns the full defaults when the entry is unpublished or the fetch failed", () => {
    expect(mergeCareersContent(null)).toEqual(CAREERS_DEFAULTS);
  });

  it("returns the full defaults for an entry with every field empty", () => {
    expect(mergeCareersContent({})).toEqual(CAREERS_DEFAULTS);
  });

  it("returns a fresh perks array on a null CMS response, not the defaults singleton", () => {
    const result = mergeCareersContent(null);

    expect(result.perks).not.toBe(CAREERS_DEFAULTS.perks);
  });

  it("lets CMS values win over defaults", () => {
    const result = mergeCareersContent({
      seoTitle: "Join Us",
      hero: { headline: "New headline" },
    });

    expect(result.seoTitle).toBe("Join Us");
    expect(result.hero.headline).toBe("New headline");
  });

  it("falls back to the default perks list when the CMS list is empty", () => {
    const result = mergeCareersContent({ perks: [] });

    expect(result.perks).toEqual(CAREERS_DEFAULTS.perks);
  });

  it("replaces the whole perks list rather than interleaving", () => {
    const result = mergeCareersContent({
      perks: [{ icon: "Heart", label: "Only perk" }],
    });

    expect(result.perks).toHaveLength(1);
    expect(result.perks[0].label).toBe("Only perk");
  });

  it("falls back to the default applyEmail when the CMS value is cleared — an empty mailto would be a broken link", () => {
    const result = mergeCareersContent({ applyEmail: "" });

    expect(result.applyEmail).toBe(CAREERS_DEFAULTS.applyEmail);
  });

  it("lets an editor clear headlineAccent to render a one-line headline, while a cleared headline still falls back", () => {
    const result = mergeCareersContent({
      hero: { headline: "", headlineAccent: "Custom accent" },
    });

    expect(result.hero.headlineAccent).toBe("Custom accent");
    expect(result.hero.headline).toBe(CAREERS_DEFAULTS.hero.headline);
  });
});

describe("CAREERS_DEFAULTS", () => {
  it("holds the four perks currently rendered on the site", () => {
    expect(CAREERS_DEFAULTS.perks).toHaveLength(4);
  });

  it("preserves the escaped apostrophes in the copy", () => {
    expect(CAREERS_DEFAULTS.hero.subhead).toContain("We're always looking");
  });
});
