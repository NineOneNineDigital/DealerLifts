#!/usr/bin/env node
/**
 * Creates the SiteSettings schema — the global contact details shared by the
 * footer, the contact page, the navbar, the shop CTA, and both forms.
 *
 * Committed as a migration so the schema stays reproducible and replayable.
 * Purely additive: nothing touches the six page models or their components.
 *
 * Usage:
 *   node scripts/hygraph-migrate-site-settings.mjs --dry-run   # validate only
 *   node scripts/hygraph-migrate-site-settings.mjs             # apply
 *
 * Requires HYGRAPH_MANAGEMENT_TOKEN — a Permanent Auth Token with management
 * permissions. Read from the environment and never logged.
 *
 * Re-running after a successful apply will fail: Hygraph rejects creating an
 * apiId that already exists. That is intentional — it makes accidental
 * double-application loud rather than silent.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@hygraph/management-sdk";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ENV_LINE = /^([A-Z0-9_]+)=(.*)$/;

/** Minimal .env.local reader — avoids a dotenv dependency for one script. */
function loadEnvLocal() {
  try {
    const raw = readFileSync(join(ROOT, ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const match = line.match(ENV_LINE);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].trim();
      }
    }
  } catch {
    // No .env.local — fall back to the ambient environment.
  }
}

loadEnvLocal();

const authToken = process.env.HYGRAPH_MANAGEMENT_TOKEN;
const endpoint =
  process.env.HYGRAPH_MIGRATION_ENDPOINT ?? process.env.HYGRAPH_CONTENT_API_URL;
const dryRun = process.argv.includes("--dry-run");

if (!authToken) {
  console.error(
    "HYGRAPH_MANAGEMENT_TOKEN is not set.\n\n" +
      "Create one at Project Settings > API Access > Permanent Auth Tokens with\n" +
      "management permissions, then add it to .env.local:\n\n" +
      "  HYGRAPH_MANAGEMENT_TOKEN=...\n"
  );
  process.exit(1);
}

if (!endpoint) {
  console.error("HYGRAPH_CONTENT_API_URL is not set. Add it to .env.local.");
  process.exit(1);
}

const client = new Client({ authToken, endpoint });

/*
 * Social platforms. The brand icons (IconBrandInstagram and friends) are
 * deliberately NOT added to ICON_MAP in lib/content/icons.ts — that enum
 * serves page content. An editor picks a platform and pastes a URL; code maps
 * the platform to its icon. Adding YouTube later is one value here and one
 * entry in SOCIAL_ICONS.
 */
const PLATFORMS = [
  "Instagram",
  "Facebook",
  "TikTok",
  "YouTube",
  "X",
  "LinkedIn",
];

client.createEnumeration({
  apiId: "SocialPlatform",
  displayName: "Social Platform",
  description:
    "Must match SOCIAL_ICONS in lib/content/site-settings.ts — an unmapped value renders no icon.",
  values: PLATFORMS.map((name) => ({ apiId: name, displayName: name })),
});

client.createComponent({
  apiId: "HoursRow",
  apiIdPlural: "HoursRows",
  displayName: "Hours Row",
  description: 'One line of opening hours, e.g. "Mon–Fri" / "8am–5pm".',
});

client.createSimpleField({
  apiId: "label",
  parentApiId: "HoursRow",
  type: "STRING",
  displayName: "Label",
  description: 'The day or range, e.g. "Mon–Fri" or "Saturday".',
  isRequired: false,
});

client.createSimpleField({
  apiId: "value",
  parentApiId: "HoursRow",
  type: "STRING",
  displayName: "Value",
  description: 'The hours, e.g. "8am–5pm" or "Closed".',
  isRequired: false,
});

client.createComponent({
  apiId: "SocialLink",
  apiIdPlural: "SocialLinks",
  displayName: "Social Link",
  description: "One social profile. The icon comes from the platform.",
});

client.createEnumerableField({
  apiId: "platform",
  parentApiId: "SocialLink",
  enumerationApiId: "SocialPlatform",
  displayName: "Platform",
  isRequired: false,
});

client.createSimpleField({
  apiId: "url",
  parentApiId: "SocialLink",
  type: "STRING",
  displayName: "URL",
  description: "Full profile URL, including https://.",
  isRequired: false,
});

/*
 * SiteSettings — a single-entry model, queried siteSettings(first: 1) with
 * [0] taken, matching the six page models. Create exactly ONE entry.
 */
client.createModel({
  apiId: "SiteSettings",
  apiIdPlural: "SiteSettingsEntries",
  displayName: "Site Settings",
  description:
    "Global contact details used by the footer, contact page, navbar, shop CTA and forms. Create exactly ONE entry and publish it.",
});

const settingsFields = [
  [
    "phone",
    "Phone",
    'As displayed, e.g. "(919) 275-8095". The tel: link is generated from the digits.',
    true,
  ],
  ["email", "Email", "Used for the mailto links.", false],
  ["addressStreet", "Address line 1", 'e.g. "73 Crape Myrtle Dr".', false],
  [
    "addressCityStateZip",
    "Address line 2",
    'e.g. "Benson, NC 27504". The footer joins both lines with a comma.',
    false,
  ],
  ["mapsUrl", "Map link", "Where the footer address links to.", false],
];

for (const [apiId, displayName, description, isTitle] of settingsFields) {
  client.createSimpleField({
    apiId,
    modelApiId: "SiteSettings",
    type: "STRING",
    displayName,
    description,
    isRequired: false,
    isTitle,
  });
}

client.createComponentField({
  apiId: "hours",
  parentApiId: "SiteSettings",
  componentApiId: "HoursRow",
  displayName: "Hours",
  description:
    "Rendered in order on the footer and the contact page. Merge or split rows freely.",
  isList: true,
  isRequired: false,
});

client.createComponentField({
  apiId: "socials",
  parentApiId: "SiteSettings",
  componentApiId: "SocialLink",
  displayName: "Social links",
  isList: true,
  isRequired: false,
});

const run = async () => {
  if (dryRun) {
    const result = await client.dryRun();
    console.log("Dry run — no changes applied.");
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  const result = await client.run(true);

  if (result.errors) {
    throw new Error(result.errors);
  }

  console.log(`Migration ${result.status}, finished at ${result.finishedAt}`);
  console.log(
    "\nNext: seed the entry with `npm run hygraph:seed -- settings`."
  );
};

run().catch((error) => {
  console.error("Migration failed:", error.message ?? error);
  process.exit(1);
});
