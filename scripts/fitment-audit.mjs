// One-off diagnostic: audit EasySearch fitment tags against the app's parser.
// Run: node --env-file=.env.local scripts/fitment-audit.mjs
const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.SHOPIFY_STOREFRONT_API_TOKEN;
const VERSION = process.env.SHOPIFY_STOREFRONT_API_VERSION ?? "2025-01";
const URL = `https://${DOMAIN}/api/${VERSION}/graphql.json`;

const QUERY = `query ProductsTagsOnly($first: Int!, $after: String) {
  products(first: $first, after: $after) {
    nodes { tags }
    pageInfo { hasNextPage endCursor }
  }
}`;

// Mirror of lib/store/fitments.ts parseFitmentTag
const FITMENT_TAG_RE = /^(\d{4})-([a-z0-9-]+)-(esi\d+)$/i;
function parseFitmentTag(tag) {
  const match = FITMENT_TAG_RE.exec(tag);
  if (!match) return null;
  const [, yearStr, body] = match;
  const year = Number.parseInt(yearStr, 10);
  if (!Number.isFinite(year)) return null;
  const segments = body.split("-");
  if (segments.length < 3) return null;
  return { year, make: segments[0], model: segments.slice(1, -1).join("-"), submodel: segments[segments.length - 1] };
}

async function fetchPage(after) {
  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": TOKEN },
    body: JSON.stringify({ query: QUERY, variables: { first: 250, after } }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(JSON.stringify(json.errors));
  return json.data.products;
}

const stats = {
  pages: 0,
  products: 0,
  productsWithAnyEsiTag: 0,      // has a tag containing "esi" pattern
  productsWithParsedFitment: 0,  // at least one tag parsed OK
  productsUniversalOnly: 0,
  parsedTags: 0,
  // tags that look like fitments (contain -esi#) but FAIL the parse
  looksLikeFitmentButFails: 0,
};
const failedSamples = new Set();
const esiLikeRe = /-esi\d+$/i; // ends with -esi<digits>

let after = null;
const PAGE_LIMIT = 200;
let truncated = false;
while (true) {
  if (stats.pages >= PAGE_LIMIT) { truncated = true; break; }
  const page = await fetchPage(after);
  stats.pages++;
  for (const node of page.nodes) {
    stats.products++;
    const tags = node.tags ?? [];
    let parsedHere = 0;
    let esiLikeHere = 0;
    let universal = tags.includes("UniversalFitment:Y");
    for (const tag of tags) {
      const looksLike = esiLikeRe.test(tag);
      if (looksLike) esiLikeHere++;
      const parsed = parseFitmentTag(tag);
      if (parsed) { parsedHere++; stats.parsedTags++; }
      else if (looksLike) {
        stats.looksLikeFitmentButFails++;
        if (failedSamples.size < 40) failedSamples.add(tag);
      }
    }
    if (esiLikeHere > 0) stats.productsWithAnyEsiTag++;
    if (parsedHere > 0) stats.productsWithParsedFitment++;
    else if (universal) stats.productsUniversalOnly++;
  }
  if (!page.pageInfo.hasNextPage) break;
  after = page.pageInfo.endCursor;
}

console.log(JSON.stringify({ ...stats, truncated, hitPageLimit: truncated }, null, 2));
console.log("\nSample tags that look like fitments but FAIL the parser:");
console.log([...failedSamples].sort().join("\n") || "  (none)");
