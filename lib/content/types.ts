import type { IconName } from "@/lib/content/icons";

/*
 * Merged content types. Fields that may be absent use "" or [] rather than
 * optionals, so components never null-check.
 */

export interface PageHero {
  eyebrow: string;
  headline: string;
  /** Rendered as a gradient span after the headline. "" when unused. */
  headlineAccent: string;
  subhead: string;
}

export interface IconCard {
  description: string;
  /** "" when the card is not a link. */
  href: string;
  icon: IconName;
  /** Chip row under the description. Rendered as "brands" on the services
   *  grid and "tags" on the services preview. Empty for process steps. */
  tags: string[];
  title: string;
}

export interface IconLabel {
  icon: IconName;
  label: string;
}

export interface Stat {
  label: string;
  suffix: string;
  /** Maps to AnimatedCounter's `target` prop. */
  value: number;
}

export interface Testimonial {
  name: string;
  quote: string;
  vehicle: string;
}

export interface CtaBlock {
  buttonHref: string;
  buttonLabel: string;
  /** "" on the home hero, which opens directly on the h1. */
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  phoneHref: string;
  phoneLabel: string;
  subhead: string;
}

/*
 * Raw Hygraph response shapes. Every field is nullable — an unpublished entry,
 * a cleared field, and a never-set field all arrive as null or "".
 */

export interface RawPageHero {
  eyebrow?: string | null;
  headline?: string | null;
  headlineAccent?: string | null;
  subhead?: string | null;
}

export interface RawIconCard {
  description?: string | null;
  href?: string | null;
  icon?: string | null;
  tags?: string[] | null;
  title?: string | null;
}

export interface RawIconLabel {
  icon?: string | null;
  label?: string | null;
}

export interface RawStat {
  label?: string | null;
  suffix?: string | null;
  value?: number | null;
}

export interface RawTestimonial {
  name?: string | null;
  quote?: string | null;
  vehicle?: string | null;
}

export interface RawCtaBlock {
  buttonHref?: string | null;
  buttonLabel?: string | null;
  eyebrow?: string | null;
  headline?: string | null;
  headlineAccent?: string | null;
  phoneHref?: string | null;
  phoneLabel?: string | null;
  subhead?: string | null;
}
