"use server";

import { cookies } from "next/headers";
import {
  addLine,
  clearCart,
  getCart,
  removeLine,
  updateLine,
} from "@/lib/store/cart";
import type { NormalizedCart } from "@/lib/store/types";

const CONVEX_COOKIE = "cart_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export async function getCartAction(): Promise<NormalizedCart> {
  return await getCart();
}

export async function addLineAction(
  merchandiseId: string,
  quantity = 1
): Promise<NormalizedCart> {
  return await addLine(merchandiseId, quantity);
}

export async function updateLineAction(
  lineId: string,
  quantity: number
): Promise<NormalizedCart> {
  return await updateLine(lineId, quantity);
}

export async function removeLineAction(
  lineId: string
): Promise<NormalizedCart> {
  return await removeLine(lineId);
}

export async function clearCartAction(): Promise<NormalizedCart> {
  return await clearCart();
}

/**
 * Copies the legacy localStorage session ID into the `cart_session` cookie.
 * The Convex cart adapter and the existing `/api/checkout` flow both key on
 * this session ID — keeping them in sync prevents cart data loss when the
 * cookie is created fresh on first load. Called once on CartProvider mount.
 */
export async function syncSessionAction(sessionId: string): Promise<void> {
  const store = await cookies();
  const existing = store.get(CONVEX_COOKIE)?.value;
  if (existing === sessionId) {
    return;
  }
  store.set({
    name: CONVEX_COOKIE,
    value: sessionId,
    httpOnly: true,
    sameSite: "lax",
    maxAge: MAX_AGE_SECONDS,
    path: "/",
  });
}
