// Audit product status and channel coverage.
//
// Answers: how many products are active/draft/archived, and are all ACTIVE
// products actually published to the headless (Storefront) channel the site
// reads? Any active product missing from that channel won't appear on the site.
//
// Run:  npm run audit:channels        (loads .env.local automatically)
//   or: node --env-file=.env.local scripts/audit-product-channels.mjs
//
// Auth: mints a short-lived Admin API token from the Dev Dashboard app via the
// client_credentials grant (SHOPIFY_ADMIN_CLIENT_ID/SECRET). The app must have
// read_products (or write_products) scope, and app + store must be in the same
// Shopify organization. The Storefront side uses SHOPIFY_STOREFRONT_API_TOKEN.

import { join } from "node:path";

try {
  process.loadEnvFile(join(process.cwd(), ".env.local"));
} catch {
  // rely on process.env (e.g. --env-file or CI)
}

const D = process.env.SHOPIFY_STORE_DOMAIN;
const CID = process.env.SHOPIFY_ADMIN_CLIENT_ID;
const CS = process.env.SHOPIFY_ADMIN_CLIENT_SECRET;
const SFT = process.env.SHOPIFY_STOREFRONT_API_TOKEN;
const VERSION = process.env.SHOPIFY_STOREFRONT_API_VERSION ?? "2026-04";
const STORE = (D ?? "").replace(/\.myshopify\.com$/, "");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const THROTTLED_RE = /throttl/i;

function requireEnv() {
  const missing = [
    ["SHOPIFY_STORE_DOMAIN", D],
    ["SHOPIFY_ADMIN_CLIENT_ID", CID],
    ["SHOPIFY_ADMIN_CLIENT_SECRET", CS],
    ["SHOPIFY_STOREFRONT_API_TOKEN", SFT],
  ]
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length) {
    throw new Error(`Missing env: ${missing.join(", ")}`);
  }
}

async function mintAdminToken() {
  const res = await fetch(`https://${D}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CID,
      client_secret: CS,
    }),
  });
  const json = await res.json();
  if (!(res.ok && json.access_token)) {
    throw new Error(
      `client_credentials failed (${res.status}): ${JSON.stringify(json)}`
    );
  }
  return json.access_token;
}

async function adminCount(token, qs = "") {
  const res = await fetch(
    `https://${D}/admin/api/${VERSION}/products/count.json${qs}`,
    { headers: { "X-Shopify-Access-Token": token } }
  );
  if (!res.ok) {
    throw new Error(`count${qs}: ${res.status} ${await res.text()}`);
  }
  return (await res.json()).count;
}

async function adminGql(token, query, variables) {
  for (let attempt = 0; attempt < 10; attempt++) {
    const res = await fetch(`https://${D}/admin/api/${VERSION}/graphql.json`, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });
    const json = await res.json();
    if (json.errors) {
      if (THROTTLED_RE.test(JSON.stringify(json.errors))) {
        await sleep(2500);
        continue;
      }
      throw new Error(JSON.stringify(json.errors));
    }
    return json.data;
  }
  throw new Error("Admin GraphQL throttled out after 10 attempts");
}

const ACTIVE_QUERY = `query($cursor:String){products(first:250,query:"status:active",after:$cursor){nodes{id handle title} pageInfo{hasNextPage endCursor}}}`;

async function listActiveProducts(token) {
  const active = new Map();
  let cursor = null;
  for (;;) {
    const data = await adminGql(token, ACTIVE_QUERY, { cursor });
    for (const node of data.products.nodes) {
      active.set(node.handle, { title: node.title, id: node.id });
    }
    if (!data.products.pageInfo.hasNextPage) {
      break;
    }
    cursor = data.products.pageInfo.endCursor;
  }
  return active;
}

const STOREFRONT_QUERY =
  "query($first:Int!,$after:String){products(first:$first,after:$after){nodes{handle} pageInfo{hasNextPage endCursor}}}";

async function listStorefrontVisible() {
  const visible = new Set();
  let after = null;
  for (;;) {
    const res = await fetch(`https://${D}/api/${VERSION}/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SFT,
      },
      body: JSON.stringify({
        query: STOREFRONT_QUERY,
        variables: { first: 250, after },
      }),
    });
    const json = await res.json();
    if (json.errors) {
      throw new Error(`Storefront: ${JSON.stringify(json.errors)}`);
    }
    const conn = json.data.products;
    for (const node of conn.nodes) {
      visible.add(node.handle);
    }
    if (!conn.pageInfo.hasNextPage) {
      break;
    }
    after = conn.pageInfo.endCursor;
  }
  return visible;
}

async function main() {
  requireEnv();
  const token = await mintAdminToken();

  const [total, active, draft, archived, published, unpublished] =
    await Promise.all([
      adminCount(token),
      adminCount(token, "?status=active"),
      adminCount(token, "?status=draft"),
      adminCount(token, "?status=archived"),
      adminCount(token, "?published_status=published"),
      adminCount(token, "?published_status=unpublished"),
    ]);

  console.log("=== Product status (Admin API) ===");
  console.log("TOTAL          :", total);
  console.log("  active       :", active);
  console.log("  draft        :", draft);
  console.log("  archived     :", archived);
  console.log(
    "online-store published:",
    published,
    "| unpublished:",
    unpublished
  );

  const [activeProducts, visible] = await Promise.all([
    listActiveProducts(token),
    listStorefrontVisible(),
  ]);

  console.log("\n=== Headless channel coverage ===");
  console.log("active products (admin) :", activeProducts.size);
  console.log("storefront-visible      :", visible.size);

  const missing = [...activeProducts.entries()].filter(
    ([handle]) => !visible.has(handle)
  );
  console.log(`ACTIVE products NOT in the headless channel: ${missing.length}`);
  for (const [handle, info] of missing) {
    const numId = info.id.split("/").pop();
    console.log(
      `  • ${info.title}\n      handle: ${handle}\n      admin:  https://admin.shopify.com/store/${STORE}/products/${numId}`
    );
  }
  if (missing.length === 0) {
    console.log(
      "  ✅ every active product is published to the headless channel"
    );
  }
}

main().catch((err) => {
  console.error("audit failed:", err.message);
  process.exit(1);
});
