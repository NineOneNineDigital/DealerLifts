import type { FetchOptions } from "@/lib/shopify/client";
import { shopifyFetch } from "@/lib/shopify/client";
import { COLLECTION_FRAGMENT, PRODUCT_FRAGMENT } from "@/lib/shopify/fragments";
import type {
  CollectionConnection,
  ProductConnection,
  ShopifyCollection,
} from "@/lib/shopify/types";

const COLLECTION_BY_HANDLE_QUERY = /* GraphQL */ `
  ${COLLECTION_FRAGMENT}
  ${PRODUCT_FRAGMENT}
  query CollectionByHandle($handle: String!, $first: Int!, $after: String) {
    collection(handle: $handle) {
      ...CollectionFields
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
  }
`;

const LIST_COLLECTIONS_QUERY = /* GraphQL */ `
  ${COLLECTION_FRAGMENT}
  query ListCollections($first: Int!, $after: String) {
    collections(first: $first, after: $after) {
      nodes {
        ...CollectionFields
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export interface CollectionByHandleResult {
  collection: (ShopifyCollection & { products: ProductConnection }) | null;
}

export async function collectionByHandle(
  args: { handle: string; first: number; after?: string },
  options?: FetchOptions
): Promise<CollectionByHandleResult["collection"]> {
  const data = await shopifyFetch<CollectionByHandleResult>(
    COLLECTION_BY_HANDLE_QUERY,
    {
      handle: args.handle,
      first: args.first,
      after: args.after ?? null,
    },
    options
  );
  return data.collection;
}

export async function listCollections(
  args: { first: number; after?: string },
  options?: FetchOptions
): Promise<CollectionConnection> {
  const data = await shopifyFetch<{ collections: CollectionConnection }>(
    LIST_COLLECTIONS_QUERY,
    { first: args.first, after: args.after ?? null },
    options
  );
  return data.collections;
}

// ---------------------------------------------------------------------------
// Brand listing — includes a minimal "has any product" probe so the storefront
// can filter out empty brand collections (e.g. brands the Turn14 integration
// has not yet synced any products for).
// ---------------------------------------------------------------------------

const LIST_BRANDS_QUERY = /* GraphQL */ `
  ${COLLECTION_FRAGMENT}
  query ListBrandsWithProducts($first: Int!) {
    collections(first: $first) {
      nodes {
        ...CollectionFields
        products(first: 1) {
          nodes {
            id
          }
        }
      }
    }
  }
`;

export type BrandWithProductsNode = ShopifyCollection & {
  products: { nodes: { id: string }[] };
};

export async function listBrandsWithProducts(
  first = 100,
  options?: FetchOptions
): Promise<BrandWithProductsNode[]> {
  const data = await shopifyFetch<{
    collections: { nodes: BrandWithProductsNode[] };
  }>(LIST_BRANDS_QUERY, { first }, options);
  return data.collections.nodes;
}
