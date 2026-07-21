# Staging + Production Environments — Design

**Date:** 2026-07-12
**Status:** Approved (design), pending implementation plan
**Scope:** Stand up separate staging and production environments for the DealerLifts headless Shopify site, in preparation for go-live.

## Goal

Give the team a safe staging environment to QA the storefront before changes reach real customers, and a clean production environment for launch — without introducing recurring cost or exposing real inventory, customers, or Turn14 fulfillment to test activity.

## Context

- **App:** Next.js 16 (App Router, Turbopack), fully env-driven. Config is read from `process.env` in `lib/shopify/*` (`client.ts`, `customer-oauth.ts`, `customer-account-client.ts`, `market.ts`). No hardcoded store domains.
- **`NEXT_PUBLIC_SITE_URL`** drives the customer-account OAuth redirect origin (`lib/shopify/customer-oauth.ts:44`), so it must differ per environment and each environment's URL must be registered as an allowed callback/logout URI in that store's Customer Account API app.
- **Backend services:** Shopify Storefront API, Customer Account API (OAuth), Admin API, Hygraph CMS, Tawk live chat, and the Turn14 integration.
- **Turn14 integration is the "Turn 14 Distribution" Shopify app** published by the developer **Data Here-to-There**. It syncs products/inventory/fitments *into* Shopify; the frontend reads them out via the Storefront API and never calls Turn14 directly for reads. Apps are installed and billed **per store**.
- **Current git branches:** `main` (production), `dev` (active work).
- No hosting config committed yet (no `vercel.json`, no `.vercel`, no Dockerfile).

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Frontend host | **Vercel** | Native Next.js; branch-based deploys + per-environment env-var scoping out of the box. |
| Shopify backend split | **Separate free Shopify development store for staging**; live store for production | Isolates test orders/customers/checkout from real data and Turn14 fulfillment. |
| Branch → environment | `main` → Production, `dev` → Staging, other branches/PRs → ephemeral Preview | Matches existing branches; no restructuring. |
| Other services (Hygraph, Tawk) | **Shared** across environments (only Shopify differs) | Simplest; the dev store already isolates the risky flows. Revisit per-service later. |
| Turn14 (Data Here-to-There app) | Lives **entirely on the Shopify side** — the frontend reads no Turn14 credentials. Connected on production only. | Confirmed: no `TURN14_*` env vars are read anywhere in `lib`/`app`. Turn14 data reaches the frontend only as synced Shopify products. |
| Turn14 data on staging | **Seed a product subset into the dev store (Option A)** — no second Data Here-to-There/Turn14 connection | Avoids the universal cross-store data-sync pain point and a likely Turn14-side second-feed approval/cost. Staging inventory/pricing is a static snapshot, which is fine for frontend QA. |
| Staging URL | **`staging.dealerlifts.com`** custom subdomain, password-protected | Stable URL for OAuth callback registration; password protection keeps it out of indexes and public view. |
| Env validation | **Include** a fail-fast check for required `SHOPIFY_*` vars | A mis-scoped Vercel deploy errors loudly instead of silently serving broken pages. |

### On "does the headless dev store need its own Turn14 connection?"

No — under Option A. The Turn 14 Distribution app fills a Shopify store with data; the headless frontend reads that data via the Storefront API. Because we seed the dev store with a product subset instead of wiring a live feed, the Turn14 app stays installed only on production. A second connection would only be required if we chose live Turn14 sync on staging, which would add a second per-store app install and a probable Turn14 dealer-account approval/cost. Shopify provides no official built-in staging environment for headless stores; the endorsed pattern is exactly this (a separate development store with Bogus Gateway, env-var-scoped credentials, and manual/seeded data parity).

## Environment Topology

