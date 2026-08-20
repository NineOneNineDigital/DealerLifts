#!/usr/bin/env node
/**
 * Seeds the Hygraph ServicesPage entry from the code defaults, then publishes it.
 *
 * The copy comes from app/(site)/services/defaults.ts — the same object the
 * page falls back to — so the CMS starts byte-identical to the rendered site
 * and there is one source of truth rather than two hand-synced ones.
 *
 * Run scripts/hygraph-migrate.mjs first; this needs the schema to exist.
 *
 * Usage:
 *   node scripts/hygraph-seed.mjs --introspect  # print the generated input shape
 *   node scripts/hygraph-seed.mjs --dry-run     # print the mutation, send nothing
 *   node scripts/hygraph-seed.mjs               # create and publish
 *
 * Requires a token with content mutation + publish permissions on the
 * Published stage. HYGRAPH_MUTATION_TOKEN if set, otherwise
 * HYGRAPH_MANAGEMENT_TOKEN. Read from the environment, never logged.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SERVICES_DEFAULTS } from "../app/(site)/services/defaults.ts";

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

function buildData(cardsWrapper) {
  const d = SERVICES_DEFAULTS;
  return {
    seoTitle: d.seoTitle,
    seoDescription: d.seoDescription,
    hero: { create: { ...d.hero } },
    services: { create: d.services.map(cardsWrapper) },
    processEyebrow: d.processEyebrow,
    processHeading: d.processHeading,
    processCtaLabel: d.processCtaLabel,
    processCtaHref: d.processCtaHref,
    processSteps: { create: d.processSteps.map(cardsWrapper) },
  };
}

const run = async () => {
  if (!token) {
    console.error(
      "No token. Set HYGRAPH_MUTATION_TOKEN (or HYGRAPH_MANAGEMENT_TOKEN) in\n" +
        ".env.local, with content mutation + publish permissions."
    );
    process.exit(1);
  }

  if (introspectOnly) {
    for (const name of [
      "ServicesPageCreateInput",
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
    "{ servicesPages(first: 2, stage: DRAFT) { id } }"
  );
  if (existing.servicesPages.length > 0) {
    console.error(
      `A ServicesPage entry already exists (${existing.servicesPages.length} found).\n` +
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

  const data = buildData(wrap);

  if (dryRun) {
    console.log("Dry run — nothing sent. Mutation data:");
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  const created = await gql(
    `mutation Seed($data: ServicesPageCreateInput!) {
       createServicesPage(data: $data) { id }
     }`,
    { data }
  );

  const { id } = created.createServicesPage;
  console.log(`Created ServicesPage ${id}`);

  await gql(
    `mutation Publish($id: ID!) {
       publishServicesPage(where: { id: $id }, to: PUBLISHED) { id }
     }`,
    { id }
  );

  console.log("Published.");
  console.log(
    "\nNext: grant Read on the Published stage for ServicesPage under\n" +
      "Project Settings > API Access > Public Content API, then verify with\n" +
      "the curl gate in the Phase 1 plan (Task 4, Step 7)."
  );
};

run().catch((error) => {
  console.error("Seed failed:", error.message ?? error);
  console.error(
    "\nIf this is an input-shape error, run with --introspect to print the\n" +
      "generated input types and compare against buildData()."
  );
  process.exit(1);
});
