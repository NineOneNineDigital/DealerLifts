# Shopify + Turn14 Cutover — Phase 0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the `shopify-turn14` branch with a typed Shopify Storefront API client and a smoke endpoint that validates the Turn14 Shopify app populates fitments into product metafields. This plan ends at the **metafield assumption gate** — Phase 1+ plans get written only after Phase 0 passes.

**Architecture:** Add `lib/shopify/` (typed fetch-based GraphQL client + queries + fragments + types) consumed by a dev-only API route at `/api/dev/shopify-smoke`. The smoke route prints product handles, vendor, and full metafields JSON for inspection. No existing code is changed in Phase 0 — the storefront still runs entirely on Convex.

**Tech Stack:** Next.js 16, TypeScript (strict), Biome, Shopify Storefront API (REST endpoint, GraphQL body), no new runtime dependencies.

**Source spec:** `docs/superpowers/specs/2026-05-28-shopify-turn14-cutover-design.md`

---

## File structure

**Created in this plan:**
```
lib/shopify/
  client.ts                # Typed Storefront API GraphQL fetcher
  fragments.ts             # Shared GraphQL fragments
  types.ts                 # TS types matching fragments
  queries/
    products.ts            # productByHandle, listProducts

app/api/dev/shopify-smoke/
  route.ts                 # Dev-only smoke endpoint

docs/superpowers/runbooks/
  2026-05-28-shopify-turn14-setup.md   # Operator runbook (Shopify Admin + Turn14 app)

.env.example               # New file documenting required env vars
```

**Not created in Phase 0 (deferred to Phase 1+):**
- `lib/shopify/queries/collections.ts`, `cart.ts`, `customer.ts`
- `lib/shopify/metafields.ts` (shape unknown until smoke runs)
- `lib/store/source.ts` adapter
- Customer Account API OAuth

---

## Task 1: Create branch and document env vars

**Files:**
- Create: `.env.example`

- [ ] **Step 1: Cut the branch from `main`**

```bash
git checkout main
git pull --ff-only
git checkout -b shopify-turn14
```

Expected: `Switched to a new branch 'shopify-turn14'`

- [ ] **Step 2: Create `.env.example` documenting all env vars (existing + new)**

There is no `.env.example` in the repo today. We add one so the new Shopify vars are discoverable and existing vars are documented. **Do not commit `.env.local` or any real secrets.**

Write to `.env.example`:

```bash
# Convex (will be removed in Phase 5)
NEXT_PUBLIC_CONVEX_URL=

# Clerk auth (will be removed in Phase 4)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Hygraph CMS (kept)
HYGRAPH_CONTENT_API_URL=
HYGRAPH_CONTENT_API_READ_TOKEN=

# Authorize.net (will be removed in Phase 3)
AUTHORIZENET_API_LOGIN_ID=
AUTHORIZENET_TRANSACTION_KEY=
AUTHORIZENET_ENVIRONMENT=sandbox

# Turn14 (will be removed once convex/turn14 is deleted in Phase 5)
TURN14_CLIENT_ID=
TURN14_CLIENT_SECRET=
TURN14_SANDBOX=true

# Internal checkout token (will be removed in Phase 3)
CHECKOUT_INTERNAL_TOKEN=

# Site URL (kept)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# --- NEW: Shopify Storefront API ---
# Your Shopify domain, e.g. dealerlifts.myshopify.com (NOT the custom domain)
SHOPIFY_STORE_DOMAIN=
# Public Storefront API access token from Shopify Admin > Apps > Headless / Storefront API
SHOPIFY_STOREFRONT_API_TOKEN=
# API version, e.g. 2025-01 (use the most recent stable)
SHOPIFY_STOREFRONT_API_VERSION=2025-01

# --- NEW: Cutover flag ---
# "convex" (default) or "shopify". Flipped per phase. Removed in Phase 5.
STOREFRONT_SOURCE=convex
```

- [ ] **Step 3: Add `.env.example` to git, leave `.env.local` ignored**

```bash
git status
# Verify .env.example is shown as untracked, .env.local is NOT shown
git add .env.example
```

- [ ] **Step 4: Commit**

```bash
git commit -m "Add .env.example documenting Shopify + existing env vars"
```

