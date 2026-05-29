/**
 * Shopify Customer Account API — PKCE OAuth helpers.
 *
 * All crypto uses the Web Crypto API (available in Node 18+ and the Edge runtime).
 * No external dependencies.
 */

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const CLIENT_ID = process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID;
const CUSTOMER_ACCOUNT_API_URL = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_URL;
const APP_URL =
  process.env.NEXT_PUBLIC_SHOPIFY_APP_URL ?? "http://localhost:3000";

// Top-level regexes for base64url encoding (avoids per-call recompilation)
const RE_PLUS = /\+/g;
const RE_SLASH = /\//g;
const RE_TRAILING_EQ = /=+$/;

function resolveConfig(): { clientId: string; apiUrl: string; appUrl: string } {
  if (!CLIENT_ID) {
    throw new Error(
      "NEXT_PUBLIC_SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID is not set. Add it to .env.local."
    );
  }
  if (!CUSTOMER_ACCOUNT_API_URL) {
    throw new Error(
      "SHOPIFY_CUSTOMER_ACCOUNT_API_URL is not set. Add it to .env.local."
    );
  }
  return {
    apiUrl: CUSTOMER_ACCOUNT_API_URL,
    appUrl: APP_URL,
    clientId: CLIENT_ID,
  };
}

// ---------------------------------------------------------------------------
// PKCE helpers
// ---------------------------------------------------------------------------

/**
 * Generate a cryptographically random code verifier (43–128 chars, URL-safe).
 * RFC 7636 §4.1
 */
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

/**
 * Derive the PKCE code challenge from a verifier (S256 method).
 * RFC 7636 §4.2
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(new Uint8Array(digest));
}

/** Generate a random state value to prevent CSRF. */
export function generateState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

function base64UrlEncode(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(RE_PLUS, "-")
    .replace(RE_SLASH, "_")
    .replace(RE_TRAILING_EQ, "");
}

// ---------------------------------------------------------------------------
// OAuth URL builders
// ---------------------------------------------------------------------------

/** The redirect URI that Shopify will send the code to after login. */
export function callbackUrl(appUrl?: string): string {
  const base = appUrl ?? APP_URL;
  return `${base}/api/auth/callback`;
}

/**
 * Build the Shopify Customer Account authorization URL.
 * Redirect the user's browser here to start the login flow.
 */
export async function buildAuthorizationUrl(opts: {
  nonce?: string;
}): Promise<{ url: string; state: string; verifier: string }> {
  const { apiUrl, appUrl, clientId } = resolveConfig();

  const state = opts.nonce ?? generateState();
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);

  const params = new URLSearchParams({
    client_id: clientId,
    code_challenge: challenge,
    code_challenge_method: "S256",
    redirect_uri: callbackUrl(appUrl),
    response_type: "code",
    scope: "openid email https://api.customers.com/auth/customer.graphql",
    state,
  });

  const url = `${apiUrl}/oauth/authorize?${params.toString()}`;
  return { state, url, verifier };
}

// ---------------------------------------------------------------------------
// Token exchange
// ---------------------------------------------------------------------------

export interface TokenResponse {
  access_token: string;
  expires_in: number;
  id_token?: string;
  refresh_token: string;
  token_type: string;
}

/**
 * Exchange an authorization code for access + refresh tokens.
 * Called from the `/api/auth/callback` route after Shopify redirects back.
 */
export async function exchangeCodeForTokens(opts: {
  code: string;
  verifier: string;
}): Promise<TokenResponse> {
  const { apiUrl, appUrl, clientId } = resolveConfig();

  const body = new URLSearchParams({
    client_id: clientId,
    code: opts.code,
    code_verifier: opts.verifier,
    grant_type: "authorization_code",
    redirect_uri: callbackUrl(appUrl),
  });

  const res = await fetch(`${apiUrl}/oauth/token`, {
    body: body.toString(),
    cache: "no-store",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "POST",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Customer Account token exchange failed: ${res.status} ${res.statusText} — ${text}`
    );
  }

  return (await res.json()) as TokenResponse;
}

/**
 * Use a refresh token to obtain a new access token.
 * Call this when `isAccessTokenValid()` returns false.
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<TokenResponse> {
  const { apiUrl, clientId } = resolveConfig();

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const res = await fetch(`${apiUrl}/oauth/token`, {
    body: body.toString(),
    cache: "no-store",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "POST",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Customer Account token refresh failed: ${res.status} ${res.statusText} — ${text}`
    );
  }

  return (await res.json()) as TokenResponse;
}

/**
 * Build the Shopify customer account logout URL.
 * Redirect the user here to clear their Shopify session.
 */
export function buildLogoutUrl(opts: { idToken?: string } = {}): string {
  const { apiUrl, appUrl, clientId } = resolveConfig();

  const params = new URLSearchParams({
    client_id: clientId,
    post_logout_redirect_uri: appUrl,
  });

  if (opts.idToken) {
    params.set("id_token_hint", opts.idToken);
  }

  return `${apiUrl}/oauth/logout?${params.toString()}`;
}
