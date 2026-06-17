import type { FetchOptions } from "@/lib/shopify/client";
import { shopifyFetch } from "@/lib/shopify/client";
import { PRODUCT_FRAGMENT } from "@/lib/shopify/fragments";
import { MARKET_COUNTRY } from "@/lib/shopify/market";
import type { ProductConnection } from "@/lib/shopify/types";

const PRODUCTS_BY_VEHICLE_TAG_QUERY = /* GraphQL */ `
  ${PRODUCT_FRAGMENT}
  query ProductsByVehicleTag($q: String!, $first: Int!, $after: String) @inContext(country: ${MARKET_COUNTRY}) {
    products(query: $q, first: $first, after: $after) {
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

const PRODUCTS_TAGS_ONLY_QUERY = /* GraphQL */ `
  query ProductsTagsOnly($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      nodes {
        tags
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export async function productsByVehicleTag(
  args: { query: string; first: number; after?: string },
  options?: FetchOptions
): Promise<ProductConnection> {
  const data = await shopifyFetch<{ products: ProductConnection }>(
    PRODUCTS_BY_VEHICLE_TAG_QUERY,
    {
      after: args.after ?? null,
      first: args.first,
      q: args.query,
    },
    options
  );
  return data.products;
}

interface TagsOnlyNode {
  tags: string[];
}

interface TagsOnlyConnection {
  nodes: TagsOnlyNode[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
}

/**
 * Walk the entire catalog, returning every product's tags in flattened form
 * (one list per product). Used by aggregation that builds the make/model/year
 * dropdown values. Caller should memoize aggressively because this can be
 * 10s of GraphQL calls for stores with thousands of products.
 *
 * Stops walking if `pageLimit` is reached (default 200 pages of 250 = 50,000
 * products). Returns `tagSets` and `truncated` so callers can detect a
 * truncated crawl and act accordingly.
 */
export async function listAllProductTags(
  options?: FetchOptions & { pageSize?: number; pageLimit?: number }
): Promise<{ tagSets: string[][]; truncated: boolean }> {
  const pageSize = options?.pageSize ?? 250;
  const pageLimit = options?.pageLimit ?? 200;
  const tagSets: string[][] = [];
  let cursor: string | null = null;

  for (let pagesFetched = 0; pagesFetched < pageLimit; pagesFetched++) {
    const page: { products: TagsOnlyConnection } = await shopifyFetch<{
      products: TagsOnlyConnection;
    }>(PRODUCTS_TAGS_ONLY_QUERY, { after: cursor, first: pageSize }, options);
    for (const node of page.products.nodes) {
      tagSets.push(node.tags);
    }
    if (!page.products.pageInfo.hasNextPage) {
      return { tagSets, truncated: false };
    }
    cursor = page.products.pageInfo.endCursor;
  }

  return { tagSets, truncated: true };
}
