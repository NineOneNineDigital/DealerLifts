/**
 * Shopify Customer Account API — authenticated GraphQL client.
 *
 * Sends requests to the Customer Account API using a customer access token.
 * Automatically refreshes expired tokens and persists new tokens to cookies.
 */

import { refreshAccessToken } from "@/lib/shopify/customer-oauth";
import {
  clearCustomerTokens,
  getCustomerTokens,
  isAccessTokenValid,
  setCustomerTokens,
} from "@/lib/store/customer-cookies";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const CUSTOMER_ACCOUNT_API_URL = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_URL;
// Customer Account API version is separate from Storefront API version.
const API_VERSION = "2024-10";

function resolveApiUrl(): string {
  if (!CUSTOMER_ACCOUNT_API_URL) {
    throw new Error(
      "SHOPIFY_CUSTOMER_ACCOUNT_API_URL is not set. Add it to .env.local."
    );
  }
  return `${CUSTOMER_ACCOUNT_API_URL}/account/customer/api/${API_VERSION}/graphql`;
}

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

interface CustomerApiError {
  extensions?: { code?: string };
  message: string;
}

interface CustomerApiResponse<T> {
  data?: T;
  errors?: CustomerApiError[];
}

// ---------------------------------------------------------------------------
// Core fetch function
// ---------------------------------------------------------------------------

/**
 * Execute a Customer Account API GraphQL query or mutation.
 *
 * Automatically:
 * 1. Checks if the access token is still valid (with 60s buffer).
 * 2. Refreshes it using the refresh token if expired.
 * 3. Persists new tokens to cookies.
 * 4. Throws `CustomerNotAuthenticatedError` if no tokens exist at all.
 */
export async function customerFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const tokens = await getCustomerTokens();

  if (!tokens) {
    throw new CustomerNotAuthenticatedError(
      "No customer tokens found. User must log in first."
    );
  }

  let accessToken = tokens.accessToken;

  // Refresh if expired (or within 60 seconds of expiry)
  if (!(await isAccessTokenValid())) {
    try {
      const refreshed = await refreshAccessToken(tokens.refreshToken);
      const expiresAt = Date.now() + refreshed.expires_in * 1000;
      const newTokens = {
        accessToken: refreshed.access_token,
        expiresAt,
        refreshToken: refreshed.refresh_token,
      };
      await setCustomerTokens(newTokens);
      accessToken = newTokens.accessToken;
    } catch {
      // Refresh failed — clear stale tokens and signal re-auth required
      await clearCustomerTokens();
      throw new CustomerNotAuthenticatedError(
        "Customer token refresh failed. User must log in again."
      );
    }
  }

  const url = resolveApiUrl();

  const res = await fetch(url, {
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
    headers: {
      Authorization: accessToken,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!res.ok) {
    throw new Error(
      `Customer Account API request failed: ${res.status} ${res.statusText}`
    );
  }

  const json = (await res.json()) as CustomerApiResponse<T>;

  if (json.errors?.length) {
    const codes = json.errors.map((e) => e.extensions?.code).filter(Boolean);
    if (codes.includes("UNAUTHORIZED") || codes.includes("UNAUTHENTICATED")) {
      await clearCustomerTokens();
      throw new CustomerNotAuthenticatedError(
        "Customer Account API returned unauthorized. User must log in again."
      );
    }
    throw new Error(
      `Customer Account API error: ${json.errors.map((e) => e.message).join("; ")}`
    );
  }

  if (!json.data) {
    throw new Error("Customer Account API response missing data field");
  }

  return json.data;
}

// ---------------------------------------------------------------------------
// Sentinel error class
// ---------------------------------------------------------------------------

/**
 * Thrown when a customer fetch is attempted with no valid tokens,
 * or when the token refresh fails.
 *
 * Callers (e.g. React Server Components) should catch this and redirect
 * the user to `/api/auth/login`.
 *
 * @example
 * ```ts
 * import { CustomerNotAuthenticatedError } from "@/lib/shopify/customer-account-client";
 *
 * try {
 *   const data = await customerFetch(CUSTOMER_QUERY);
 * } catch (err) {
 *   if (err instanceof CustomerNotAuthenticatedError) {
 *     redirect("/api/auth/login");
 *   }
 *   throw err;
 * }
 * ```
 */
export class CustomerNotAuthenticatedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CustomerNotAuthenticatedError";
  }
}
