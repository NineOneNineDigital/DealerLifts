# Shopify + Turn14 Cutover — Design

**Branch:** `shopify-turn14`
**Date:** 2026-05-28
**Status:** Approved, ready for implementation planning

## Goal

Make Shopify the source of truth for the DealerLifts storefront. Turn14's official Shopify app feeds catalog, inventory, and fitment data into Shopify; the Next.js site reads everything from Shopify's Storefront API and hands checkout off to Shopify-hosted checkout. After this branch lands, `convex/`, `app/admin/`, Clerk, and Authorize.net are gone from the codebase.

## Non-goals

- No SEO redirect map. Existing slugs may diverge from Shopify handles; that is accepted (per scoping decision).
- No automated test suite added. The codebase has none today and this branch is too large to bundle that work.
- No migration of historical Convex `orders` into Shopify. Pre-cutover orders are exported to CSV for archival and not visible on the new site.
- No multi-store / multi-region. One Shopify store, one Next.js site.

## Architecture (end state)

```
Turn14 (catalog, inventory, fitments, fulfillment)
   │ Turn14 Shopify App (managed integration)
   ▼
Shopify (catalog, inventory, customers, cart, checkout, orders,
         payments via Shopify Payments, fulfillment via Turn14 App)
   │ Storefront API (read) + Customer Account API (auth)
   ▼
Next.js site (dealerlifts.com)
   - Renders catalog / brand / category / product / search / vehicle
   - Holds cart as a Shopify Cart ID in a cookie
   - Redirects to Shopify-hosted checkout for purchase
   - Customer accounts via Shopify Customer Account API (OAuth)

Unchanged: Hygraph (gallery / about / careers), Tawk chat widget,
           contact form (`app/api/contact/route.ts` — logs only).
```

The Next.js site never calls Turn14 directly after this branch. All Turn14 data flows through Shopify.

## Phasing

A runtime flag `STOREFRONT_SOURCE` (values: `convex` | `shopify`, default `convex`) gates each phase so the branch is always deployable mid-flight. The flag and the Convex fallback code are deleted in Phase 5.

### Phase 0 — Branch + Shopify foundation
*(no UI changes, deployable)*

- Cut `shopify-turn14` from `main`.
- Add `lib/shopify/` with a typed Storefront API client (fetch-based, GraphQL, env-driven).
- Add env vars: `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_API_TOKEN`, `SHOPIFY_STOREFRONT_API_VERSION`, `STOREFRONT_SOURCE`.
- Add GraphQL fragments + TS types for `Product`, `Collection`, `ProductVariant`, `Cart`, `Customer`.
- Smoke-test: a server-side script `scripts/shopify-smoke.ts` that lists 3 products from the store and prints them.
- Out-of-band (operator, not code): install Turn14's Shopify app in the existing store, enable target brands, run the initial sync, configure Shopify Payments + shipping zones, set the store's customer-accounts mode to "new customer accounts" in Shopify Admin.

**Checkpoint after Phase 0 — Metafield assumption gate.** Inspect a synced product. Confirm Turn14's Shopify app populates fitment data into product metafields with a discoverable namespace/key/shape. If it does not, pause the branch and revisit the fitment strategy before continuing (options below in Risks).

### Phase 1 — Read-side cutover
*(flag-gated, both paths work)*

- Add `lib/store/source.ts` adapter. Each store component imports `getProductByHandle`, `listProducts`, `getCollectionByHandle`, `search`, `getFitments`, `getMakes`, `getModels`, `getYears`, etc. The adapter dispatches to Convex or Shopify based on `STOREFRONT_SOURCE`.
- Convert these to the adapter:
  - `app/(site)/store/page.tsx` (featured, new, categories)
  - `app/(site)/store/products/[slug]/page.tsx`
  - `app/(site)/store/brands/[slug]/page.tsx`
  - `app/(site)/store/categories/[slug]/page.tsx`
  - `app/(site)/store/search/page.tsx`
  - `app/(site)/store/vehicle/page.tsx`
  - `components/store/VehicleSelector.tsx`
  - `components/store/BrandGrid.tsx`
  - `components/store/FilterSidebar.tsx`
  - `components/store/FitmentPanel.tsx`
  - `components/store/ProductCard.tsx`
  - `components/store/ProductInfo.tsx`
  - `components/store/StockBadge.tsx`
  - `components/store/PriceDisplay.tsx`
  - `components/store/ProductImages.tsx`
- Flip `STOREFRONT_SOURCE=shopify` in Vercel preview deployments. Smoke-test all read pages manually.

### Phase 2 — Cart on Shopify

