import { describe, expect, it } from "vitest";
import {
  toCtaBlock,
  toIconCard,
  toIconLabel,
  toStat,
  toTestimonial,
} from "@/lib/content/normalize";

describe("toIconCard", () => {
  it("normalizes missing tags and href to empty values", () => {
    const result = toIconCard({ icon: "Hammer", title: "T", description: "D" });
    expect(result.tags).toEqual([]);
    expect(result.href).toBe("");
  });
});

describe("toIconLabel", () => {
  it("maps a full CMS value", () => {
    expect(toIconLabel({ icon: "Star", label: "100+ Reviews" })).toEqual({
      icon: "Star",
      label: "100+ Reviews",
    });
  });

  it("normalizes a missing label to an empty string, never undefined", () => {
    expect(toIconLabel({ icon: "Star" }).label).toBe("");
  });

  it("normalizes a missing icon to an empty string for resolveIcon to handle", () => {
    expect(String(toIconLabel({ label: "L" }).icon)).toBe("");
  });

  it("trims surrounding whitespace", () => {
    expect(toIconLabel({ icon: "Star", label: "  L  " }).label).toBe("L");
  });
});

describe("toStat", () => {
  it("maps a full CMS value", () => {
    expect(toStat({ value: 100, suffix: "+", label: "Reviews" })).toEqual({
      value: 100,
      suffix: "+",
      label: "Reviews",
    });
  });

  it("preserves a legitimate zero", () => {
    expect(toStat({ value: 0, suffix: "", label: "L" }).value).toBe(0);
  });

  it("normalizes a missing value to zero rather than undefined", () => {
    expect(toStat({ label: "L" }).value).toBe(0);
  });

  it("normalizes a missing suffix to an empty string", () => {
    expect(toStat({ value: 5, label: "L" }).suffix).toBe("");
  });
});

describe("toTestimonial", () => {
  it("maps a full CMS value", () => {
    expect(
      toTestimonial({ name: "Mike J.", vehicle: "F-250", quote: "Great." })
    ).toEqual({ name: "Mike J.", vehicle: "F-250", quote: "Great." });
  });

  it("normalizes every missing field to an empty string", () => {
    expect(toTestimonial({})).toEqual({ name: "", vehicle: "", quote: "" });
  });
});

describe("toCtaBlock", () => {
  it("maps a full CMS value", () => {
    const result = toCtaBlock({
      eyebrow: "Ready?",
      headline: "H",
      headlineAccent: "A",
      subhead: "S",
      buttonLabel: "Go",
      buttonHref: "/contact",
      phoneLabel: "(919) 275-8095",
      phoneHref: "tel:919-275-8095",
    });
    expect(result.eyebrow).toBe("Ready?");
    expect(result.buttonHref).toBe("/contact");
  });

  it("normalizes every missing field to an empty string", () => {
    expect(toCtaBlock({})).toEqual({
      eyebrow: "",
      headline: "",
      headlineAccent: "",
      subhead: "",
      buttonLabel: "",
      buttonHref: "",
      phoneLabel: "",
      phoneHref: "",
    });
  });
});
