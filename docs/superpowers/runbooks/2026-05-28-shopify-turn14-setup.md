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

### Phase 0 findings update (2026-05-29, second pass)

Store has the **EasySearch by NexusMedia** Shopify app installed. EasySearch writes fitments as Shopify product tags using the format `YEAR-MAKE-MODEL-SUBMODEL-esi{ID}` (all lowercase, hyphen-separated). Examples:

```
1980-toyota-land-cruiser-base-esi8372037
1980-gmc-k2500-suburban-base-esi6152156
2002-cadillac-escalade-base-esi8988213
```

Universal/non-fitment parts use `UniversalFitment:Y` instead. Turn14 metadata also lives in tags (`TURN14_ID:181499`, `MPN:12955`, `Prop65:Y`, etc.) and Shopify product-category breadcrumbs appear as tags with `>` separators (`Suspension>Air Tanks`).

Tags are exposed via Storefront API by default — our existing `PRODUCT_FRAGMENT` already requests them. Coverage is uneven during EasySearch's initial sync (some brands fully tagged, others zero tags so far).

### Implications for Phase 1b

The 5 speculative metafield identifiers in `PRODUCT_FRAGMENT` can be removed (they will never be set).

Phase 1b strategy: **fitments come from tags.**
- Vehicle selector dropdowns: aggregate matching tag patterns (`YEAR-MAKE-MODEL-SUBMODEL-esi*`)
- Vehicle filter page: `products(query: "tag:1980-toyota-land-cruiser-base*", first: 24)`
- Per-product "Fits these vehicles": filter the product's `tags` array by the fitment-tag regex
- Universal parts: tagged `UniversalFitment:Y` — show "Fits all vehicles" instead of a YMM list
- Coverage gap mitigation (optional): fall back to descriptionHtml parsing when EasySearch hasn't tagged a product yet (the `<p>This Part Fits:</p>` HTML table is still there).

No need to embed EasySearch's widget — the existing VehicleSelector UI design can be powered directly from tag queries.
