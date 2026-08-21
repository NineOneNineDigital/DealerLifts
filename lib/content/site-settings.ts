import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandTiktok,
  IconBrandX,
  IconBrandYoutube,
} from "@tabler/icons-react";
import { cache } from "react";
import { selectEntry } from "@/lib/content/entry";
import { list, str } from "@/lib/content/merge";
import type {
  HoursRow,
  SiteSettings,
  SocialLink,
} from "@/lib/content/site-settings-defaults";
import { SITE_SETTINGS_DEFAULTS } from "@/lib/content/site-settings-defaults";
import { hygraphFetchSafe } from "@/lib/hygraph";

/*
 * SITE_SETTINGS_DEFAULTS and the SiteSettings type live in
 * ./site-settings-defaults, which has no runtime imports, so
 * scripts/hygraph-seed.mjs can load them under Node's type stripping.
 * Import them from there directly rather than through this module.
 */

interface RawHoursRow {
  label?: string | null;
  value?: string | null;
}

interface RawSocialLink {
  platform?: string | null;
  url?: string | null;
}

interface RawSiteSettings {
  addressCityStateZip?: string | null;
  addressStreet?: string | null;
  email?: string | null;
  hours?: RawHoursRow[] | null;
  mapsUrl?: string | null;
  phone?: string | null;
  socials?: RawSocialLink[] | null;
}

/**
 * Brand icons by platform, kept separate from ICON_MAP in lib/content/icons.ts.
 * That enum serves page content and holds no brand marks; mixing them would
 * offer editors nonsense choices in both places.
 */
const SOCIAL_ICONS = {
  Facebook: IconBrandFacebook,
  Instagram: IconBrandInstagram,
  LinkedIn: IconBrandLinkedin,
  TikTok: IconBrandTiktok,
  X: IconBrandX,
  YouTube: IconBrandYoutube,
} as const;

/**
 * Resolve a CMS platform string to its brand icon.
 *
 * Returns null rather than a fallback icon: a generic mark next to a social
 * link would be worse than omitting the link, and it makes an unmapped
 * platform visible instead of quietly wrong. `Object.hasOwn` keeps inherited
 * properties like "toString" from resolving to a function.
 */
export function socialIcon(
  platform: string | null | undefined
): (typeof SOCIAL_ICONS)[keyof typeof SOCIAL_ICONS] | null {
  if (platform && Object.hasOwn(SOCIAL_ICONS, platform)) {
    return SOCIAL_ICONS[platform as keyof typeof SOCIAL_ICONS];
  }
  return null;
}

const TEL_STRIP = /[^\d+]/g;

/**
 * Build a dialable tel: URL from a display phone number.
 *
 * The CMS stores one human-readable phone field so an editor cannot desync a
 * label from its link. A blank phone yields "" rather than a dead "tel:".
 */
export function telHref(phone: string): string {
  const digits = phone.replace(TEL_STRIP, "");
  return digits ? `tel:${digits}` : "";
}

/** Normalize one CMS hours row. Missing values become "", never undefined. */
function toHoursRow(raw: RawHoursRow): HoursRow {
  return {
    label: raw.label?.trim() ?? "",
    value: raw.value?.trim() ?? "",
  };
}

/** Normalize one CMS social link. An unmapped platform passes through for socialIcon(). */
function toSocialLink(raw: RawSocialLink): SocialLink {
  return {
    platform: (raw.platform?.trim() ?? "") as SocialLink["platform"],
    url: raw.url?.trim() ?? "",
  };
}

/** Pure merge of a Hygraph response over SITE_SETTINGS_DEFAULTS. Exported for tests. */
export function mergeSiteSettings(cms: RawSiteSettings | null): SiteSettings {
  const src = cms ?? {};
  const d = SITE_SETTINGS_DEFAULTS;

  return {
    phone: str(src.phone, d.phone),
    email: str(src.email, d.email),
    addressStreet: str(src.addressStreet, d.addressStreet),
    addressCityStateZip: str(src.addressCityStateZip, d.addressCityStateZip),
    mapsUrl: str(src.mapsUrl, d.mapsUrl),
    hours: list(src.hours?.map(toHoursRow), d.hours),
    socials: list(src.socials?.map(toSocialLink), d.socials),
  };
}

const QUERY = /* GraphQL */ `
  query SiteSettingsContent {
    siteSettingsEntries(first: 1) {
      phone
      email
      addressStreet
      addressCityStateZip
      mapsUrl
      hours {
        label
        value
      }
      socials {
        platform
        url
      }
    }
  }
`;

/**
 * Fetch and merge the global contact details.
 *
 * cache() dedupes within a request, so the site layout and a page can both
 * call this and still perform exactly one Hygraph request per render.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const data = await hygraphFetchSafe<{
    siteSettingsEntries: RawSiteSettings[] | null;
  }>(QUERY);

  return mergeSiteSettings(selectEntry(data, "siteSettingsEntries"));
});
