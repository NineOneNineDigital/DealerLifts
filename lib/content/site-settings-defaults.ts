/*
 * Global contact details shape and defaults.
 *
 * Deliberately free of runtime imports — `import type` is erased by TypeScript
 * and by Node's type stripping, so scripts/hygraph-seed.mjs can load this file
 * directly without resolving the `@/` alias. Same arrangement as each page's
 * defaults module; see app/(site)/services/defaults.ts.
 *
 * Unlike page content, this is not scoped to one route: the footer renders it
 * on every site page, and the contact page, navbar, shop CTA and both forms
 * read from it too.
 */

export type SocialPlatform =
  | "Instagram"
  | "Facebook"
  | "TikTok"
  | "YouTube"
  | "X"
  | "LinkedIn";

export interface HoursRow {
  label: string;
  value: string;
}

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

export interface SiteSettings {
  /** Address line 2, e.g. "Benson, NC 27504". */
  addressCityStateZip: string;
  /** Address line 1, e.g. "73 Crape Myrtle Dr". */
  addressStreet: string;
  email: string;
  hours: HoursRow[];
  mapsUrl: string;
  /** Display form. The tel: href is derived from the digits — see telHref(). */
  phone: string;
  socials: SocialLink[];
}

export const SITE_SETTINGS_DEFAULTS: SiteSettings = {
  phone: "(919) 275-8095",
  email: "info@dealerliftsinc.com",
  addressStreet: "73 Crape Myrtle Dr",
  addressCityStateZip: "Benson, NC 27504",
  mapsUrl: "https://maps.google.com/maps?q=73+Crape+Myrtle+Dr+Benson+NC+27504",
  hours: [
    { label: "Mon–Fri", value: "8am–5pm" },
    { label: "Saturday", value: "Closed" },
    { label: "Sunday", value: "Closed" },
  ],
  socials: [
    { platform: "Instagram", url: "https://instagram.com/dealerliftsinc" },
    { platform: "Facebook", url: "https://facebook.com/dealerliftsinc" },
    { platform: "TikTok", url: "https://tiktok.com/@dealerliftsinc" },
  ],
};
