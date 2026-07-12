# Staging + Production Environments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up separate, isolated staging and production environments for the DealerLifts headless Shopify site so changes can be QA'd safely before reaching real customers.

**Architecture:** Vercel hosts the Next.js frontend — `main` branch → Production, `dev` branch → Staging, PRs → ephemeral Previews. Staging points at a free Shopify **development store** (seeded with a product subset, Bogus Gateway payments); production points at the live store. The split is purely per-environment env vars; the only code change is a fail-fast env-validation guard so a mis-scoped deploy errors loudly.

**Tech Stack:** Next.js 16 (App Router, Turbopack), TypeScript, Biome (lint/format), Vercel, Shopify (Storefront API + Customer Account API), Hygraph, Tawk.

## Global Constraints

- Next.js **16.1.6**, React **19.2.3** — do not change framework versions.
- Lint/format is **Biome** (`npm run lint` = `biome check .`). There is **no test framework** in this repo; do **not** add one — verify behavior by running the app.
- All backend config is **env-driven** via `process.env` in `lib/shopify/*`. Do not hardcode store domains, tokens, or URLs.
- `NEXT_PUBLIC_SITE_URL` is the OAuth redirect origin (`lib/shopify/customer-oauth.ts:44`); its value per environment MUST be registered as an allowed callback/logout URI in that store's Customer Account API app.
- Turn14 is the **"Turn 14 Distribution" app by Data Here-to-There**, living entirely on the Shopify side. The frontend reads **no** Turn14 env vars. Staging is seeded with products and has **no** Turn14 connection.
- Production domain: `dealerlifts.com` (+ `www`). Staging domain: `staging.dealerlifts.com` (password-protected).

---

## File Structure

- **Create** `lib/env.ts` — single-responsibility module: assert required server env vars are present, throw a clear aggregated error if not.
- **Create** `instrumentation.ts` (repo root) — Next.js startup hook that calls the validator once, in the Node runtime only.
- **Modify** `.env.example` — document the per-environment vars and the new required-at-startup set.
- **Create** `docs/deploy/environments.md` — the operational runbook (dev store, Vercel, domains, go-live) so the dashboard steps live in-repo for the team.

The Vercel/Shopify/DNS work happens in external dashboards; those tasks produce verifiable outcomes (a loading staging URL, an isolated test order) rather than committed files, and are captured in `docs/deploy/environments.md`.

---

## Task 1: Fail-fast env validation (code)

**Files:**
- Create: `lib/env.ts`
- Create: `instrumentation.ts`
- Modify: `.env.example`

**Interfaces:**
- Produces: `assertServerEnv(env?: NodeJS.ProcessEnv): void` — throws `Error` listing every missing/blank required key; returns `void` when all present.

- [ ] **Step 1: Create the validator module**

Create `lib/env.ts`:

