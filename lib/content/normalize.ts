import type { IconCard, RawIconCard } from "@/lib/content/types";

/**
 * Normalize one CMS card. Cards arrive whole from the CMS or not at all, so
 * unlike scalars there is no per-field default to fall back to — missing
 * values become "" / [] to satisfy the no-optionals contract. An unrecognized
 * icon string is passed through for resolveIcon() to handle at render.
 */
export function toIconCard(raw: RawIconCard): IconCard {
  return {
    icon: (raw.icon ?? "") as IconCard["icon"],
    title: raw.title?.trim() ?? "",
    description: raw.description?.trim() ?? "",
    tags: raw.tags ?? [],
    href: raw.href?.trim() ?? "",
  };
}