---

## Task 2: Storefront API client

**Files:**
- Create: `lib/shopify/client.ts`

The client is a typed GraphQL fetcher with retry-on-throttle. Hand-rolled (no SDK) to keep the dependency surface small and match the project's existing pattern (`lib/hygraph.ts` is the same shape).

- [ ] **Step 1: Read the existing Hygraph client to match style**

Read `lib/hygraph.ts` end-to-end to match the error-handling and fetch shape of the project.

- [ ] **Step 2: Create `lib/shopify/client.ts`**

```ts
const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.SHOPIFY_STOREFRONT_API_TOKEN;
const VERSION = process.env.SHOPIFY_STOREFRONT_API_VERSION ?? "2025-01";

type ShopifyError = { message: string; extensions?: { code?: string } };
type ShopifyResponse<T> = {
  data?: T;
  errors?: ShopifyError[];
};

type FetchOptions = {
  revalidate?: number;
  cache?: RequestCache;
};

const MAX_ATTEMPTS = 3;
const BASE_BACKOFF_MS = 500;

function endpoint(): string {
  if (!DOMAIN) {
    throw new Error("SHOPIFY_STORE_DOMAIN is not set. Add it to .env.local.");
  }
  if (!TOKEN) {
    throw new Error(
      "SHOPIFY_STOREFRONT_API_TOKEN is not set. Add it to .env.local."
    );
  }
  return `https://${DOMAIN}/api/${VERSION}/graphql.json`;
}

export async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  options?: FetchOptions
): Promise<T> {
  const url = endpoint();
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": TOKEN as string,
      },
      body: JSON.stringify({ query, variables }),
      next:
        options?.cache === undefined
          ? { revalidate: options?.revalidate ?? 60 }
          : undefined,
      cache: options?.cache,
    });

    if (res.status === 430 || res.status === 429) {
      // Shopify throttling: backoff and retry.
      lastError = new Error(`Shopify throttled (HTTP ${res.status})`);
      await sleep(BASE_BACKOFF_MS * 2 ** (attempt - 1));
      continue;
    }

    if (!res.ok) {
      throw new Error(
        `Shopify request failed: ${res.status} ${res.statusText}`
      );
    }

    const json = (await res.json()) as ShopifyResponse<T>;

    if (json.errors?.length) {
      const throttled = json.errors.some(
        (e) => e.extensions?.code === "THROTTLED"
      );
      if (throttled && attempt < MAX_ATTEMPTS) {
        lastError = new Error("Shopify GraphQL throttled");
        await sleep(BASE_BACKOFF_MS * 2 ** (attempt - 1));
        continue;
      }
      throw new Error(
        `Shopify GraphQL error: ${json.errors.map((e) => e.message).join("; ")}`
      );
    }

    if (!json.data) {
      throw new Error("Shopify response missing data field");
    }

    return json.data;
  }

  throw lastError ?? new Error("Shopify request failed after retries");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

- [ ] **Step 3: Run typecheck**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Run lint**

```bash
npm run lint
```

Expected: clean, or only pre-existing warnings unrelated to `lib/shopify/`.

- [ ] **Step 5: Commit**

```bash
git add lib/shopify/client.ts
git commit -m "Add Shopify Storefront API client with throttle retry"
```

---

## Task 3: GraphQL fragments and TS types

**Files:**
- Create: `lib/shopify/fragments.ts`
- Create: `lib/shopify/types.ts`

Fragments are deliberately minimal for Phase 0 — only the fields the smoke endpoint and Phase 1's product detail page will need. Cart, customer, and complex filter fragments are deferred.

- [ ] **Step 1: Create `lib/shopify/fragments.ts`**