```ts
/**
 * Fail-fast validation of required server environment variables.
 *
 * Called once at server startup (see instrumentation.ts) so a mis-scoped
 * deploy (e.g. Vercel Preview missing the staging Shopify token) errors
 * loudly at boot instead of silently serving broken pages.
 *
 * Keep this list to launch-critical vars only. SHOPIFY_STOREFRONT_API_VERSION
 * is intentionally omitted — it has a safe default in lib/shopify/client.ts.
 */
const REQUIRED_SERVER_ENV = [
  "NEXT_PUBLIC_SITE_URL",
  "SHOPIFY_STORE_DOMAIN",
  "SHOPIFY_STOREFRONT_API_TOKEN",
  "SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID",
  "SHOPIFY_CUSTOMER_ACCOUNT_API_URL",
  "SHOPIFY_CUSTOMER_ACCOUNT_AUTH_URL",
  "HYGRAPH_CONTENT_API_URL",
  "HYGRAPH_CONTENT_API_READ_TOKEN",
] as const;

export function assertServerEnv(
  env: NodeJS.ProcessEnv = process.env
): void {
  const missing = REQUIRED_SERVER_ENV.filter((key) => {
    const value = env[key];
    return value === undefined || value.trim() === "";
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(", ")}. ` +
        "Set them for this environment (Vercel Project Settings → Environment " +
        "Variables, or .env.local for local dev)."
    );
  }
}
```

- [ ] **Step 2: Wire it into Next.js startup**

Create `instrumentation.ts` at the repo root (Next.js calls `register()` once when the server boots):

```ts
export async function register() {
  // Only the Node.js runtime has the full server env; skip the Edge runtime pass.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { assertServerEnv } = await import("./lib/env");
    assertServerEnv();
  }
}
```

- [ ] **Step 3: Verify it fails loudly when a var is blank**

Temporarily blank one required var and start the server:

Run:
```bash
SHOPIFY_STORE_DOMAIN= npm run dev
```
Expected: the server logs an error containing `Missing required environment variable(s): SHOPIFY_STORE_DOMAIN` and does not serve normally. Stop the server (Ctrl-C).

- [ ] **Step 4: Verify it passes with a complete env**

Run:
```bash
npm run dev
```
Expected: `✓ Ready` with no env error. Stop the server.

- [ ] **Step 5: Lint**

Run:
```bash
npm run lint
```
Expected: no errors for `lib/env.ts` or `instrumentation.ts`.

- [ ] **Step 6: Document the vars in `.env.example`**

Add this block to the end of `.env.example`:

```bash
# --- Environment notes ---
# The following are validated at startup (see lib/env.ts + instrumentation.ts).
# A deploy missing any of them fails fast at boot instead of rendering broken pages:
#   NEXT_PUBLIC_SITE_URL, SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_API_TOKEN,
#   SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID, SHOPIFY_CUSTOMER_ACCOUNT_API_URL,
#   SHOPIFY_CUSTOMER_ACCOUNT_AUTH_URL, HYGRAPH_CONTENT_API_URL, HYGRAPH_CONTENT_API_READ_TOKEN
#
# Per-environment values (Vercel):
#   Production scope  → live-store SHOPIFY_* + NEXT_PUBLIC_SITE_URL=https://dealerlifts.com
#   Preview scope     → dev-store  SHOPIFY_* + NEXT_PUBLIC_SITE_URL=https://staging.dealerlifts.com
#   Shared (all)      → HYGRAPH_*, NEXT_PUBLIC_TAWK_*, SHOPIFY_STOREFRONT_API_VERSION
```

- [ ] **Step 7: Commit**

```bash
git add lib/env.ts instrumentation.ts .env.example
git commit -m "Add fail-fast server env validation at startup"
```

---

## Task 2: Create the staging Shopify development store

**Files:** none (Shopify Admin dashboard work; record outcomes in `docs/deploy/environments.md` in Task 6).

**Interfaces:**
- Produces: staging values for `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_API_TOKEN`, `SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID`, `SHOPIFY_CUSTOMER_ACCOUNT_API_URL`, `SHOPIFY_CUSTOMER_ACCOUNT_AUTH_URL` — consumed by Task 3.

- [ ] **Step 1: Create a development store**

In the Shopify Partners dashboard (partners.shopify.com) → **Stores → Add store → Create development store**. Name it e.g. `dealerlifts-staging`. Record the `*.myshopify.com` domain.

- [ ] **Step 2: Seed a product subset from the live store**

From the **live** store Admin: **Products → Export → Selected/Current page (a representative ~25–50 products) → CSV**. In the **dev** store Admin: **Products → Import → the CSV**. CSV `body_html` carries the "This Part Fits" fitment tables and `tags` carries the YMM fitment tags, so fitment display and search facets are populated as a static snapshot (the EasySearch/Turn14 apps are not installed on staging by design).

- [ ] **Step 3: Create a Storefront API token**

Dev store Admin → **Settings → Apps and sales channels → Develop apps → Create an app** (e.g. `Headless Storefront`) → **Configure Storefront API scopes** (products, collections, checkout/cart) → **Install** → copy the **Storefront API access token**. Record token + store domain.

- [ ] **Step 4: Configure the Customer Account API (headless)**

Dev store Admin → **Settings → Customer accounts** → ensure **New customer accounts** is on → open the **Headless** configuration. Register callback + logout URIs for staging (paths verified against `lib/shopify/customer-oauth.ts`):
- Callback: `https://staging.dealerlifts.com/api/auth/shopify/callback` (matches `callbackUrl()` → `${base}/api/auth/shopify/callback`, `customer-oauth.ts:118-120`)
- Logout redirect: `https://staging.dealerlifts.com` (the `post_logout_redirect_uri` is the bare `appUrl`, `customer-oauth.ts:238`)

