# Environments Runbook — Staging & Production

**Status:** Runbook to follow. As of this writing the Vercel project, the staging
Shopify development store, and the domains below **do not exist yet** — this doc
is the checklist for creating them (plan Tasks 2–5), not a record of completed
setup. Fill in the marked slots as each step is done.

**Host:** [Vercel](https://vercel.com) — native Next.js, branch-based deploys,
per-environment env-var scoping.

**Branch → environment mapping:**

| Git branch | Vercel environment |
|---|---|
| `main` | Production |
| `dev` | Staging (Preview, bound to `staging.dealerlifts.com`) |
| any other branch / PR | ephemeral Preview |

Related docs: [plan](../superpowers/plans/2026-07-12-staging-production-environments.md),
[design spec](../superpowers/specs/2026-07-12-staging-production-environments-design.md).

---

## Environment topology

| | Local dev | Staging | Production |
|---|---|---|---|
| Host | localhost + ngrok | Vercel (Preview, `dev` branch) | Vercel (Production, `main` branch) |
| Git branch | any | `dev` | `main` |
| Shopify store | dev store | free dev store (seeded product subset) | live store |
| `NEXT_PUBLIC_SITE_URL` | ngrok URL | `https://staging.dealerlifts.com` | `https://dealerlifts.com` |
| Payments | Bogus Gateway | Bogus Gateway | Real gateway |
| Turn14 app (Turn 14 Distribution / Data Here-to-There) | not connected | not connected (seeded data only) | connected (live sync) |
| Hygraph / Tawk | shared | shared | shared |
| Indexing / robots | n/a | disabled (password-protected) | enabled |

The staging Shopify store is a **separate free development store**, seeded with a
representative product subset from the live store (see plan Task 2). It never
carries a live Turn14 connection — the Turn14 app is installed on production
only, so staging test orders can never reach real fulfillment.

Staging dev-store domain: `<!-- fill in after Task 2 Step 1: dev store *.myshopify.com domain -->`

---

## Env vars by Vercel scope

Names only — never record actual values (tokens, secrets, client IDs) in this
file. Set values directly in Vercel Project Settings → Environment Variables.

The vars validated at startup (fail-fast, see `lib/env.ts` + `instrumentation.ts`)
are marked **[validated]**. A deploy missing any of these throws
`Missing required environment variable(s): ...` in the boot logs instead of
silently serving broken pages.

### Production scope (live store)

- `NEXT_PUBLIC_SITE_URL` **[validated]** — `https://dealerlifts.com`
- `SHOPIFY_STORE_DOMAIN` **[validated]** — live store
- `SHOPIFY_STOREFRONT_API_TOKEN` **[validated]** — live store
- `SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID` **[validated]** — live store
- `SHOPIFY_CUSTOMER_ACCOUNT_API_URL` **[validated]** — live store
- `SHOPIFY_CUSTOMER_ACCOUNT_AUTH_URL` **[validated]** — live store

### Preview scope (staging — dev store)

- `NEXT_PUBLIC_SITE_URL` **[validated]** — `https://staging.dealerlifts.com`
- `SHOPIFY_STORE_DOMAIN` **[validated]** — dev store, name: `<!-- fill in after Task 2 Step 3 -->`
- `SHOPIFY_STOREFRONT_API_TOKEN` **[validated]** — dev store token, name: `<!-- fill in after Task 2 Step 3: token name/label in Shopify Admin -->`
- `SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID` **[validated]** — dev store, `<!-- fill in after Task 2 Step 4 -->`
- `SHOPIFY_CUSTOMER_ACCOUNT_API_URL` **[validated]** — dev store, `<!-- fill in after Task 2 Step 4 -->`
- `SHOPIFY_CUSTOMER_ACCOUNT_AUTH_URL` **[validated]** — dev store, `<!-- fill in after Task 2 Step 4 -->`

### Shared (Production + Preview + Development)

- `HYGRAPH_CONTENT_API_URL` **[validated]**
- `HYGRAPH_CONTENT_API_READ_TOKEN` — optional, not startup-validated (anonymous Hygraph reads work without it)
- `NEXT_PUBLIC_TAWK_PROPERTY_ID`
- `NEXT_PUBLIC_TAWK_WIDGET_ID`
- `SHOPIFY_STOREFRONT_API_VERSION` — has a safe default in `lib/shopify/client.ts`, not startup-validated
- `SHOPIFY_ADMIN_CLIENT_ID`, `SHOPIFY_ADMIN_CLIENT_SECRET` — per-store if the Admin API is used server-side; otherwise scope to Production/Preview individually to match each store

---

## Customer Account API (OAuth) callback registration

`NEXT_PUBLIC_SITE_URL` drives the OAuth redirect origin
(`lib/shopify/customer-oauth.ts`). Each environment's exact URL must be
registered as an allowed callback/logout URI in that **store's** Customer
Account API "Headless" configuration (Shopify Admin → Settings → Customer
accounts → Headless):

| Environment | Callback URI | Logout redirect |
|---|---|---|
| Staging | `https://staging.dealerlifts.com/api/auth/shopify/callback` | `https://staging.dealerlifts.com` |
| Production | `https://dealerlifts.com/api/auth/shopify/callback` | `https://dealerlifts.com` |

Register the staging pair on the **dev store's** Headless config (Task 2 Step 4);
register the production pair on the **live store's** Headless config (Task 6
go-live checklist below).

---

## Domains / DNS

- **Production:** `dealerlifts.com` + `www.dealerlifts.com` → Vercel Production.
  Add both in Vercel **Settings → Domains**; follow Vercel's DNS instructions at
  the registrar; confirm both assign to the Production environment.
- **Staging:** `staging.dealerlifts.com` → set to deploy from the **`dev`
  branch** specifically (Domains → Edit → Git Branch = `dev`), so it always
  tracks staging rather than the most recent arbitrary preview.
- SSL is issued/managed automatically by Vercel once DNS resolves correctly.

## Staging password protection

Staging is not indexed and is not publicly browsable. Protection is managed in
**Vercel → Project → Settings → Deployment Protection** — enable
Password/Vercel Authentication for Preview deployments (or HTTP Basic Auth) and
confirm `https://staging.dealerlifts.com` prompts for a password in a private
browser window.

The staging password itself is **not** stored in this repo. Location for the
team to retrieve/rotate it: `TBD — record after Task 4 Step 3 (e.g. shared
password manager entry)`.

---

## Production go-live checklist
- [ ] Live store: real payment gateway enabled, Bogus Gateway disabled.
- [ ] Live store: Turn 14 Distribution (Data Here-to-There) app connected and syncing.
- [ ] Production env vars in Vercel point at the live store; NEXT_PUBLIC_SITE_URL=https://dealerlifts.com.
- [ ] Customer Account API on the live store registers https://dealerlifts.com/api/auth/shopify/callback + https://dealerlifts.com (logout) URIs.
- [ ] DNS for dealerlifts.com + www points at Vercel; SSL issued and verified.
- [ ] robots/indexing enabled on production; staging remains password-protected.
- [ ] One controlled real order placed and verified end-to-end (validates the live
      Turn14 order-submission path that staging intentionally cannot exercise), then refunded/cancelled as appropriate.
