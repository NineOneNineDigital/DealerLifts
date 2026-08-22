#!/usr/bin/env node
/**
 * Creates the Phase 2 Hygraph schema that drives CMS-editable page content.
 *
 * This is a migration, not a one-off: it is committed so the schema is
 * reproducible, reviewable, and replayable into another environment. Hygraph
 * migrations are additive here — nothing touches the existing JobPosition,
 * TeamMember, or CompletedProject models.
 *
 * Usage:
 *   node scripts/hygraph-migrate-phase2.mjs --dry-run   # validate, change nothing
 *   node scripts/hygraph-migrate-phase2.mjs             # apply
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
 * Four component types Phase 1 did not need. PageHero, IconCard and the
 * IconName enum already exist from Phase 1 and are reused as-is.
 */
client.createComponent({
  apiId: "IconLabel",
  apiIdPlural: "IconLabels",
  displayName: "Icon Label",
  description: "An icon with a short label — strengths and perks strips.",
});

client.createEnumerableField({
  apiId: "icon",
  parentApiId: "IconLabel",
  enumerationApiId: "IconName",
  displayName: "Icon",
  isRequired: false,
});

client.createSimpleField({
  apiId: "label",
  parentApiId: "IconLabel",
  type: "STRING",
  displayName: "Label",
  isRequired: false,
});

client.createComponent({
  apiId: "Stat",
  apiIdPlural: "Stats",
  displayName: "Stat",
  description: "One animated counter in the home stats bar.",
});

client.createSimpleField({
  apiId: "value",
  parentApiId: "Stat",
  type: "INT",
  displayName: "Value",
  description: "The number counted up to. Digits only — no + or comma.",
  isRequired: false,
});

client.createSimpleField({
  apiId: "suffix",
  parentApiId: "Stat",
  type: "STRING",
  displayName: "Suffix",
  description: 'Rendered after the number, e.g. "+".',
  isRequired: false,
});

client.createSimpleField({
  apiId: "label",
  parentApiId: "Stat",
  type: "STRING",
  displayName: "Label",
  isRequired: false,
});

client.createComponent({
  apiId: "Testimonial",
  apiIdPlural: "Testimonials",
  displayName: "Testimonial",
  description: "A customer quote on the home page.",
});

const testimonialFields = [
  ["name", "Name", 'Display name, e.g. "Mike J."'],
  ["vehicle", "Vehicle", 'e.g. "2023 Ford F-250"'],
];

for (const [apiId, displayName, description] of testimonialFields) {
  client.createSimpleField({
    apiId,
    parentApiId: "Testimonial",
    type: "STRING",
    displayName,
    description,
    isRequired: false,
  });
}

client.createSimpleField({
  apiId: "quote",
  parentApiId: "Testimonial",
  type: "STRING",
  displayName: "Quote",
  description: "The review text. Quotation marks are added by the page.",
  formRenderer: "GCMS_MULTI_LINE",
  isRequired: false,
});

client.createComponent({
  apiId: "CtaBlock",
  apiIdPlural: "CtaBlocks",
  displayName: "CTA Block",
  description:
    "A headline with a button and a phone link — the home hero and CTA banner.",
});

const ctaFields = [
  [
    "eyebrow",
    "Eyebrow",
    "Optional label above the headline. The home hero leaves this empty.",
  ],
  ["headline", "Headline", "First line of the headline."],
  [
    "headlineAccent",
    "Headline accent",
    "Second line. On the home hero this renders in the blue gradient.",
  ],
  ["subhead", "Subhead", "Supporting paragraph."],
  ["buttonLabel", "Button label", "Text on the primary button."],
  ["buttonHref", "Button link", "Where the primary button points."],
  ["phoneLabel", "Phone label", "Phone number as displayed."],
  ["phoneHref", "Phone link", 'The tel: URL, e.g. "tel:919-275-8095".'],
];

for (const [apiId, displayName, description] of ctaFields) {
  client.createSimpleField({
    apiId,
    parentApiId: "CtaBlock",
    type: "STRING",
    displayName,
    description,
    isRequired: false,
  });
}

/* ---- Page models ---- */

/** Adds seoTitle + seoDescription to a model. */
function addSeo(modelApiId) {
  client.createSimpleField({
    apiId: "seoTitle",
    modelApiId,
    type: "STRING",
    displayName: "SEO title",
    isRequired: false,
    isTitle: true,
  });
  client.createSimpleField({
    apiId: "seoDescription",
    modelApiId,
    type: "STRING",
    displayName: "SEO description",
    formRenderer: "GCMS_MULTI_LINE",
    isRequired: false,
  });
}

/** Adds a PageHero component field to a model. */
function addHero(modelApiId) {
  client.createComponentField({
    apiId: "hero",
    parentApiId: modelApiId,
    componentApiId: "PageHero",
    displayName: "Hero",
    isList: false,
    isRequired: false,
  });
}

