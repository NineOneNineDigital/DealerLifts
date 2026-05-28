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
