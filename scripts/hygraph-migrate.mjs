#!/usr/bin/env node
/**
 * Creates the Hygraph schema that drives CMS-editable page content.
 *
 * This is a migration, not a one-off: it is committed so the schema is
 * reproducible, reviewable, and replayable into another environment. Hygraph
 * migrations are additive here — nothing touches the existing JobPosition,
 * TeamMember, or CompletedProject models.
 *
 * Usage:
 *   node scripts/hygraph-migrate.mjs --dry-run   # validate, change nothing
 *   node scripts/hygraph-migrate.mjs             # apply
 *
 * Requires HYGRAPH_MANAGEMENT_TOKEN — a Permanent Auth Token with management
 * permissions, from Project Settings > API Access > Permanent Auth Tokens.
 * The token is read from the environment and never logged.
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
 * The icon enum. These 20 values must stay in sync with ICON_MAP in
 * lib/content/icons.ts — a value here that is missing there renders the
 * fallback icon, and a value there that is missing here cannot be selected
 * by an editor.
 */
const ICON_NAMES = [
  "ArrowUp",
  "Bulb",
  "CalendarCheck",
  "Car4wd",
  "Certificate",
  "CircleCheck",
  "Clock24",
  "Disc",
  "Droplet",
  "Engine",
  "FileDescription",
  "Hammer",
  "Heart",
  "MessageCircle",
  "ShieldCheck",
  "Star",
  "Tool",
  "Trophy",
  "Users",
  "Wheel",
];

client.createEnumeration({
  apiId: "IconName",
  displayName: "Icon Name",
  description:
    "Icons available to CMS content. Must match ICON_MAP in lib/content/icons.ts.",
  values: ICON_NAMES.map((name) => ({ apiId: name, displayName: name })),
});

/*
 * PageHero — the eyebrow/headline/subhead block shared by five marketing
 * pages. No field is required: the code supplies defaults, and a required
 * field would stop an editor from clearing one.
 */
client.createComponent({
  apiId: "PageHero",
  apiIdPlural: "PageHeroes",
  displayName: "Page Hero",
  description: "Eyebrow, headline and subhead for a marketing page hero.",
});

const heroFields = [
  ["eyebrow", "Eyebrow", "Small blue uppercase label above the headline."],
  ["headline", "Headline", "Main h1 text."],
  [
    "headlineAccent",
    "Headline accent",
    "Optional second phrase rendered in the blue gradient. Clear it to render a single-line headline.",
  ],
  ["subhead", "Subhead", "Supporting paragraph under the headline."],
];

for (const [apiId, displayName, description] of heroFields) {
  client.createSimpleField({
    apiId,
    parentApiId: "PageHero",
    type: "STRING",
    displayName,
    description,
    isRequired: false,
  });
}

/*
 * IconCard — one card in a services grid, process step list, or services
 * preview. `tags` renders as a chip row ("brands" on the services grid,
 * "tags" on the home preview); `href` only does anything where the renderer
 * links the card, which today is the home services preview only.
 */
client.createComponent({
  apiId: "IconCard",
  apiIdPlural: "IconCards",
  displayName: "Icon Card",
  description: "An icon, title and description — used for grids and steps.",
});

client.createEnumerableField({
  apiId: "icon",
  parentApiId: "IconCard",
  enumerationApiId: "IconName",
  displayName: "Icon",
  description: "Unrecognized values fall back to a neutral circle icon.",
  isRequired: false,
});

client.createSimpleField({
  apiId: "title",
  parentApiId: "IconCard",
  type: "STRING",
  displayName: "Title",
  isRequired: false,
});

client.createSimpleField({
  apiId: "description",
  parentApiId: "IconCard",
  type: "STRING",
  displayName: "Description",
  formRenderer: "GCMS_MULTI_LINE",
  isRequired: false,
});

client.createSimpleField({
  apiId: "tags",
  parentApiId: "IconCard",
  type: "STRING",
  displayName: "Tags",
  description:
    "Chip row under the description — brand names on the services grid. Leave empty for process steps.",
  isList: true,
  isRequired: false,
});

client.createSimpleField({
  apiId: "href",
  parentApiId: "IconCard",
  type: "STRING",
  displayName: "Link",
  description:
    "Only used where the renderer links the card. Leave empty on the services grid and process steps.",
  isRequired: false,
});

/*
 * ServicesPage — a single-entry model. The code queries servicesPages(first: 1)
 * and takes [0], because the generated singular query needs an entry ID we do
 * not know. Create exactly one entry; a second is silently ignored.
 */
client.createModel({
  apiId: "ServicesPage",
  apiIdPlural: "ServicesPages",
  displayName: "Services Page",
  description:
    "Content for /services. Create exactly ONE entry and publish it.",
});

client.createSimpleField({
  apiId: "seoTitle",
  modelApiId: "ServicesPage",
  type: "STRING",
  displayName: "SEO title",
  isRequired: false,
  isTitle: true,
});

client.createSimpleField({
  apiId: "seoDescription",
  modelApiId: "ServicesPage",
  type: "STRING",
  displayName: "SEO description",
  formRenderer: "GCMS_MULTI_LINE",
  isRequired: false,
});

client.createComponentField({
  apiId: "hero",
  parentApiId: "ServicesPage",
  componentApiId: "PageHero",
  displayName: "Hero",
  isList: false,
  isRequired: false,
});

client.createComponentField({
  apiId: "services",
  parentApiId: "ServicesPage",
  componentApiId: "IconCard",
  displayName: "Services",
  description: "The eight service cards. Reorder to change display order.",
  isList: true,
  isRequired: false,
});

const processFields = [
  ["processEyebrow", "Process eyebrow", "Label above the process heading."],
  ["processHeading", "Process heading", "The h2 for the process section."],
  ["processCtaLabel", "Process CTA label", "Text on the process button."],
  ["processCtaHref", "Process CTA link", "Where the process button points."],
];

for (const [apiId, displayName, description] of processFields) {
  client.createSimpleField({
    apiId,
    modelApiId: "ServicesPage",
    type: "STRING",
    displayName,
    description,
    isRequired: false,
  });
}

client.createComponentField({
  apiId: "processSteps",
  parentApiId: "ServicesPage",
  componentApiId: "IconCard",
  displayName: "Process steps",
  description: "The numbered steps. Numbering is generated, not stored.",
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
    "\nNext: seed the entry with `node scripts/hygraph-seed.mjs`, then grant\n" +
      "Read on the Published stage for ServicesPage under Project Settings >\n" +
      "API Access > Public Content API."
  );
};

run().catch((error) => {
  console.error("Migration failed:", error.message ?? error);
  process.exit(1);
});
