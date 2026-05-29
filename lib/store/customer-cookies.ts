import { cookies } from "next/headers";

// ---------------------------------------------------------------------------
// Cookie names
// ---------------------------------------------------------------------------

/** Short-lived auth code state cookie (PKCE + nonce). Cleared after callback. */
const STATE_COOKIE = "customer_auth_state";
/** Short-lived code verifier for PKCE. Cleared after callback. */
const VERIFIER_COOKIE = "customer_code_verifier";
/** Long-lived customer access token (opaque Shopify token). */
const ACCESS_TOKEN_COOKIE = "customer_access_token";
/** Long-lived customer refresh token. */
const REFRESH_TOKEN_COOKIE = "customer_refresh_token";
/** Expiry timestamp (ms since epoch) of the access token. */
const EXPIRES_AT_COOKIE = "customer_token_expires_at";

const SHORT_MAX_AGE = 60 * 10; // 10 minutes — OAuth state lives briefly
const LONG_MAX_AGE = 60 * 60 * 24 * 30; // 30 days — refresh token lifetime

/**
 * Cookies are sent across the Shopify-hosted login (cross-site redirect).
 * Browsers require `Secure` when serving over HTTPS, otherwise Set-Cookie can
 * be silently dropped. The HTTPS tunnel (cloudflared) and production both
 * serve over HTTPS — set `secure: true` unconditionally and skip it only
 * for plain http://localhost dev (which never receives Shopify redirects
 * anyway because Shopify rejects http redirect URIs).
 */
const SECURE = process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https://") ?? false;

// ---------------------------------------------------------------------------
// Auth state (PKCE flow — written at login start, cleared at callback)
// ---------------------------------------------------------------------------

export async function setAuthState(
  state: string,
  verifier: string
): Promise<void> {
  const store = await cookies();
  const common = {
    httpOnly: true,
    maxAge: SHORT_MAX_AGE,
    path: "/",
    sameSite: "lax" as const,
    secure: SECURE,
  };
  store.set({ name: STATE_COOKIE, value: state, ...common });
  store.set({ name: VERIFIER_COOKIE, value: verifier, ...common });
}

export async function getAuthState(): Promise<{
  state: string;
  verifier: string;
} | null> {
  const store = await cookies();
  const state = store.get(STATE_COOKIE)?.value;
  const verifier = store.get(VERIFIER_COOKIE)?.value;
  if (!(state && verifier)) {
    return null;
  }
  return { state, verifier };
}

export async function clearAuthState(): Promise<void> {
  const store = await cookies();
  store.delete(STATE_COOKIE);
  store.delete(VERIFIER_COOKIE);
}

// ---------------------------------------------------------------------------
// Customer tokens (written at callback, cleared at logout)
// ---------------------------------------------------------------------------

export interface CustomerTokens {
  accessToken: string;
  expiresAt: number; // ms since epoch
  refreshToken: string;
}

export async function setCustomerTokens(tokens: CustomerTokens): Promise<void> {
  const store = await cookies();
  const common = {
    httpOnly: true,
    maxAge: LONG_MAX_AGE,
    path: "/",
    sameSite: "lax" as const,
    secure: SECURE,
  };
  store.set({
    name: ACCESS_TOKEN_COOKIE,
    value: tokens.accessToken,
    ...common,
  });
  store.set({
    name: REFRESH_TOKEN_COOKIE,
    value: tokens.refreshToken,
    ...common,
  });
  store.set({
    name: EXPIRES_AT_COOKIE,
    value: String(tokens.expiresAt),
    ...common,
  });
}

export async function getCustomerTokens(): Promise<CustomerTokens | null> {
  const store = await cookies();
  const accessToken = store.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = store.get(REFRESH_TOKEN_COOKIE)?.value;
  const expiresAtRaw = store.get(EXPIRES_AT_COOKIE)?.value;
  if (!(accessToken && refreshToken && expiresAtRaw)) {
    return null;
  }
  return { accessToken, expiresAt: Number(expiresAtRaw), refreshToken };
}

export async function clearCustomerTokens(): Promise<void> {
  const store = await cookies();
  store.delete(ACCESS_TOKEN_COOKIE);
  store.delete(REFRESH_TOKEN_COOKIE);
  store.delete(EXPIRES_AT_COOKIE);
}

/** Returns true if the stored access token is still valid (with 60-second buffer). */
export async function isAccessTokenValid(): Promise<boolean> {
  const tokens = await getCustomerTokens();
  if (!tokens) {
    return false;
  }
  return tokens.expiresAt - Date.now() > 60_000;
}
