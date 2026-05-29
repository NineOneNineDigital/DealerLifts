import {
  cartCreate,
  cartGet,
  cartLinesAdd,
  cartLinesRemove,
  cartLinesUpdate,
} from "@/lib/shopify/queries/cart";
import type { ShopifyCart } from "@/lib/shopify/types";
import {
  clearShopifyCartId,
  getShopifyCartId,
  setShopifyCartId,
} from "@/lib/store/cart-cookie";
import type { NormalizedCart, NormalizedCartItem } from "@/lib/store/types";

const NO_STORE = { cache: "no-store" as const };

const EMPTY: NormalizedCart = {
  checkoutUrl: null,
  itemCount: 0,
  items: [],
  source: "shopify",
  subtotalCents: 0,
};

function parseMoneyToCents(amount: string): number {
  const num = Number(amount);
  if (!Number.isFinite(num)) {
    return 0;
  }
  return Math.round(num * 100);
}

function mapCart(cart: ShopifyCart): NormalizedCart {
  const items: NormalizedCartItem[] = cart.lines.nodes.map((line) => {
    const totalCents = parseMoneyToCents(line.cost.totalAmount.amount);
    const priceCents =
      line.quantity > 0 ? Math.round(totalCents / line.quantity) : 0;
    return {
      id: line.id,
      partNumber: line.merchandise.sku ?? line.merchandise.product.handle,
      priceCents,
      productImage: line.merchandise.product.featuredImage?.url ?? null,
      productSlug: line.merchandise.product.handle,
      productTitle: line.merchandise.product.title,
      quantity: line.quantity,
    };
  });
  return {
    checkoutUrl: cart.checkoutUrl,
    itemCount: cart.totalQuantity,
    items,
    source: "shopify",
    subtotalCents: parseMoneyToCents(cart.cost.subtotalAmount.amount),
  };
}

export async function getCart(): Promise<NormalizedCart> {
  const cartId = await getShopifyCartId();
  if (!cartId) {
    return EMPTY;
  }
  const cart = await cartGet(cartId, NO_STORE);
  if (!cart) {
    // Cookie points at a cart Shopify no longer knows about — clear it.
    await clearShopifyCartId();
    return EMPTY;
  }
  return mapCart(cart);
}

export async function addLine(
  merchandiseId: string,
  quantity: number
): Promise<NormalizedCart> {
  const existingId = await getShopifyCartId();
  if (existingId) {
    const cart = await cartLinesAdd(
      existingId,
      [{ merchandiseId, quantity }],
      NO_STORE
    );
    return mapCart(cart);
  }
  const cart = await cartCreate([{ merchandiseId, quantity }], NO_STORE);
  await setShopifyCartId(cart.id);
  return mapCart(cart);
}

export async function updateLine(
  lineId: string,
  quantity: number
): Promise<NormalizedCart> {
  const cartId = await getShopifyCartId();
  if (!cartId) {
    return EMPTY;
  }
  if (quantity <= 0) {
    return removeLine(lineId);
  }
  const cart = await cartLinesUpdate(
    cartId,
    [{ id: lineId, quantity }],
    NO_STORE
  );
  return mapCart(cart);
}

export async function removeLine(lineId: string): Promise<NormalizedCart> {
  const cartId = await getShopifyCartId();
  if (!cartId) {
    return EMPTY;
  }
  const cart = await cartLinesRemove(cartId, [lineId], NO_STORE);
  return mapCart(cart);
}

export async function clearCart(): Promise<NormalizedCart> {
  const cartId = await getShopifyCartId();
  if (!cartId) {
    return EMPTY;
  }
  const cart = await cartGet(cartId, NO_STORE);
  if (!cart || cart.lines.nodes.length === 0) {
    await clearShopifyCartId();
    return EMPTY;
  }
  const lineIds = cart.lines.nodes.map((l) => l.id);
  const cleared = await cartLinesRemove(cartId, lineIds, NO_STORE);
  return mapCart(cleared);
}
