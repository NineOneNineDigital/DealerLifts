import type { FetchOptions } from "@/lib/shopify/client";
import { shopifyFetch } from "@/lib/shopify/client";
import { PRODUCT_FRAGMENT } from "@/lib/shopify/fragments";
import type { ProductConnection, ShopifyProduct } from "@/lib/shopify/types";

const LIST_PRODUCTS_QUERY = /* GraphQL */ `
  ${PRODUCT_FRAGMENT}
  query ListProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      nodes {
        ...ProductFields
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  ${PRODUCT_FRAGMENT}
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      ...ProductFields
    }
  }
`;

export async function listProducts(
  args: { first: number; after?: string },
  options?: FetchOptions
): Promise<ProductConnection> {
  const data = await shopifyFetch<{ products: ProductConnection }>(
    LIST_PRODUCTS_QUERY,
    { first: args.first, after: args.after ?? null },
    options
  );
  return data.products;
}

export async function productByHandle(
  handle: string,
  options?: FetchOptions
): Promise<ShopifyProduct | null> {
  const data = await shopifyFetch<{ product: ShopifyProduct | null }>(
    PRODUCT_BY_HANDLE_QUERY,
    { handle },
    options
  );
  return data.product;
}

const SEARCH_PRODUCTS_QUERY = /* GraphQL */ `
  ${PRODUCT_FRAGMENT}
  query SearchProducts($query: String!, $first: Int!, $after: String) {
    products(query: $query, first: $first, after: $after, sortKey: RELEVANCE) {
      nodes {
        ...ProductFields
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export async function searchProducts(
  args: { query: string; first: number; after?: string },
  options?: FetchOptions
): Promise<ProductConnection> {
  const data = await shopifyFetch<{ products: ProductConnection }>(
    SEARCH_PRODUCTS_QUERY,
    {
      query: args.query,
      first: args.first,
      after: args.after ?? null,
    },
    options
  );
  return data.products;
}

// ---------------------------------------------------------------------------
// Vendor (brand) enumeration. This store has no brand collections — every
// collection is a category — so the real brands live in each product's
// `vendor`. The Storefront API has no "list vendors" endpoint and this store
// has not enabled a vendor filter facet, so we page through products fetching
// only `vendor` and dedupe. Callers should cache the aggregated result.
// ---------------------------------------------------------------------------

const LIST_VENDORS_QUERY = /* GraphQL */ `
  query ListVendors($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      nodes {
        vendor
        productType
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

interface VendorPage {
  products: {
    nodes: { vendor: string | null; productType: string | null }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
}

export interface VendorCount {
  count: number;
  name: string;
  /** Most common product types carried for this brand, most-common first. */
  topCategories: string[];
}

export async function listAllVendors(
  options?: FetchOptions
): Promise<VendorCount[]> {
  const counts = new Map<string, number>();
  // Per-vendor product-type tallies, aggregated in the same pass.
  const typeCounts = new Map<string, Map<string, number>>();
  let after: string | null = null;
  // Backstop against unbounded pagination — 250/page covers ~20k products,
  // comfortably above the current catalog. Raise if the catalog outgrows it.
  const MAX_PAGES = 80;

  for (let page = 0; page < MAX_PAGES; page++) {
    const data: VendorPage = await shopifyFetch<VendorPage>(
      LIST_VENDORS_QUERY,
      { first: 250, after },
      options
    );
    for (const node of data.products.nodes) {
      if (!node.vendor) {
        continue;
      }
      counts.set(node.vendor, (counts.get(node.vendor) ?? 0) + 1);
      if (node.productType) {
        let types = typeCounts.get(node.vendor);
        if (!types) {
          types = new Map<string, number>();
          typeCounts.set(node.vendor, types);
        }
        types.set(node.productType, (types.get(node.productType) ?? 0) + 1);
      }
    }
    if (!data.products.pageInfo.hasNextPage) {
      break;
    }
    after = data.products.pageInfo.endCursor;
  }

  // Sort by product count (popularity) descending, then name for stability.
  return Array.from(counts, ([name, count]) => ({
    count,
    name,
    topCategories: Array.from(typeCounts.get(name) ?? new Map())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type]) => type),
  })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
