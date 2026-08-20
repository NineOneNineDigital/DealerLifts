import { describe, expect, it } from "vitest";
import { mergeServicesContent } from "@/app/(site)/services/content";
import { SERVICES_DEFAULTS } from "@/app/(site)/services/defaults";

describe("mergeServicesContent", () => {
  it("returns the full defaults when the entry is unpublished or the fetch failed", () => {
    expect(mergeServicesContent(null)).toEqual(SERVICES_DEFAULTS);
  });

  it("returns the full defaults for an entry with every field empty", () => {
    expect(mergeServicesContent({})).toEqual(SERVICES_DEFAULTS);
  });

  it("returns a fresh services array on a null CMS response, not the defaults singleton", () => {
    const result = mergeServicesContent(null);

    expect(result.services).not.toBe(SERVICES_DEFAULTS.services);
  });

  it("lets CMS values win over defaults", () => {
    const result = mergeServicesContent({
      seoTitle: "Our Services",
      hero: { headline: "New headline" },
    });

    expect(result.seoTitle).toBe("Our Services");
    expect(result.hero.headline).toBe("New headline");
  });

  it("falls back per field, not per object, when a hero field is cleared", () => {
    const result = mergeServicesContent({
      hero: { headline: "New headline", eyebrow: "" },
    });

    expect(result.hero.headline).toBe("New headline");
    expect(result.hero.eyebrow).toBe(SERVICES_DEFAULTS.hero.eyebrow);
    expect(result.hero.subhead).toBe(SERVICES_DEFAULTS.hero.subhead);
  });

  it("lets an editor clear headlineAccent to render a one-line headline, while a cleared headline still falls back", () => {
    const result = mergeServicesContent({
      hero: { headline: "", headlineAccent: "" },
    });

    expect(result.hero.headlineAccent).toBe("");
    expect(result.hero.headline).toBe(SERVICES_DEFAULTS.hero.headline);
  });

  it("replaces the whole services list rather than interleaving", () => {
    const result = mergeServicesContent({
      services: [
        {
          icon: "Hammer",
          title: "Only service",
          description: "Just the one.",
          tags: ["A"],
        },
      ],
    });

    expect(result.services).toHaveLength(1);
    expect(result.services[0].title).toBe("Only service");
  });

  it("falls back to the default services list when the CMS list is empty", () => {
    const result = mergeServicesContent({ services: [] });

    expect(result.services).toEqual(SERVICES_DEFAULTS.services);
  });

  it("normalizes a card missing tags and href to empty values, never undefined", () => {
    const result = mergeServicesContent({
      services: [{ icon: "Hammer", title: "T", description: "D" }],
    });

    expect(result.services[0].tags).toEqual([]);
    expect(result.services[0].href).toBe("");
  });

  it("keeps an unmapped icon as a string for resolveIcon to handle at render", () => {
    const result = mergeServicesContent({
      services: [{ icon: "TotallyMadeUp", title: "T", description: "D" }],
    });

    // String() keeps the assertion honest without fighting the IconName union,
    // which deliberately does not describe unvalidated CMS values.
    expect(String(result.services[0].icon)).toBe("TotallyMadeUp");
  });

  it("merges process steps independently of the services list", () => {
    const result = mergeServicesContent({
      processSteps: [
        { icon: "CircleCheck", title: "Only step", description: "One." },
      ],
    });

    expect(result.processSteps).toHaveLength(1);
    expect(result.services).toEqual(SERVICES_DEFAULTS.services);
  });
});

describe("SERVICES_DEFAULTS", () => {
  it("holds the eight services currently rendered on the site", () => {
    expect(SERVICES_DEFAULTS.services).toHaveLength(8);
  });

  it("holds the four process steps currently rendered on the site", () => {
    expect(SERVICES_DEFAULTS.processSteps).toHaveLength(4);
  });

  it("preserves the escaped inch marks in the lift kit description", () => {
    const lift = SERVICES_DEFAULTS.services.find(
      (s) => s.title === "Lift Kits & Suspension"
    );

    expect(lift?.description).toContain('2" leveling kits');
    expect(lift?.description).toContain('12" full suspension lifts');
  });

  it("preserves the em dash in the hero subhead", () => {
    expect(SERVICES_DEFAULTS.hero.subhead).toContain("—");
  });
});