- Replace Convex cart with Shopify Cart API.
- Store the Shopify cart ID in a `cart_id` cookie (httpOnly, sameSite=Lax, 30-day TTL). Read/write via `lib/store/cart-cookie.ts`.
- Update `CartDrawer.tsx`, `CartItem.tsx`, `CartSummary.tsx`, and "Add to cart" actions on `ProductCard` + product detail.
- Cart line items reference Shopify `variantId` (not Convex product Id).
- Server actions: `cartCreate`, `cartLinesAdd`, `cartLinesUpdate`, `cartLinesRemove`, `cartBuyerIdentityUpdate`.

### Phase 3 — Checkout redirect

- Replace the custom checkout page with a "Proceed to checkout" button that redirects to `cart.checkoutUrl` from the Shopify Cart.
- Delete `app/api/checkout/route.ts`, `components/store/CheckoutForm.tsx`, `lib/authorize-net.ts`, `lib/store/validators.ts`.
- Remove the order-confirmation page (Shopify owns confirmation now), or replace it with a thank-you redirect target from Shopify (post-checkout return URL).

### Phase 4 — Customer accounts on Shopify

- Replace Clerk with Shopify Customer Account API (OAuth 2.0 PKCE).
- New `lib/shopify/customer-account.ts` handling the OAuth dance + token storage in cookies.
- New OAuth routes under `app/api/auth/shopify/`.
- Convert these to use Shopify customer endpoints (order history, addresses, profile):
  - `app/(auth)/sign-in/*`
  - `app/(auth)/sign-up/*`
  - `app/(site)/account/*`
  - `app/(site)/orders/*`
- Delete `app/(auth)/` Clerk pages and any Clerk wiring in `proxy.ts`.

### Phase 5 — Demolition

- Delete `convex/` (entire directory + `_generated`).
- Delete `app/admin/` (Shopify Admin replaces it).
- Delete `app/ConvexClientProvider.tsx`. Remove Convex provider from `app/layout.tsx`.
- Remove `convex`, `@clerk/nextjs` from `package.json`. Remove their env vars and Convex deployment.
- Remove `STOREFRONT_SOURCE` flag + `lib/store/source.ts` adapter. Inline Shopify calls directly in components.
- Update `proxy.ts` if it has Clerk auth middleware.
- Final smoke test on a preview deployment.
- Merge to `main`.

## Data flow & API mapping

| Page / Component | Current Convex query | Shopify Storefront GraphQL |
|---|---|---|
| `store/page.tsx` featured | `api.products.listFeatured` | `products(query: "tag:featured", first: 8)` |
| `store/page.tsx` new arrivals | `api.products.listAll` | `products(sortKey: CREATED_AT, reverse: true, first: 4)` |
| `store/page.tsx` categories | `api.categories.listTopLevel` | `collections(query: "collection_type:category", first: N)` |
| `products/[slug]/page.tsx` | `api.products.getBySlug` | `productByHandle(handle)` |
| product brand | `api.brands.getById` | `product.vendor` or metafield `custom.brand` |
| product inventory | `api.inventory.getByProductId` | `product.variants[0].availableForSale` + `quantityAvailable` |
| product fitments | `api.fitments.getForProduct` | `product.metafield(namespace, key)` — **shape locked in Phase 0** |
| `brands/[slug]/page.tsx` | `api.brands.getBySlug` + `listByBrand` | `collectionByHandle(handle)` w/ products connection |
| `categories/[slug]/page.tsx` | `api.categories.getBySlug` + `listByCategory` | `collectionByHandle(handle)` w/ products connection |
| `search/page.tsx` | `api.products.search` | `products(query: $q, first: 24)` |
| `vehicle/page.tsx` | `api.products.listByFitment` | `products(query: "<metafield filter>", first: 24)` |
| `VehicleSelector` makes/models/years | `api.fitments.getMakes/...` | derived from metafield aggregation; cached |
| `CartDrawer` + items | `api.cart.getItems` | `cart(id)` (Phase 2) |
| Add to cart | `api.cart.addItem` | `cartLinesAdd` (Phase 2) |
| Checkout | `POST /api/checkout` | redirect to `cart.checkoutUrl` (Phase 3) |
| Order confirmation | `api.orders.getByNumber` | Shopify post-checkout return URL (Phase 3) |
| Account / order history | Convex `users` + Clerk | Customer Account API `customer.orders` (Phase 4) |

