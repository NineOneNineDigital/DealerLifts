#!/usr/bin/env node
/**
 * Seeds a Hygraph page entry from that page's code defaults, then publishes it.
 *
 * The copy comes from that page's app/(site)/**\/defaults.ts — the same
 * object the page falls back to — so the CMS starts byte-identical to the
 * rendered site and there is one source of truth rather than two hand-synced
 * ones.
 *
 * Run scripts/hygraph-migrate.mjs and scripts/hygraph-migrate-phase2.mjs
 * first; this needs the schema to exist.
 *
 * Usage:
 *   node scripts/hygraph-seed.mjs <page> --introspect  # print the generated input shape
 *   node scripts/hygraph-seed.mjs <page> --dry-run     # print the mutation, send nothing
 *   node scripts/hygraph-seed.mjs <page>               # create and publish
 *
 * <page> is one of the keys of PAGES below (e.g. "services").
 *
 * Requires a token with content mutation + publish permissions on the
 * Published stage. HYGRAPH_MUTATION_TOKEN if set, otherwise
 * HYGRAPH_MANAGEMENT_TOKEN. Read from the environment, never logged.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ENV_LINE = /^([A-Z0-9_]+)=(.*)$/;
const CDN_URL = /^https:\/\/([a-z0-9-]+)\.cdn\.hygraph\.com\/content\/(.+)$/;

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

const token =
  process.env.HYGRAPH_MUTATION_TOKEN ?? process.env.HYGRAPH_MANAGEMENT_TOKEN;
const introspectOnly = process.argv.includes("--introspect");
const dryRun = process.argv.includes("--dry-run");
const pageArg = process.argv.slice(2).find((arg) => !arg.startsWith("--"));

/**
 * Mutations must go to the regular Content API, not the CDN read endpoint.
 * `https://{region}.cdn.hygraph.com/content/{id}/{env}`
 *   becomes `https://api-{region}.hygraph.com/v2/{id}/{env}`.
 */
function mutationEndpoint() {
  if (process.env.HYGRAPH_MUTATION_ENDPOINT) {
    return process.env.HYGRAPH_MUTATION_ENDPOINT;
  }

  const url = process.env.HYGRAPH_CONTENT_API_URL;
  if (!url) {
    throw new Error(
      "HYGRAPH_CONTENT_API_URL is not set. Add it to .env.local."
    );
  }

  const cdn = url.match(CDN_URL);
  return cdn ? `https://api-${cdn[1]}.hygraph.com/v2/${cdn[2]}` : url;
}

const ENDPOINT = mutationEndpoint();

async function gql(query, variables) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();

  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }

  return json.data;
}

/**
 * Hygraph's generated create-input for a component field differs depending on
 * whether it generated a plain component or a union wrapper, so read the real
 * shape rather than assuming one. Printed on failure to make a mismatch a
 * 30-second fix instead of a guessing game.
 */
async function introspectInput(typeName) {
  const data = await gql(
    `query Introspect($name: String!) {
       __type(name: $name) {
         name
         inputFields {
           name
           type { kind name ofType { kind name ofType { kind name } } }
         }
       }
     }`,
    { name: typeName }
  );
  return data.__type;
}

/** Card fields the CMS stores. Numbering and icons resolve at render. */
function cardInput(card) {
  return {
    icon: card.icon,
    title: card.title,
    description: card.description,
    tags: card.tags,
    href: card.href,
  };
}

/**
 * Each entry maps a CLI name to its model, its defaults module, and a builder
 * turning those defaults into the model's CreateInput. `wrap` is the
 * card-normalizing function resolved at runtime from introspection.
 */
