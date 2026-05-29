import { ConvexHttpClient } from "convex/browser";

let cached: ConvexHttpClient | null = null;

/**
 * Lazy-initialized Convex HTTP client for server-side use.
 * Throws at call time (not module load) if NEXT_PUBLIC_CONVEX_URL is unset.
 */
export function getConvexServerClient(): ConvexHttpClient {
  if (cached) {
    return cached;
  }
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_CONVEX_URL is not set. Required when STOREFRONT_SOURCE=convex."
    );
  }
  cached = new ConvexHttpClient(url);
  return cached;
}
