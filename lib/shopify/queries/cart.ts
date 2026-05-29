import type { FetchOptions } from "@/lib/shopify/client";
import { shopifyFetch } from "@/lib/shopify/client";
import { CART_FRAGMENT } from "@/lib/shopify/fragments";
import type { ShopifyCart } from "@/lib/shopify/types";

const CART_CREATE_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CartCreate($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart {
        ...CartFields
      }
      userErrors {
        code
        field
        message
      }
    }
  }
`;

const CART_GET_QUERY = /* GraphQL */ `
  ${CART_FRAGMENT}
  query CartGet($id: ID!) {
    cart(id: $id) {
      ...CartFields
    }
  }
`;

const CART_LINES_ADD_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        code
        field
        message
      }
    }
  }
`;

const CART_LINES_UPDATE_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        code
        field
        message
      }
    }
  }
`;

const CART_LINES_REMOVE_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFields
      }
      userErrors {
        code
        field
        message
      }
    }
  }
`;

export interface ShopifyCartUserError {
  code: string | null;
  field: string[] | null;
  message: string;
}

interface CartMutationResult {
  cart: ShopifyCart | null;
  userErrors: ShopifyCartUserError[];
}

function assertNoUserErrors(
  result: CartMutationResult | undefined,
  context: string
): ShopifyCart {
  if (!result?.cart) {
    throw new Error(`Shopify ${context}: no cart returned`);
  }
  if (result.userErrors.length > 0) {
    const messages = result.userErrors.map((e) => e.message).join("; ");
    throw new Error(`Shopify ${context}: ${messages}`);
  }
  return result.cart;
}

export async function cartCreate(
  lines: Array<{ merchandiseId: string; quantity: number }>,
  options?: FetchOptions
): Promise<ShopifyCart> {
  const data = await shopifyFetch<{ cartCreate: CartMutationResult }>(
    CART_CREATE_MUTATION,
    { lines },
    options
  );
  return assertNoUserErrors(data.cartCreate, "cartCreate");
}

export async function cartGet(
  id: string,
  options?: FetchOptions
): Promise<ShopifyCart | null> {
  const data = await shopifyFetch<{ cart: ShopifyCart | null }>(
    CART_GET_QUERY,
    { id },
    options
  );
  return data.cart;
}

export async function cartLinesAdd(
  cartId: string,
  lines: Array<{ merchandiseId: string; quantity: number }>,
  options?: FetchOptions
): Promise<ShopifyCart> {
  const data = await shopifyFetch<{ cartLinesAdd: CartMutationResult }>(
    CART_LINES_ADD_MUTATION,
    { cartId, lines },
    options
  );
  return assertNoUserErrors(data.cartLinesAdd, "cartLinesAdd");
}

export async function cartLinesUpdate(
  cartId: string,
  lines: Array<{ id: string; quantity: number }>,
  options?: FetchOptions
): Promise<ShopifyCart> {
  const data = await shopifyFetch<{ cartLinesUpdate: CartMutationResult }>(
    CART_LINES_UPDATE_MUTATION,
    { cartId, lines },
    options
  );
  return assertNoUserErrors(data.cartLinesUpdate, "cartLinesUpdate");
}

export async function cartLinesRemove(
  cartId: string,
  lineIds: string[],
  options?: FetchOptions
): Promise<ShopifyCart> {
  const data = await shopifyFetch<{ cartLinesRemove: CartMutationResult }>(
    CART_LINES_REMOVE_MUTATION,
    { cartId, lineIds },
    options
  );
  return assertNoUserErrors(data.cartLinesRemove, "cartLinesRemove");
}
