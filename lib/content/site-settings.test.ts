import { describe, expect, it } from "vitest";
import {
  mergeSiteSettings,
  socialIcon,
  telHref,
} from "@/lib/content/site-settings";
import { SITE_SETTINGS_DEFAULTS } from "@/lib/content/site-settings-defaults";

describe("mergeSiteSettings", () => {
  it("returns the full defaults when the entry is unpublished or the fetch failed", () => {
    expect(mergeSiteSettings(null)).toEqual(SITE_SETTINGS_DEFAULTS);
  });

  it("returns the full defaults for an entry with every field empty", () => {
    expect(mergeSiteSettings({})).toEqual(SITE_SETTINGS_DEFAULTS);
  });

  it("does not return the shared defaults arrays by reference", () => {
    const result = mergeSiteSettings(null);

    expect(result.hours).not.toBe(SITE_SETTINGS_DEFAULTS.hours);
    expect(result.socials).not.toBe(SITE_SETTINGS_DEFAULTS.socials);
  });

  it("lets CMS values win over defaults", () => {
    const result = mergeSiteSettings({ phone: "(555) 123-4567" });

    expect(result.phone).toBe("(555) 123-4567");
  });

  it("falls back per field when one field is cleared", () => {
    const result = mergeSiteSettings({ phone: "(555) 123-4567", email: "" });

    expect(result.phone).toBe("(555) 123-4567");
    expect(result.email).toBe(SITE_SETTINGS_DEFAULTS.email);
  });

  it("replaces the whole hours list rather than interleaving", () => {
    const result = mergeSiteSettings({
      hours: [{ label: "Every day", value: "9–5" }],
    });

    expect(result.hours).toHaveLength(1);
    expect(result.hours[0].label).toBe("Every day");
  });

  it("falls back to the default hours when the CMS list is empty", () => {
    expect(mergeSiteSettings({ hours: [] }).hours).toEqual(
      SITE_SETTINGS_DEFAULTS.hours
    );
  });

  it("normalizes an hours row missing its value to an empty string, never undefined", () => {
    const result = mergeSiteSettings({ hours: [{ label: "Holidays" }] });

    expect(result.hours[0].value).toBe("");
  });

  it("merges socials independently of hours", () => {
    const result = mergeSiteSettings({
      socials: [{ platform: "YouTube", url: "https://youtube.com/@x" }],
    });

    expect(result.socials).toHaveLength(1);
    expect(result.hours).toEqual(SITE_SETTINGS_DEFAULTS.hours);
  });

  it("keeps an unmapped platform as a string for socialIcon to handle at render", () => {
    const result = mergeSiteSettings({
      socials: [{ platform: "Myspace", url: "https://example.com" }],
    });

    expect(String(result.socials[0].platform)).toBe("Myspace");
  });
});

describe("telHref", () => {
  it("strips formatting down to a dialable tel: URL", () => {
    expect(telHref("(919) 275-8095")).toBe("tel:9192758095");
  });

  it("handles a already-bare number", () => {
    expect(telHref("9192758095")).toBe("tel:9192758095");
  });

  it("preserves a leading + for international numbers", () => {
    expect(telHref("+44 20 7946 0958")).toBe("tel:+442079460958");
  });

  it("returns an empty string for a blank phone rather than a dead tel: link", () => {
    expect(telHref("")).toBe("");
    expect(telHref("   ")).toBe("");
  });
});

describe("socialIcon", () => {
  it("resolves every platform in the defaults", () => {
    for (const social of SITE_SETTINGS_DEFAULTS.socials) {
      expect(socialIcon(social.platform)).not.toBeNull();
    }
  });

  it("returns null for an unmapped platform so the renderer can skip it", () => {
    expect(socialIcon("Myspace")).toBeNull();
  });

  it("returns null for an empty platform", () => {
    expect(socialIcon("")).toBeNull();
  });

  it("does not resolve inherited Object properties", () => {
    expect(socialIcon("toString")).toBeNull();
    expect(socialIcon("constructor")).toBeNull();
  });
});

describe("SITE_SETTINGS_DEFAULTS", () => {
  it("holds the three hours rows the contact page renders today", () => {
    expect(SITE_SETTINGS_DEFAULTS.hours).toHaveLength(3);
  });

  it("holds the three social links rendered today", () => {
    expect(SITE_SETTINGS_DEFAULTS.socials).toHaveLength(3);
  });

  it("uses en dashes in the hours, matching the rendered &ndash;", () => {
    expect(SITE_SETTINGS_DEFAULTS.hours[0].label).toBe("Mon–Fri");
    expect(SITE_SETTINGS_DEFAULTS.hours[0].value).toBe("8am–5pm");
  });
});
