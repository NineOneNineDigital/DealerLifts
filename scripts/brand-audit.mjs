// One-off diagnostic: compare desired Turn14 brand list against what's actually
// synced into Shopify (both product vendors and brand collections).
// Run: node --env-file=.env.local scripts/brand-audit.mjs
const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.SHOPIFY_STOREFRONT_API_TOKEN;
const VERSION = process.env.SHOPIFY_STOREFRONT_API_VERSION ?? "2025-01";
const URL = `https://${DOMAIN}/api/${VERSION}/graphql.json`;

async function gql(query, variables) {
  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": TOKEN },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

const DESIRED = [
  "ADDICTIVE DESERT DESIGNS", "AIRLIFT", "AIRDOG", "AMP RESEARCH", "ARB",
  "ARTEC INDUSTRIES", "BACK RACK", "BAJA DESIGNS", "BAK INDUSTRIES", "BANKS POWER",
  "BELLTECH", "BILSTEIN", "BODY ARMOR 4X4", "BORLA", "CARLI", "COGNITO",
  "CORSA PERFORMANCE", "DV8 OFFROAD", "EATON", "EIBACH", "FABTECH",
  "FASS FUEL SYSTEMS", "FLEECE PERFORMANCE", "FOX", "GO RHINO", "HELLWIG",
  "HUSKY LINERS", "ICON", "JLT", "K&N", "KC HILITES", "KING SHOCKS",
  "KOOKS HEADERS", "MAGNAFLOW", "MBRP", "METHOD WHEELS", "MICKEY THOMPSON",
  "MISHIMOTO", "N-FAB", "NACHO OFFROAD", "OLD MAN EMU", "ORACLE", "POWERSTOP",
  "RETRAX", "RHINO-USA", "RHINO RACK", "RIGID INDUSTRIES", "ROAD ARMOR",
  "ROCK KRAWLER", "ROCKSLIDE ENGINEERING", "ROCK JOCK", "ROLL-N-LOCK",
  "RUGGED RIDGE", "SKYJACKER", "SPOD", "SUPER WINCH", "SUPERLIFT", "SYNERGY MFG",
  "TAZER", "TITAN FUEL TANKS", "TRUXEDO", "UNDERCOVER", "VOSSEN", "WEATHERTECH",
  "YUKON GEAR AND AXLE", "ZONE OFFROAD",
];

// Normalize for comparison: uppercase, strip everything non-alphanumeric.
const norm = (s) => s.toUpperCase().replace(/[^A-Z0-9]/g, "");

// 1. All product vendors (paginate).
const vendors = new Set();
const productCountByVendor = new Map();
let after = null;
let pages = 0;
const VQUERY = `query V($first:Int!,$after:String){products(first:$first,after:$after){nodes{vendor} pageInfo{hasNextPage endCursor}}}`;
while (true) {
  const d = await gql(VQUERY, { first: 250, after });
  pages++;
  for (const n of d.products.nodes) {
    if (n.vendor) {
      vendors.add(n.vendor);
      productCountByVendor.set(n.vendor, (productCountByVendor.get(n.vendor) ?? 0) + 1);
    }
  }
  if (!d.products.pageInfo.hasNextPage) break;
  after = d.products.pageInfo.endCursor;
}

// 2. All collections (potential brand collections).
const CQUERY = `query C($first:Int!){collections(first:$first){nodes{title handle products(first:1){nodes{id}}}}}`;
const cd = await gql(CQUERY, { first: 250 });
const collections = cd.collections.nodes.map((c) => ({
  title: c.title, handle: c.handle, hasProducts: c.products.nodes.length > 0,
}));

// Build normalized lookup of what exists (vendors + collections).
const existing = new Map(); // norm -> {labels:Set, vendor?, collection?}
function record(label, kind) {
  const k = norm(label);
  if (!existing.has(k)) existing.set(k, { labels: new Set(), kinds: new Set() });
  existing.get(k).labels.add(label);
  existing.get(k).kinds.add(kind);
}
for (const v of vendors) record(v, "vendor");
for (const c of collections) record(c.title, "collection");

// 3. Match desired against existing.
const matched = [];
const missing = [];
for (const want of DESIRED) {
  const k = norm(want);
  if (existing.has(k)) {
    const e = existing.get(k);
    matched.push({ want, found: [...e.labels].join(" | "), kinds: [...e.kinds].join("+") });
  } else {
    missing.push(want);
  }
}

// 4. Extra brands in store but not in desired list (vendors only, likely real brands).
const desiredNorm = new Set(DESIRED.map(norm));
const extraVendors = [...vendors]
  .filter((v) => !desiredNorm.has(norm(v)))
  .sort();

console.log(`Scanned ${pages} product pages, ${vendors.size} distinct vendors, ${collections.length} collections.\n`);

console.log(`=== MATCHED (${matched.length}/${DESIRED.length}) ===`);
for (const m of matched) {
  const exact = m.want === m.found ? "" : `  (store label: "${m.found}")`;
  console.log(`  ✓ ${m.want} [${m.kinds}]${exact}`);
}

console.log(`\n=== MISSING (${missing.length}) — not found as vendor or collection ===`);
for (const m of missing) console.log(`  ✗ ${m}`);

console.log(`\n=== EXTRA VENDORS in store, not in your list (${extraVendors.length}) ===`);
for (const v of extraVendors) console.log(`  • ${v} (${productCountByVendor.get(v)} products)`);
