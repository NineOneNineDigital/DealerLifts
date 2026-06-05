const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.SHOPIFY_STOREFRONT_API_TOKEN;
const VERSION = process.env.SHOPIFY_STOREFRONT_API_VERSION ?? "2025-01";

interface ShopifyError {
  extensions?: { code?: string };
  message: string;
}
interface ShopifyResponse<T> {
  data?: T;
  errors?: ShopifyError[];
}

export interface FetchOptions {
  cache?: RequestCache;
  revalidate?: number;
}

const MAX_ATTEMPTS = 3;
const BASE_BACKOFF_MS = 500;

function resolveConfig(): { url: string; token: string } {
  if (!DOMAIN) {
    throw new Error("SHOPIFY_STORE_DOMAIN is not set. Add it to .env.local.");
  }
  if (!TOKEN) {
    throw new Error(
      "SHOPIFY_STOREFRONT_API_TOKEN is not set. Add it to .env.local."
    );
  }
  return {
    url: `https://${DOMAIN}/api/${VERSION}/graphql.json`,
    token: TOKEN,
  };
}

export async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  options?: FetchOptions
): Promise<T> {
  const { url, token } = resolveConfig();
  // `next.revalidate` and `cache` are mutually exclusive in Next.js fetch options; passing both produces a runtime warning.
  const cacheOpts: Pick<RequestInit, "next" | "cache"> =
    options?.cache === undefined
      ? { next: { revalidate: options?.revalidate ?? 60 } }
      : { cache: options.cache };
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify({ query, variables }),
      ...cacheOpts,
    });

    if (res.status === 430 || res.status === 429) {
      // Shopify throttling: backoff and retry.
      lastError = new Error(`Shopify throttled (HTTP ${res.status})`);
      if (attempt < MAX_ATTEMPTS) {
        await sleep(BASE_BACKOFF_MS * 2 ** (attempt - 1));
      }
      continue;
    }

    if (!res.ok) {
      throw new Error(
        `Shopify request failed: ${res.status} ${res.statusText}`
      );
    }

    const json = (await res.json()) as ShopifyResponse<T>;

    if (json.errors?.length) {
      const throttled = json.errors.some(
        (e) => e.extensions?.code === "THROTTLED"
      );
      if (throttled && attempt < MAX_ATTEMPTS) {
        lastError = new Error("Shopify GraphQL throttled");
        await sleep(BASE_BACKOFF_MS * 2 ** (attempt - 1));
        continue;
      }
      throw new Error(
        `Shopify GraphQL error: ${json.errors.map((e) => e.message).join("; ")}`
      );
    }

    if (!json.data) {
      throw new Error("Shopify response missing data field");
    }

    return json.data;
  }

  throw lastError ?? new Error("Shopify request failed after retries");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