```ts
export const PRODUCT_FRAGMENT = /* GraphQL */ `
  fragment ProductFields on Product {
    id
    handle
    title
    vendor
    description
    productType
    tags
    createdAt
    featuredImage {
      url
      altText
      width
      height
    }
    images(first: 10) {
      nodes {
        url
        altText
        width
        height
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    variants(first: 10) {
      nodes {
        id
        sku
        title
        availableForSale
        quantityAvailable
        price {
          amount
          currencyCode
        }
      }
    }
    metafields(
      identifiers: [
        { namespace: "custom", key: "fitments" }
        { namespace: "custom", key: "fitment" }
        { namespace: "turn14", key: "fitments" }
        { namespace: "turn14", key: "vehicles" }
        { namespace: "specifications", key: "fitments" }
      ]
    ) {
      namespace
      key
      type
      value
    }
  }
`;
```

> **Why the metafield identifiers list?** We don't yet know which namespace/key Turn14's app uses. The Storefront API requires explicit identifiers to fetch metafields, so we query several common guesses. The smoke endpoint reports which one(s) come back populated, and we narrow this list in Phase 1.

- [ ] **Step 2: Create `lib/shopify/types.ts`**

```ts
export type Money = {
  amount: string;
  currencyCode: string;
};

export type ShopifyImage = {
  url: string;
  altText: string | null;
  width: number;
  height: number;
};

export type ShopifyVariant = {
  id: string;
  sku: string | null;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  price: Money;
};

export type ShopifyMetafield = {
  namespace: string;
  key: string;
  type: string;
  value: string;
};

export type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  vendor: string;
  description: string;
  productType: string;
  tags: string[];
  createdAt: string;
  featuredImage: ShopifyImage | null;
  images: { nodes: ShopifyImage[] };
  priceRange: { minVariantPrice: Money };
  variants: { nodes: ShopifyVariant[] };
  // `metafields` returns null for identifiers that don't exist on the product,
  // so the array is sparse and entries can be null.
  metafields: (ShopifyMetafield | null)[];
};

export type ProductConnection = {
  nodes: ShopifyProduct[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
};
```

- [ ] **Step 3: Typecheck**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Lint**

```bash
npm run lint
```

Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add lib/shopify/fragments.ts lib/shopify/types.ts
git commit -m "Add Shopify GraphQL fragments and TS types"
```

---

## Task 4: Product queries

**Files:**
- Create: `lib/shopify/queries/products.ts`

Phase 0 needs exactly two product queries: `productByHandle` (to drill into one product's metafields) and `listProducts` (to enumerate the catalog).

- [ ] **Step 1: Create `lib/shopify/queries/products.ts`**

```ts
import { shopifyFetch } from "@/lib/shopify/client";
import { PRODUCT_FRAGMENT } from "@/lib/shopify/fragments";
import type { ProductConnection, ShopifyProduct } from "@/lib/shopify/types";

const LIST_PRODUCTS_QUERY = /* GraphQL */ `
  ${PRODUCT_FRAGMENT}
  query ListProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      nodes {
        ...ProductFields
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  ${PRODUCT_FRAGMENT}
  query ProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      ...ProductFields
    }
  }
`;

export async function listProducts(args: {
  first: number;
  after?: string;
}): Promise<ProductConnection> {
  const data = await shopifyFetch<{ products: ProductConnection }>(
    LIST_PRODUCTS_QUERY,
    { first: args.first, after: args.after ?? null }
  );
  return data.products;
}

export async function productByHandle(
  handle: string
): Promise<ShopifyProduct | null> {
  const data = await shopifyFetch<{ productByHandle: ShopifyProduct | null }>(
    PRODUCT_BY_HANDLE_QUERY,
    { handle }
  );
  return data.productByHandle;
}
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Lint**

```bash
npm run lint
```

Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add lib/shopify/queries/products.ts
git commit -m "Add Shopify product queries: listProducts, productByHandle"
```

---

## Task 5: Dev-only smoke endpoint

**Files:**
- Create: `app/api/dev/shopify-smoke/route.ts`

A Next.js API route is simpler than a standalone TS script: it reuses the dev server's TS compilation, doesn't add a `tsx` dev dependency, and can be hit from a browser. Gated by `NODE_ENV !== "production"` and refuses to respond otherwise — this is a dev tool, not a public endpoint.

- [ ] **Step 1: Create `app/api/dev/shopify-smoke/route.ts`**

```ts
import { NextResponse } from "next/server";
import { listProducts, productByHandle } from "@/lib/shopify/queries/products";

// Dev-only smoke endpoint. Refuses to respond in production.
export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = new URL(req.url);
  const handle = url.searchParams.get("handle");

  try {
    if (handle) {
      const product = await productByHandle(handle);
      return NextResponse.json({ product }, { status: 200 });
    }

    const page = await listProducts({ first: 3 });
    const summary = page.nodes.map((p) => ({
      handle: p.handle,
      title: p.title,
      vendor: p.vendor,
      productType: p.productType,
      tags: p.tags,
      variantCount: p.variants.nodes.length,
      firstVariantSku: p.variants.nodes[0]?.sku ?? null,
      // The interesting bit: which metafield identifiers came back populated.
      metafieldsFound: p.metafields
        .filter((m): m is NonNullable<typeof m> => m !== null)
        .map((m) => ({
          namespace: m.namespace,
          key: m.key,
          type: m.type,
          valuePreview:
            m.value.length > 200 ? `${m.value.slice(0, 200)}…` : m.value,
        })),
    }));

    return NextResponse.json(
      {
        productCount: page.nodes.length,
        hasMore: page.pageInfo.hasNextPage,
        summary,
        hint: "To inspect one product's full metafields, hit /api/dev/shopify-smoke?handle=<handle>",
      },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Lint**

```bash
npm run lint
```

Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add app/api/dev/shopify-smoke/route.ts
git commit -m "Add dev-only Shopify smoke endpoint"
```

---

## Task 6: Operator runbook

**Files:**
- Create: `docs/superpowers/runbooks/2026-05-28-shopify-turn14-setup.md`

Several Phase 0 steps happen in Shopify Admin and Turn14, not in this codebase. Document them so the operator (you or someone else) can execute them in parallel with steps that follow, and so the steps are reproducible on a future store.

- [ ] **Step 1: Create the runbook file**

```markdown
# Shopify + Turn14 Setup Runbook

Companion to `docs/superpowers/specs/2026-05-28-shopify-turn14-cutover-design.md` and `docs/superpowers/plans/2026-05-28-shopify-turn14-phase0.md`. These steps happen in Shopify Admin and Turn14, not in this codebase.

## Prerequisites

- Shopify store provisioned (Basic plan or above)
- Admin access to the Shopify store
- Turn14 dealer account with API/integration access

## 1. Install Turn14's Shopify app

1. In Shopify Admin → Apps → "Customize your store" → search for "Turn14 Distribution".
2. Install the app.
3. Authorize the connection with your Turn14 dealer credentials.
4. In the Turn14 app config, enable the brands you want to sync. Start small (1–2 brands) for the first sync — the initial sync can run for hours.
5. Trigger the initial sync.

## 2. Generate Storefront API token

1. Shopify Admin → Settings → Apps and sales channels → "Develop apps".
2. Enable custom app development if prompted.
3. Create a new app, e.g. "DealerLifts Storefront".
4. Configure Storefront API access scopes:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_product_inventory`
   - `unauthenticated_read_product_tags`
   - `unauthenticated_read_collection_listings`
   - `unauthenticated_read_metaobjects`
5. Install the app, then copy the Storefront API access token.
6. Save these in `.env.local`:

   ```bash
   SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
   SHOPIFY_STOREFRONT_API_TOKEN=<paste token here>
   SHOPIFY_STOREFRONT_API_VERSION=2025-01
   ```

## 3. Configure payments and shipping

1. Shopify Admin → Settings → Payments → activate Shopify Payments (or a fallback gateway).
2. Shopify Admin → Settings → Shipping and delivery → add shipping zones and rates covering your service area.
3. Shopify Admin → Settings → Taxes → confirm tax registrations.

## 4. Switch customer accounts to "new customer accounts"

Required for Phase 4 (Customer Account API OAuth).

1. Shopify Admin → Settings → Customer accounts.
2. Select "New customer accounts" (passwordless / email-OTP).
3. Save.

## 5. After the first Turn14 sync completes

1. Browse Shopify Admin → Products. Confirm products exist with vendor, images, and prices.
2. Open one product and scroll to "Metafields". Note any metafields Turn14's app has set — especially anything that looks like fitment data (YMM, vehicle, fitment, application, etc.).
3. Run the Phase 0 smoke check (see plan Task 7) against this product.

## 6. Curate "featured" products (deferred to Phase 1)

The Turn14 app does not set a "featured" flag. When ready for the read-side cutover, manually tag 8 products with the `featured` tag in Shopify Admin so the home page featured row populates.
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/runbooks/2026-05-28-shopify-turn14-setup.md
git commit -m "Add Shopify + Turn14 operator runbook"
```

---

## Task 7: Run the smoke check and validate the metafield assumption

**Files:**
- Modify: `docs/superpowers/runbooks/2026-05-28-shopify-turn14-setup.md` (append Phase 0 findings section)

This is the gate. Don't proceed to Phase 1 planning until this task completes successfully.

- [ ] **Step 1: Confirm runbook steps 1–5 are done**

Operator tasks from the runbook must be complete before this step. At minimum:
- Turn14 app installed
- At least one brand synced with products visible in Shopify Admin
- Storefront API token saved to `.env.local`

- [ ] **Step 2: Start the dev server**

```bash
npm run dev
```

Expected: server starts on `http://localhost:3000`.

- [ ] **Step 3: Hit the smoke endpoint to list 3 products**

In a browser or with curl:

```bash
curl 'http://localhost:3000/api/dev/shopify-smoke' | jq
```

Expected: JSON response with `productCount: 3`, `summary` array of 3 products with `handle`, `title`, `vendor`, `metafieldsFound`. The `metafieldsFound` arrays show which (if any) of the metafield identifier guesses returned data.

- [ ] **Step 4: Drill into one product's full metafields**

Pick a handle from the list, then:

```bash
curl 'http://localhost:3000/api/dev/shopify-smoke?handle=<the-handle>' | jq '.product.metafields'
```

Expected: array of metafield objects. Inspect `namespace`, `key`, `type`, `value`. Look for one whose `value` contains year/make/model data — that's the fitment metafield.

- [ ] **Step 5: If no fitment metafield is found, expand the search**

The fragment's metafield identifier list is a guess. If none populated, in Shopify Admin → Products → pick a product → Metafields tab, eyeball every metafield namespace/key. Update `lib/shopify/fragments.ts` to add the actual identifier(s), restart dev server, repeat Step 4.

If after that there is still no fitment data on products, **stop here**. Document the finding (Step 6) and bring it back to the design — this is the case where Turn14's Shopify app does not expose fitments and the spec's Risk #1 alternatives kick in.

- [ ] **Step 6: Document findings in the runbook**

Append a "Phase 0 findings" section to `docs/superpowers/runbooks/2026-05-28-shopify-turn14-setup.md`:

```markdown
## Phase 0 findings (filled in after smoke check)

- **Storefront API connectivity:** ✅/❌ (date)
- **Products synced:** N products across M brands
- **Fitment metafield location:**
  - Namespace: `<value>`
  - Key: `<value>`
  - Type: `<value>` (e.g. `json`, `list.single_line_text_field`, `metaobject_reference`)
  - Sample value: `<paste 1–2 line truncated example>`
- **Vendor field populated:** ✅/❌
- **Variants with SKU + price:** ✅/❌
- **Inventory `quantityAvailable` populated:** ✅/❌ (some Turn14 setups only sync availability, not quantity)
- **Notes / surprises:** <free text>
```

- [ ] **Step 7: Commit findings**

```bash
git add docs/superpowers/runbooks/2026-05-28-shopify-turn14-setup.md
git commit -m "Document Phase 0 smoke check findings"
```

- [ ] **Step 8: Push the branch**

```bash
git push -u origin shopify-turn14
```

Expected: branch pushed, no PR opened yet (we open it when more phases are merged in or at the end depending on review preference).

---

## Phase 0 exit criteria

All of the following must be true before writing the Phase 1 plan:

1. ✅ `shopify-turn14` branch exists locally and on the remote.
2. ✅ `lib/shopify/client.ts`, `fragments.ts`, `types.ts`, `queries/products.ts` exist and typecheck clean.
3. ✅ `app/api/dev/shopify-smoke/route.ts` returns a populated product list in dev.
4. ✅ The runbook's "Phase 0 findings" section is filled in.
5. ✅ Fitment metafield namespace/key/type is **known and documented**. If unknown, the cutover plan needs revision before Phase 1.

When all five are true, write the Phase 1 plan using the actual metafield shape discovered here — replacing the speculative identifier list in `fragments.ts` with the one true identifier.
