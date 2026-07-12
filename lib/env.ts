/**
 * Fail-fast validation of required server environment variables.
 *
 * Called once at server startup (see instrumentation.ts) so a mis-scoped
 * deploy (e.g. Vercel Preview missing the staging Shopify token) errors
 * loudly at boot instead of silently serving broken pages.
 *
 * Keep this list to launch-critical vars only. Intentionally omitted:
 *  - SHOPIFY_STOREFRONT_API_VERSION — has a safe default in lib/shopify/client.ts.
 *  - HYGRAPH_CONTENT_API_READ_TOKEN — optional by design; lib/hygraph.ts only
 *    adds the Authorization header when it is set, so anonymous reads work
 *    without it. Requiring it here would break local dev and anonymous setups.
 */
const REQUIRED_SERVER_ENV = [
  "NEXT_PUBLIC_SITE_URL",
  "SHOPIFY_STORE_DOMAIN",
  "SHOPIFY_STOREFRONT_API_TOKEN",
  "SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID",
  "SHOPIFY_CUSTOMER_ACCOUNT_API_URL",
  "SHOPIFY_CUSTOMER_ACCOUNT_AUTH_URL",
  "HYGRAPH_CONTENT_API_URL",
] as const;

export function assertServerEnv(env: NodeJS.ProcessEnv = process.env): void {
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
