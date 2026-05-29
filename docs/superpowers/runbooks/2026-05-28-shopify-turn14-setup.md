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

> **Important:** The smoke endpoint at `/api/dev/shopify-smoke` is gated by `NODE_ENV !== "production"`. On Vercel preview deploys, `NODE_ENV` is `"production"`, so the route returns 404. Run the smoke check against a **local** `npm run dev` server with `.env.local` set up, not against a preview URL.

## 6. Curate "featured" products (deferred to Phase 1)

The Turn14 app does not set a "featured" flag. When ready for the read-side cutover, manually tag 8 products with the `featured` tag in Shopify Admin so the home page featured row populates.

---

## Phase 0 findings (2026-05-29)

- **Storefront API connectivity:** ✅
- **Required scope additions:** `unauthenticated_read_product_inventory` (initially missing — without it `quantityAvailable` returns a `THROTTLED`-style access-denied GraphQL error)
- **Products synced:** at least 3+ Air Lift products and 1+ Addictive Desert Designs product confirmed via Storefront API. Initial sync still in progress.
- **Vendor field populated:** ✅ (e.g. "Air Lift", "Addictive Desert Designs")
- **Variants with SKU + price:** ✅ (e.g. SKU `ALF11993`, price `$7.99 USD` on a sensor arm)
- **Inventory `quantityAvailable` populated:** ✅
- **Fitment metafield location:** ❌ Turn14's Shopify app does NOT populate product metafields with fitment data. All five guessed identifiers (`custom.fitments`, `custom.fitment`, `turn14.fitments`, `turn14.vehicles`, `specifications.fitments`) return `null`.
- **Fitment data location (actual):** Embedded in `descriptionHtml` as an HTML table. Marker phrase `<p>This Part Fits:</p>` precedes a `<table border="1">` whose header row is `Year | Make | Model | Submodel`. Body rows carry one fitment each. Year column may be a single year or a hyphen-separated range (`2024-2025`). Example confirmed on handle `addictive-desert-designs-2024-toyota-tacoma-stealth-rear-bumper`.
- **Universal/non-fitment parts:** Have a plain `description` without the fitment table (e.g. air tanks, sensor arms). Fitment parsing must gracefully no-op when the marker phrase is absent.

### Implications for Phase 1b

Original Phase 1a-foundation `PRODUCT_FRAGMENT` queries metafields that will never be set. The 5 speculative metafield identifiers can be removed once Phase 1b's fitment strategy is chosen.

Phase 1b options:
1. **Server-side description parsing.** Parse `descriptionHtml` at query time on the product detail page; cache aggregated `{year, make, model} → [productHandle]` maps for the vehicle selector / vehicle filter page. Heavy compute on first request after each cache window.
2. **Side-channel fitments via Shopify Admin API.** Run a periodic job that reads `descriptionHtml`, parses fitments, writes them back as a `custom.fitments` metafield via Admin API. Then the storefront queries metafields cleanly. Requires Admin API token + a sync job (Vercel Cron, etc.).
3. **Keep `convex/turn14/*` running as a fitment-only feed.** Pull fitments straight from Turn14's API into Convex, keep the existing vehicle selector backed by Convex even after the rest of the storefront flips to Shopify. Smallest UI risk, but contradicts the "Shopify as source of truth" goal.