const PAGES = {
  services: {
    model: "ServicesPage",
    plural: "servicesPages",
    load: () => import("../app/(site)/services/defaults.ts"),
    key: "SERVICES_DEFAULTS",
    build: (d, wrap) => ({
      seoTitle: d.seoTitle,
      seoDescription: d.seoDescription,
      hero: { create: { ...d.hero } },
      services: { create: d.services.map(wrap) },
      processEyebrow: d.processEyebrow,
      processHeading: d.processHeading,
      processCtaLabel: d.processCtaLabel,
      processCtaHref: d.processCtaHref,
      processSteps: { create: d.processSteps.map(wrap) },
    }),
  },
  home: {
    model: "HomePage",
    plural: "homePages",
    load: () => import("../app/(site)/home-defaults.ts"),
    key: "HOME_DEFAULTS",
    build: (d, wrap) => ({
      seoTitle: d.seoTitle,
      seoDescription: d.seoDescription,
      hero: { create: { ...d.hero } },
      stats: { create: d.stats.map((s) => ({ ...s })) },
      servicesEyebrow: d.servicesEyebrow,
      servicesHeading: d.servicesHeading,
      servicesSubhead: d.servicesSubhead,
      servicesLinkLabel: d.servicesLinkLabel,
      servicesLinkHref: d.servicesLinkHref,
      servicesPreview: { create: d.servicesPreview.map(wrap) },
      testimonialsEyebrow: d.testimonialsEyebrow,
      testimonialsHeading: d.testimonialsHeading,
      testimonialsRatingLabel: d.testimonialsRatingLabel,
      testimonials: { create: d.testimonials.map((t) => ({ ...t })) },
      ctaBanner: { create: { ...d.ctaBanner } },
    }),
  },
  // about / careers / gallery / contact entries are added by the
  // tasks that create each page's defaults module.
};

const run = async () => {
  if (!(pageArg && PAGES[pageArg])) {
    console.error(
      "Usage: node scripts/hygraph-seed.mjs <page> [--dry-run|--introspect]\n\n" +
        `<page> must be one of: ${Object.keys(PAGES).join(", ")}`
    );
    process.exit(1);
  }

  const page = PAGES[pageArg];

  if (!token) {
    console.error(
      "No token. Set HYGRAPH_MUTATION_TOKEN (or HYGRAPH_MANAGEMENT_TOKEN) in\n" +
        ".env.local, with content mutation + publish permissions."
    );
    process.exit(1);
  }

  if (introspectOnly) {
    for (const name of [
      `${page.model}CreateInput`,
      "IconCardCreateOneInlineInput",
      "IconCardCreateManyInlineInput",
      "PageHeroCreateOneInlineInput",
    ]) {
      const type = await introspectInput(name);
      console.log(`\n=== ${name} ===`);
      console.log(
        type
          ? type.inputFields
              .map((f) => `  ${f.name}: ${JSON.stringify(f.type)}`)
              .join("\n")
          : "  (not found — has the migration run?)"
      );
    }
    return;
  }

  const existing = await gql(
    `{ ${page.plural}(first: 2, stage: DRAFT) { id } }`
  );
  if (existing[page.plural].length > 0) {
    console.error(
      `A ${page.model} entry already exists (${existing[page.plural].length} found).\n` +
        "Refusing to create a second — the app queries first: 1 and takes [0],\n" +
        "so a duplicate would be silently ignored. Delete the existing entry in\n" +
        "Studio first if you want to reseed."
    );
    process.exit(1);
  }

  // Plain component fields take the bare object; union-wrapped ones nest under
  // the component apiId. Detect which by introspecting the list input once.
  const listInput = await introspectInput("IconCardCreateManyInlineInput");
  const isUnionWrapped =
    listInput?.inputFields?.some((f) => f.name === "IconCard") ?? false;
  const wrap = isUnionWrapped
    ? (card) => ({ IconCard: cardInput(card) })
    : cardInput;

  const mod = await page.load();
  const defaults = mod[page.key];
  const data = page.build(defaults, wrap);

  if (dryRun) {
    console.log("Dry run — nothing sent. Mutation data:");
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  const created = await gql(
    `mutation Seed($data: ${page.model}CreateInput!) {
       create${page.model}(data: $data) { id }
     }`,
    { data }
  );

  const { id } = created[`create${page.model}`];
  console.log(`Created ${page.model} ${id}`);

  await gql(
    `mutation Publish($id: ID!) {
       publish${page.model}(where: { id: $id }, to: PUBLISHED) { id }
     }`,
    { id }
  );

  console.log("Published.");
  console.log(
    `\nNext: grant Read on the Published stage for ${page.model} under\n` +
      "Project Settings > API Access > Public Content API, then verify with\n" +
      "the curl gate in the Phase 1 plan (Task 4, Step 7)."
  );
};

run().catch((error) => {
  console.error("Seed failed:", error.message ?? error);
  console.error(
    "\nIf this is an input-shape error, run with --introspect to print the\n" +
      "generated input types and compare against the page's build()."
  );
  process.exit(1);
});