/** Adds a plain string field to a model. */
function addString(modelApiId, apiId, displayName, description) {
  client.createSimpleField({
    apiId,
    modelApiId,
    type: "STRING",
    displayName,
    description,
    isRequired: false,
  });
}

// --- HomePage ---
client.createModel({
  apiId: "HomePage",
  apiIdPlural: "HomePages",
  displayName: "Home Page",
  description: "Content for /. Create exactly ONE entry and publish it.",
});
addSeo("HomePage");
client.createComponentField({
  apiId: "hero",
  parentApiId: "HomePage",
  componentApiId: "CtaBlock",
  displayName: "Hero",
  description: "The full-bleed hero. Leave the eyebrow empty.",
  isList: false,
  isRequired: false,
});
client.createComponentField({
  apiId: "stats",
  parentApiId: "HomePage",
  componentApiId: "Stat",
  displayName: "Stats",
  isList: true,
  isRequired: false,
});
addString("HomePage", "servicesEyebrow", "Services eyebrow");
addString("HomePage", "servicesHeading", "Services heading");
addString("HomePage", "servicesSubhead", "Services subhead");
addString("HomePage", "servicesLinkLabel", "Services link label");
addString("HomePage", "servicesLinkHref", "Services link");
client.createComponentField({
  apiId: "servicesPreview",
  parentApiId: "HomePage",
  componentApiId: "IconCard",
  displayName: "Services preview",
  isList: true,
  isRequired: false,
});
addString("HomePage", "testimonialsEyebrow", "Testimonials eyebrow");
addString("HomePage", "testimonialsHeading", "Testimonials heading");
addString(
  "HomePage",
  "testimonialsRatingLabel",
  "Testimonials rating label",
  'Text beside the stars, e.g. "100+ five-star reviews".'
);
client.createComponentField({
  apiId: "testimonials",
  parentApiId: "HomePage",
  componentApiId: "Testimonial",
  displayName: "Testimonials",
  isList: true,
  isRequired: false,
});
client.createComponentField({
  apiId: "ctaBanner",
  parentApiId: "HomePage",
  componentApiId: "CtaBlock",
  displayName: "CTA banner",
  isList: false,
  isRequired: false,
});

// --- AboutPage ---
client.createModel({
  apiId: "AboutPage",
  apiIdPlural: "AboutPages",
  displayName: "About Page",
  description: "Content for /about. Create exactly ONE entry and publish it.",
});
addSeo("AboutPage");
addHero("AboutPage");
addString("AboutPage", "storyHeading", "Story heading");
client.createSimpleField({
  apiId: "storyBody",
  modelApiId: "AboutPage",
  type: "RICHTEXT",
  displayName: "Story body",
  description: "The multi-paragraph story. Rendered as rich text.",
  isRequired: false,
});
client.createComponentField({
  apiId: "strengths",
  parentApiId: "AboutPage",
  componentApiId: "IconLabel",
  displayName: "Strengths",
  isList: true,
  isRequired: false,
});
addString("AboutPage", "teamEyebrow", "Team eyebrow");
addString("AboutPage", "teamHeading", "Team heading");
addString("AboutPage", "teamSubhead", "Team subhead");

// --- CareersPage ---
client.createModel({
  apiId: "CareersPage",
  apiIdPlural: "CareersPages",
  displayName: "Careers Page",
  description: "Content for /careers. Create exactly ONE entry and publish it.",
});
addSeo("CareersPage");
addHero("CareersPage");
client.createComponentField({
  apiId: "perks",
  parentApiId: "CareersPage",
  componentApiId: "IconLabel",
  displayName: "Perks",
  isList: true,
  isRequired: false,
});
addString("CareersPage", "positionsHeading", "Open positions heading");
addString(
  "CareersPage",
  "applyEmail",
  "Application email",
  "Used for the mailto links and the no-positions fallback copy."
);

// --- GalleryPage ---
client.createModel({
  apiId: "GalleryPage",
  apiIdPlural: "GalleryPages",
  displayName: "Gallery Page",
  description: "Content for /gallery. Create exactly ONE entry and publish it.",
});
addSeo("GalleryPage");
addHero("GalleryPage");

// --- ContactPage ---
client.createModel({
  apiId: "ContactPage",
  apiIdPlural: "ContactPages",
  displayName: "Contact Page",
  description: "Content for /contact. Create exactly ONE entry and publish it.",
});
addSeo("ContactPage");
addHero("ContactPage");

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
    "\nNext: seed a page's entry with `npm run hygraph:seed <page>`, then\n" +
      "grant Read on the Published stage for each new model under Project\n" +
      "Settings > API Access > Public Content API."
  );
};

run().catch((error) => {
  console.error("Migration failed:", error.message ?? error);
  process.exit(1);
});