Record `CLIENT_ID`, the Customer Account API URL, and the Auth URL.

- [ ] **Step 5: Enable Bogus Gateway for test checkout**

Dev store Admin → **Settings → Payments → add Bogus Gateway** (development stores expose it under "Third-party providers" / test mode). Confirm a test card (`1` = success, per project notes) can be used.

- [ ] **Step 6: Verify the store locally**

Point `.env.local` at the dev store values and run the app:
```bash
npm run dev
```
Expected: products from the seeded subset load at `http://localhost:3000`, product pages show fitment tables, and add-to-cart works. Restore `.env.local` afterward.

---

## Task 3: Vercel project + per-environment env vars

**Files:** none (Vercel dashboard; record in `docs/deploy/environments.md`).

**Interfaces:**
- Consumes: staging Shopify values from Task 2; live-store Shopify values (existing).
- Produces: a Vercel Production deployment (from `main`) and a Staging deployment (from `dev`).

- [ ] **Step 1: Import the repository**

vercel.com → **Add New → Project → import the DealerLifts repo**. Framework preset auto-detects Next.js. Do not deploy yet if prompted for env vars — set them first (next steps).

- [ ] **Step 2: Set the Production branch**

Vercel **Project → Settings → Git → Production Branch = `main`**. This makes every non-`main` branch (including `dev`) a Preview deployment.

- [ ] **Step 3: Add Production-scoped env vars**

**Settings → Environment Variables**, scope = **Production**:
- `NEXT_PUBLIC_SITE_URL=https://dealerlifts.com`
- `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_API_TOKEN` = **live store** values
- `SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID`, `SHOPIFY_CUSTOMER_ACCOUNT_API_URL`, `SHOPIFY_CUSTOMER_ACCOUNT_AUTH_URL` = **live store** values

- [ ] **Step 4: Add Preview-scoped (staging) env vars**

Same screen, scope = **Preview**:
- `NEXT_PUBLIC_SITE_URL=https://staging.dealerlifts.com`
- `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_API_TOKEN` = **dev store** values from Task 2
- `SHOPIFY_CUSTOMER_ACCOUNT_API_*` = **dev store** values from Task 2

- [ ] **Step 5: Add shared (all-scope) env vars**

Add for **Production, Preview, and Development**:
- `HYGRAPH_CONTENT_API_URL`, `HYGRAPH_CONTENT_API_READ_TOKEN`
- `NEXT_PUBLIC_TAWK_PROPERTY_ID`, `NEXT_PUBLIC_TAWK_WIDGET_ID`
- `SHOPIFY_STOREFRONT_API_VERSION`
- `SHOPIFY_ADMIN_CLIENT_ID`, `SHOPIFY_ADMIN_CLIENT_SECRET` (per-store if Admin API is used server-side; otherwise scope Production/Preview to match each store)

- [ ] **Step 6: Trigger deployments and verify env validation**

Push `dev` and `main`. In each deployment's **Build/Runtime logs**, confirm there is **no** `Missing required environment variable(s)` error from Task 1. A deploy that logs that error has a mis-scoped var — fix and redeploy.

---

## Task 4: Domains + staging lockdown

**Files:** none (Vercel + DNS; record in `docs/deploy/environments.md`).

- [ ] **Step 1: Attach the production domain**

Vercel **Settings → Domains → add `dealerlifts.com` and `www.dealerlifts.com`**. Follow Vercel's DNS instructions at the registrar. Confirm both assign to the **Production** environment. (Do this at cutover if the domain currently points elsewhere — see Task 6.)

- [ ] **Step 2: Attach the staging subdomain**

