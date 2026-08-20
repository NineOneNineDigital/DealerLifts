import { IconCircle, IconHammer, IconMessageCircle } from "@tabler/icons-react";
import { describe, expect, it } from "vitest";
import { ICON_MAP, resolveIcon } from "@/lib/content/icons";

describe("resolveIcon", () => {
  it("resolves a known enum name to its Tabler component", () => {
    expect(resolveIcon("Hammer")).toBe(IconHammer);
  });

  it("resolves every key declared in ICON_MAP", () => {
    for (const name of Object.keys(ICON_MAP)) {
      expect(resolveIcon(name)).toBe(ICON_MAP[name as keyof typeof ICON_MAP]);
    }
  });

  it("falls back to a neutral icon for an unmapped CMS value", () => {
    expect(resolveIcon("NotARealIcon")).toBe(IconCircle);
  });

  it("falls back when the CMS returns null", () => {
    expect(resolveIcon(null)).toBe(IconCircle);
  });

  it("falls back when the CMS returns undefined", () => {
    expect(resolveIcon(undefined)).toBe(IconCircle);
  });

  it("falls back on an empty string", () => {
    expect(resolveIcon("")).toBe(IconCircle);
  });

  it("does not resolve inherited Object properties", () => {
    expect(resolveIcon("toString")).toBe(IconCircle);
    expect(resolveIcon("constructor")).toBe(IconCircle);
  });
});

describe("ICON_MAP", () => {
  it("covers every icon used across the marketing pages", () => {
    expect(ICON_MAP.MessageCircle).toBe(IconMessageCircle);
    expect(Object.keys(ICON_MAP)).toHaveLength(20);
  });
});
