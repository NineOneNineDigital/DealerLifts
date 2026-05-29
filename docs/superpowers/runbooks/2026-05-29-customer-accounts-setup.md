# Customer Account API Setup Runbook

Companion to Plan 2 (`docs/superpowers/plans/2026-05-29-shopify-customer-accounts.md`). These steps happen in Shopify Admin, not in this codebase.

## Prerequisites

- Shopify store on Basic plan or above
- Admin access to the Shopify store
- "New customer accounts" already enabled (see Phase 0 runbook step 4)

## 1. Enable new customer accounts (if not already done)

1. Shopify Admin → Settings → Customer accounts.
2. Select **New customer accounts** (passwordless / email-OTP login — no password required).
3. Save.

> If you are still on "Classic customer accounts", the Customer Account API OAuth flow will not work. Migration is one-click and does not delete existing customers.

## 2. Create a headless OAuth client

1. Shopify Admin → Settings → Customer accounts → scroll to **Headless**.
2. Click **Create a headless configuration**.
3. Enter a name, e.g. `DealerLifts Headless`.
4. Under **Callback URI(s)** add:
   - `http://localhost:3000/api/auth/callback` (local dev)
   - `https://dealerlifts.com/api/auth/callback` (production)
   - Any Vercel preview URL patterns if used, e.g. `https://dealerlifts-*.vercel.app/api/auth/callback`
5. Under **JavaScript origin(s)** add the same base URLs (without paths):
   - `http://localhost:3000`
   - `https://dealerlifts.com`
6. Save and copy the **Client ID** (it is public — safe to put in `NEXT_PUBLIC_*`).

## 3. Find the Customer Account API URL

The Customer Account API base URL has the form:

```
https://shopify.com/authentication/<numeric-store-id>
```

You can find `<numeric-store-id>` in Shopify Admin → Settings → Store details — it appears in the store's admin URL, e.g. `admin.shopify.com/store/<store-id>`.

Alternatively, copy the **Account URL** shown next to the headless config you just created; its origin is the value you need.

## 4. Save values to .env.local

```bash
NEXT_PUBLIC_SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID=<paste client id>
SHOPIFY_CUSTOMER_ACCOUNT_API_URL=https://shopify.com/authentication/<store-id>
NEXT_PUBLIC_SHOPIFY_APP_URL=http://localhost:3000   # change to prod URL on Vercel
```

## 5. Verify the OAuth flow locally

1. Start the dev server: `npm run dev`
2. Navigate to `/api/auth/login` — you should be redirected to Shopify's login page.
3. Sign in (or create a test account).
4. You should be redirected back to `/api/auth/callback` and then to `/account`.
5. Navigating to `/account` should show customer data (name, email, orders).

## 6. Production checklist

- [ ] `NEXT_PUBLIC_SHOPIFY_APP_URL` set to `https://dealerlifts.com` (or Vercel URL) in Vercel env vars.
- [ ] Callback URIs in Shopify Admin updated to include the production domain.
- [ ] JavaScript origins updated to include the production domain.
- [ ] `NEXT_PUBLIC_SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID` and `SHOPIFY_CUSTOMER_ACCOUNT_API_URL` set in Vercel env vars.
- [ ] `SHOPIFY_CUSTOMER_ACCOUNT_TOKEN_SECRET` (a random 32-byte hex string used to sign the state cookie) set in Vercel env vars — generate with `openssl rand -hex 32`.

## Troubleshooting

| Symptom | Likely cause |
|---------|-------------|
| Redirect to Shopify fails with "redirect_uri not allowed" | Callback URI not added in Shopify Admin headless config |
| Token exchange returns 400 | Code verifier / PKCE mismatch — clear cookies and retry |
| `/account` shows no orders | Customer Account API scopes missing — ensure `openid email` at minimum |
| "invalid_client" from Shopify | Wrong `client_id` — double-check `NEXT_PUBLIC_SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID` |