**Taxonomy assumptions (locked unless Phase 0 reveals otherwise):**
- "Brand" = Shopify `vendor` field, with a `Collection` per brand auto-created by Turn14's app. Brand pages render via collection by handle.
- "Category" = Shopify `Collection`. Top-level categories are identified by a tag or a hardcoded handle list.
- "Featured" = products with the `featured` tag, curated manually in Shopify Admin (Turn14's app does not set this).

## Code organization

```
lib/shopify/
  client.ts                # Storefront GraphQL fetcher (env-driven, typed)
  customer-account.ts      # Customer Account API OAuth (Phase 4)
  fragments.ts             # Shared GraphQL fragments
  queries/
    products.ts            # productByHandle, listProducts, search, byFitment
    collections.ts         # collectionByHandle, listCollections
    cart.ts                # cartCreate, cartGet, cartLines*
    customer.ts            # me, orders, addresses
  metafields.ts            # Fitment metafield parser (shape locked in Phase 0)
  types.ts                 # TS types derived from GraphQL

lib/store/
  source.ts                # Adapter: dispatches Convex vs Shopify by flag (deleted Phase 5)
  cart-cookie.ts           # Read/write cart_id cookie (Phase 2)

app/api/
  auth/shopify/[...slug]/  # Customer Account API OAuth routes (Phase 4)
  checkout/                # DELETED in Phase 3
  contact/                 # Unchanged
```

Pages and components import only from `lib/store/source.ts`, never from `convex/react` or `lib/shopify/queries/*` directly, until Phase 5 deletes the adapter and inlines Shopify calls.

## Vehicle filtering performance

Storefront API's `products(query: ...)` filtering on metafields is finicky and can be slow at scale. Decision deferred to Phase 1 after Phase 0 reveals the actual fitment metafield shape and product volume. If naive querying is too slow, build a `{year, make, model} → [variantHandle]` aggregation cache server-side using Next.js `unstable_cache` with a daily revalidate.

## Risks

1. **Metafield assumption (highest risk).** Turn14's Shopify app's fitment data shape is unverified at design time. Phase 0 checkpoint gates the rest of the work. If the app does not expose fitments in a usable form, options are: (a) build a small side-store synced from Turn14 directly (Vercel KV or similar), (b) drop fitments from the storefront, (c) wait for Turn14 to add the feature. Choose at the checkpoint.
2. **Vehicle search performance.** Metafield filtering may not scale. Mitigation: server-side cache (see above).
3. **Customer Accounts OAuth complexity.** Phase 4 is the most novel surface. Mitigation: Clerk stays wired through Phases 1–3 so each earlier phase is independently deployable. Phase 4 is required for this branch to land (the goal explicitly removes Clerk). If Phase 4 hits a hard blocker mid-implementation, the contingency is to descope it from this branch — Phases 1–3 ship as their own branch and Phase 4 plus the Clerk/`app/admin`/`convex/` removal become a follow-up branch. That contingency is a scope change requiring explicit approval, not a default.
4. **Initial Turn14 → Shopify sync time.** First sync can take hours or days depending on brand count. Operator starts it during Phase 0; later phases proceed in parallel while it completes.
5. **Storefront API rate limits.** Storefront API uses a cost-based quota. `lib/shopify/client.ts` retries with exponential backoff on `THROTTLED`. Aggressive listing pages paginate and cache.
6. **Lost order history.** Existing Convex `orders` are not migrated. Customers who placed orders pre-cutover lose their order history on the site. Mitigation: export Convex `orders` table to CSV before Phase 5 deletion and archive externally. Document the cutover date in `proxy.ts` or `app/(site)/orders/page.tsx`'s empty state if useful.
7. **Slug divergence.** Existing indexed URLs (`/store/products/<slug>`) may not match Shopify handles after Turn14's app generates them. Accepted (per scoping decision). Some SEO regression is expected; revisit only if traffic drops materially.

## Testing strategy

- **Phase 0 smoke script:** `scripts/shopify-smoke.ts` — standalone Node script that lists products and prints fitment metafield shape. Manual run before continuing.
- **Per-phase preview deploy:** flip `STOREFRONT_SOURCE=shopify` in a Vercel preview, manually click through every store page, cart flow, and checkout flow (using Shopify test mode / Bogus Gateway).
- **No new automated test suite.** None exist today; not adding one in this branch.
- **Pre-completion gate per phase:** `npm run dev` runs cleanly, `npm run build` passes, manual smoke covers the golden path and at least two edge cases.

## Out-of-code operator tasks

These happen in Shopify Admin or Turn14, not in this codebase:

1. Install Turn14's Shopify app in the existing store (Phase 0).
2. Enable brands to sync in Turn14's app config (Phase 0).
3. Configure Shopify Payments + shipping zones in Shopify Admin (Phase 0).
4. Switch the store's customer accounts mode to "new customer accounts" in Shopify Admin (Phase 0, required for Phase 4 OAuth).
5. Register a Customer Account API app in Shopify Admin to get OAuth client credentials (Phase 4).
6. Curate "Featured" products with the `featured` tag in Shopify Admin (Phase 1, before flipping the flag).
7. Identify top-level categories by tag or handle list (Phase 1).
8. Export `convex/orders` table to CSV before Phase 5 deletion.
