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
