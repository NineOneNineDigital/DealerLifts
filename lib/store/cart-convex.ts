import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  ensureConvexSessionId,
  getConvexSessionId,
} from "@/lib/store/cart-cookie";
import { getConvexServerClient } from "@/lib/store/convex-server";
import type { NormalizedCart, NormalizedCartItem } from "@/lib/store/types";

const EMPTY: NormalizedCart = {
  checkoutUrl: null,
  itemCount: 0,
  items: [],
  source: "convex",
  subtotalCents: 0,
};

interface ConvexCartItemDoc {
  _id: Id<"cartItems">;
  product: {
    images?: string[];
    mapPrice?: number;
    partNumber: string;
    retailPrice?: number;
    slug: string;
    thumbnail?: string;
    title: string;
  } | null;
  productId: Id<"products">;
  quantity: number;
}

function mapLine(item: ConvexCartItemDoc): NormalizedCartItem | null {
  if (!item.product) {
    return null;
  }
  const priceCents = item.product.mapPrice ?? item.product.retailPrice ?? 0;
  return {
    id: item._id,
    partNumber: item.product.partNumber,
    priceCents,
    productImage: item.product.thumbnail ?? item.product.images?.[0] ?? null,
    productSlug: item.product.slug,
    productTitle: item.product.title,
    quantity: item.quantity,
  };
}

export async function getCart(): Promise<NormalizedCart> {
  const sessionId = await getConvexSessionId();
  if (!sessionId) {
    return EMPTY;
  }
  const client = getConvexServerClient();
  const raw = (await client.query(api.cart.getItems, {
    sessionId,
  })) as ConvexCartItemDoc[];
  const items = raw
    .map(mapLine)
    .filter((line): line is NormalizedCartItem => line !== null);
  const subtotalCents = items.reduce(
    (sum, line) => sum + line.priceCents * line.quantity,
    0
  );
  const itemCount = items.reduce((sum, line) => sum + line.quantity, 0);
  return {
    checkoutUrl: null,
    itemCount,
    items,
    source: "convex",
    subtotalCents,
  };
}

export async function addLine(
  merchandiseId: string,
  quantity: number
): Promise<NormalizedCart> {
  const sessionId = await ensureConvexSessionId();
  const client = getConvexServerClient();
  await client.mutation(api.cart.addItem, {
    productId: merchandiseId as Id<"products">,
    quantity,
    sessionId,
  });
  return getCart();
}

export async function updateLine(
  lineId: string,
  quantity: number
): Promise<NormalizedCart> {
  const client = getConvexServerClient();
  await client.mutation(api.cart.updateQuantity, {
    id: lineId as Id<"cartItems">,
    quantity,
  });
  return getCart();
}

export async function removeLine(lineId: string): Promise<NormalizedCart> {
  const client = getConvexServerClient();
  await client.mutation(api.cart.removeItem, {
    id: lineId as Id<"cartItems">,
  });
  return getCart();
}

export async function clearCart(): Promise<NormalizedCart> {
  const sessionId = await getConvexSessionId();
  if (!sessionId) {
    return EMPTY;
  }
  const client = getConvexServerClient();
  await client.mutation(api.cart.clearCart, { sessionId });
  return getCart();
}