| | Local dev | Staging | Production |
|---|---|---|---|
| Host | localhost + ngrok | Vercel (Preview) | Vercel (Production) |
| Git branch | any | `dev` | `main` |
| Shopify store | dev store | **free dev store** (seeded subset) | **live store** |
| `NEXT_PUBLIC_SITE_URL` | ngrok URL | `https://staging.dealerlifts.com` | `https://dealerlifts.com` |
| Payments | Bogus Gateway | Bogus Gateway | Real gateway |
| Turn14 app | not connected | not connected (seeded data) | connected (live) |
| Hygraph / Tawk | shared | shared | shared |
| Indexing / robots | n/a | disabled (password-protected) | enabled |

The entire split reduces to: a different set of `SHOPIFY_*` + `NEXT_PUBLIC_SITE_URL` values per Vercel environment. No change to *how* config is read.

## Components / Work Breakdown

### A. Vercel project
- Import repo; set **Production Branch = `main`**.
- Confirm `dev` deploys as Preview; bind it to the `staging.dealerlifts.com` domain so the URL is stable per commit.
- Scope env vars:
  - **Production** scope → live-store `SHOPIFY_*`, `NEXT_PUBLIC_SITE_URL=https://dealerlifts.com`.
  - **Preview** scope → dev-store `SHOPIFY_*`, `NEXT_PUBLIC_SITE_URL=https://staging.dealerlifts.com`.
  - **All scopes** → Hygraph, Tawk, `SHOPIFY_STOREFRONT_API_VERSION`. (No Turn14 env vars exist in the frontend — nothing to scope there.)

### B. Shopify development store (staging backend)
- Create a free development store.
- Seed a representative product subset from the live store (Shopify export/import, Matrixify, or a hand-picked set) — including fitment data so YMM/fitment display can be QA'd.
- Generate its Storefront API token → staging `SHOPIFY_STOREFRONT_API_TOKEN` + `SHOPIFY_STORE_DOMAIN`.
- Configure a Customer Account API app on the dev store; register `https://staging.dealerlifts.com/...` callback + logout URIs (mirroring what `customer-oauth.ts` builds from `NEXT_PUBLIC_SITE_URL`).
- Enable Bogus Gateway.

### C. Domains
- `dealerlifts.com` (+ `www`) → Vercel Production.
- `staging.dealerlifts.com` → `dev`-branch deployment.
- Enable Vercel password protection (or Basic Auth) on staging.

### D. Env hygiene (small code/doc touch-ups)
- Update `.env.example` to document that `SHOPIFY_*` + `NEXT_PUBLIC_SITE_URL` are per-environment.
- Add a fail-fast env-validation check for required `SHOPIFY_*` vars at app startup / first use.

### E. Go-live checklist (production cutover)
- Real payment gateway enabled on the live store; Bogus Gateway disabled.
- Turn 14 Distribution app connected and syncing on production.
- Order flow verified end-to-end with one controlled real order (validates the live Turn14 order-submission path that staging intentionally cannot exercise).
- Production DNS pointed at Vercel; SSL verified.
- `robots.txt`/indexing enabled on production only; staging remains password-protected.
- Customer Account API production callback/logout URIs registered for `dealerlifts.com`.

## Error Handling

- Missing/blank required `SHOPIFY_*` env var → env-validation throws a clear, named error at startup rather than a downstream Storefront API failure.
- OAuth callback mismatch → covered by registering each environment's exact `NEXT_PUBLIC_SITE_URL`-derived callback URI in the corresponding store's Customer Account API app.
- Staging accidentally hitting production data → structurally prevented: staging credentials only reference the dev store.

## Testing / Verification

- **Staging smoke test:** browse products, add to cart, complete a Bogus Gateway checkout, sign in via Customer Account OAuth on `staging.dealerlifts.com`, confirm fitment display — all against the dev store.
- **Isolation check:** confirm a staging test order does not appear in the live store and does not trigger Turn14 fulfillment.
- **Production readiness:** run the §E go-live checklist; single controlled real order to validate live Turn14 submission.

## Out of Scope (YAGNI for now)

- Live Turn14 sync on staging (Option B).
- Separate Hygraph environment, separate Tawk widget, separate Turn14 feed for staging.
- Shopify Plus staging stores.
- Automated data-parity sync between stores (seed manually/periodically instead).
