// Precompute the catalog's distinct YMM fitment combos into a static JSON so the
// vehicle filter never runs the ~13s live catalog crawl at request time.
//
// Runs automatically before `next build` (package.json `prebuild`) and can be
// run by hand with `npm run build:ymm`. Consumer: lib/store/fitments-shopify.ts
// (getYmmTree), which reads lib/store/ymm-data.json and falls back to the live
// crawl only when the file is empty.
//
// This script NEVER fails the build: if credentials are missing or the crawl
// errors, it leaves the existing ymm-data.json in place and exits 0.

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "lib", "store", "ymm-data.json");

// Load .env.local for local runs; on Vercel the vars are already in process.env.
try {
  process.loadEnvFile(join(ROOT, ".env.local"));
} catch {
  // no .env.local — rely on process.env (CI/Vercel)
}

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.SHOPIFY_STOREFRONT_API_TOKEN;
const VERSION = process.env.SHOPIFY_STOREFRONT_API_VERSION ?? "2025-01";

// --- Fitment tag parser -----------------------------------------------------
// MUST stay in sync with parseFitmentTag() in lib/store/fitments.ts.
// Format: `YEAR-MAKE-MODEL-SUBMODEL-esi{ID}` (model may contain hyphens).
const FITMENT_TAG_RE = /^(\d{4})-([a-z0-9-]+)-(esi\d+)$/i;

function parseFitmentTag(tag) {
  const match = FITMENT_TAG_RE.exec(tag);
  if (!match) {
    return null;
  }
  const [, yearStr, body] = match;
  const year = Number.parseInt(yearStr, 10);
  if (!Number.isFinite(year)) {
    return null;
  }
  const segments = body.split("-");
  if (segments.length < 3) {
    return null;
  }
  const submodel = segments.at(-1);
  const make = segments[0];
  const model = segments.slice(1, -1).join("-");
  return { make, model, submodel, year };
}

const TAGS_QUERY =
  "query($first:Int!,$after:String){products(first:$first,after:$after){nodes{tags} pageInfo{hasNextPage endCursor}}}";

// Build a nested tree: { [year]: { [makeSlug]: { [modelSlug]: submodelSlug[] } } }.
// Far smaller than a flat combo list (keys aren't repeated) and maps 1:1 to the
// year -> make -> model -> submodel cascade the selector needs.
async function crawl() {
  const url = `https://${DOMAIN}/api/${VERSION}/graphql.json`;
  const tree = {};
  let combos = 0;
  let after = null;
  let pages = 0;
  let products = 0;
  const started = Date.now();

  for (;;) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": TOKEN,
      },
      body: JSON.stringify({
        query: TAGS_QUERY,
        variables: { first: 250, after },
      }),
    });
    if (!res.ok) {
      throw new Error(`Shopify responded ${res.status} ${res.statusText}`);
    }
    const json = await res.json();
    if (json.errors) {
      throw new Error(`Shopify GraphQL error: ${JSON.stringify(json.errors)}`);
    }
    const conn = json.data.products;
    pages++;
    products += conn.nodes.length;
    for (const node of conn.nodes) {
      for (const tag of node.tags) {
        const parsed = parseFitmentTag(tag);
        if (!parsed) {
          continue;
        }
        const y = String(parsed.year);
        tree[y] ??= {};
        const byMake = tree[y];
        byMake[parsed.make] ??= {};
        const byModel = byMake[parsed.make];
        byModel[parsed.model] ??= [];
        const submodels = byModel[parsed.model];
        if (!submodels.includes(parsed.submodel)) {
          submodels.push(parsed.submodel);
          combos++;
        }
      }
    }
    if (!conn.pageInfo.hasNextPage) {
      break;
    }
    after = conn.pageInfo.endCursor;
  }

  return {
    tree,
    combos,
    pages,
    products,
    seconds: ((Date.now() - started) / 1000).toFixed(1),
  };
}

async function main() {
  if (!(DOMAIN && TOKEN)) {
    console.warn(
      "[build-ymm-tree] SHOPIFY_STORE_DOMAIN / SHOPIFY_STOREFRONT_API_TOKEN not set — skipping precompute; runtime will fall back to the live crawl."
    );
    return;
  }
  const { tree, combos, pages, products, seconds } = await crawl();
  writeFileSync(OUT, JSON.stringify(tree));
  console.log(
    `[build-ymm-tree] ${combos} distinct YMM combos from ${products} products (${pages} pages) in ${seconds}s → ${OUT}`
  );
}

main().catch((err) => {
  console.warn(
    `[build-ymm-tree] failed (${err.message}) — leaving existing ymm-data.json; runtime falls back to the live crawl.`
  );
  // Never break the build — the runtime fallback covers this.
});
