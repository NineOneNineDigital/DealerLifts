import type {
  CtaBlock,
  IconCard,
  IconLabel,
  RawCtaBlock,
  RawIconCard,
  RawIconLabel,
  RawStat,
  RawTestimonial,
  Stat,
  Testimonial,
} from "@/lib/content/types";

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

/** Normalize one CMS icon+label pair. */
export function toIconLabel(raw: RawIconLabel): IconLabel {
  return {
    icon: (raw.icon?.trim() ?? "") as IconLabel["icon"],
    label: raw.label?.trim() ?? "",
  };
}

/** Normalize one CMS stat. `value` maps to AnimatedCounter's `target` prop. */
export function toStat(raw: RawStat): Stat {
  return {
    value: raw.value ?? 0,
    suffix: raw.suffix?.trim() ?? "",
    label: raw.label?.trim() ?? "",
  };
}

/** Normalize one CMS testimonial. */
export function toTestimonial(raw: RawTestimonial): Testimonial {
  return {
    name: raw.name?.trim() ?? "",
    vehicle: raw.vehicle?.trim() ?? "",
    quote: raw.quote?.trim() ?? "",
  };
}

/**
 * Normalize a CMS call-to-action block.
 *
 * Unlike the list normalizers this runs on a single nested component, so a
 * fully-absent block still yields a complete object of empty strings — the
 * page merge decides whether to keep it or fall back to its default.
 */
export function toCtaBlock(raw: RawCtaBlock): CtaBlock {
  return {
    eyebrow: raw.eyebrow?.trim() ?? "",
    headline: raw.headline?.trim() ?? "",
    headlineAccent: raw.headlineAccent?.trim() ?? "",
    subhead: raw.subhead?.trim() ?? "",
    buttonLabel: raw.buttonLabel?.trim() ?? "",
    buttonHref: raw.buttonHref?.trim() ?? "",
    phoneLabel: raw.phoneLabel?.trim() ?? "",
    phoneHref: raw.phoneHref?.trim() ?? "",
  };
}