Add `staging.dealerlifts.com`; in its config, set it to deploy from the **`dev` branch** (Domains → Edit → Git Branch = `dev`) so it tracks staging rather than the latest preview.

- [ ] **Step 3: Password-protect staging**

Vercel **Settings → Deployment Protection → enable Password/Vercel Authentication for Preview deployments** (or add HTTP Basic Auth). Confirm `https://staging.dealerlifts.com` prompts for a password when opened in a private window.

- [ ] **Step 4: Register the staging URL in Shopify**

Confirm the callback/logout URIs from Task 2 Step 4 exactly match `https://staging.dealerlifts.com`. Open staging, click **Sign in**, and confirm the OAuth round-trip completes without an "Invalid redirect_uri" error.

---

## Task 5: Staging smoke test + isolation verification

**Files:** none.

- [ ] **Step 1: End-to-end staging smoke test**

On `https://staging.dealerlifts.com`: browse products, open a product page (fitment table renders), add to cart, and complete a **Bogus Gateway** checkout. Expected: order confirmation succeeds.

- [ ] **Step 2: Verify data isolation**

Confirm the staging test order appears **only** in the **dev** store Admin (Orders), **not** in the live store, and that **no** Turn14 fulfillment is triggered (staging has no Turn 14 Distribution app). Expected: live store Orders shows nothing new.

- [ ] **Step 3: Verify customer auth on staging**

Sign in via Customer Account OAuth on staging; confirm the account page loads and sign-out returns to `https://staging.dealerlifts.com`. Expected: no redirect_uri errors.

---

## Task 6: Production go-live runbook + cutover checklist (docs)

**Files:**
- Create: `docs/deploy/environments.md`

- [ ] **Step 1: Write the runbook**

Create `docs/deploy/environments.md` capturing: the environment table (local/staging/prod), the recorded dev-store domain + which values live in which Vercel scope (names only, never secrets), the domain/DNS setup, staging password location, and the go-live checklist below.

- [ ] **Step 2: Record the production cutover checklist in that doc**

Include this checklist verbatim:

```markdown
## Production go-live checklist
- [ ] Live store: real payment gateway enabled, Bogus Gateway disabled.
- [ ] Live store: Turn 14 Distribution (Data Here-to-There) app connected and syncing.
- [ ] Production env vars in Vercel point at the live store; NEXT_PUBLIC_SITE_URL=https://dealerlifts.com.
- [ ] Customer Account API on the live store registers https://dealerlifts.com/api/auth/shopify/callback + https://dealerlifts.com (logout) URIs.
- [ ] DNS for dealerlifts.com + www points at Vercel; SSL issued and verified.
- [ ] robots/indexing enabled on production; staging remains password-protected.
- [ ] One controlled real order placed and verified end-to-end (validates the live
      Turn14 order-submission path that staging intentionally cannot exercise), then refunded/cancelled as appropriate.
```

- [ ] **Step 3: Commit**

```bash
git add docs/deploy/environments.md
git commit -m "Add environments runbook and production go-live checklist"
```

---

## Self-Review

**Spec coverage:**
- Vercel host + branch mapping → Task 3. ✓
- Separate dev store for staging → Task 2. ✓
- Seed product subset, no Turn14 connection on staging → Task 2 Step 2; verified in Task 5 Step 2. ✓
- `NEXT_PUBLIC_SITE_URL` per environment + Customer Account callback registration → Task 2 Step 4, Task 3 Steps 3–4, Task 4 Step 4. ✓
- Shared Hygraph/Tawk → Task 3 Step 5. ✓
- Staging domain + password protection → Task 4. ✓
- Env-validation code → Task 1. ✓
- Go-live checklist → Task 6. ✓

**Placeholder scan:** No TBD/TODO; all code shown in full; all dashboard steps name exact menu paths and expected outcomes.

**Type consistency:** `assertServerEnv` defined in Task 1 Step 1 and called in Task 1 Step 2 with matching name/signature. Callback path in Task 2 Step 4 matches the `callbackUrl()` convention referenced from `lib/shopify/customer-oauth.ts`.
