import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";

const CONVEX_COOKIE = "cart_session";
const SHOPIFY_COOKIE = "cart_id";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export async function getConvexSessionId(): Promise<string | null> {
  const store = await cookies();
  return store.get(CONVEX_COOKIE)?.value ?? null;
}

export async function ensureConvexSessionId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(CONVEX_COOKIE)?.value;
  if (existing) {
    return existing;
  }
  const fresh = randomUUID();
  store.set({
    name: CONVEX_COOKIE,
    value: fresh,
    httpOnly: true,
    sameSite: "lax",
    maxAge: MAX_AGE_SECONDS,
    path: "/",
  });
  return fresh;
}

export async function getShopifyCartId(): Promise<string | null> {
  const store = await cookies();
  return store.get(SHOPIFY_COOKIE)?.value ?? null;
}

export async function setShopifyCartId(cartId: string): Promise<void> {
  const store = await cookies();
  store.set({
    name: SHOPIFY_COOKIE,
    value: cartId,
    httpOnly: true,
    sameSite: "lax",
    maxAge: MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function clearShopifyCartId(): Promise<void> {
  const store = await cookies();
  store.delete(SHOPIFY_COOKIE);
}
