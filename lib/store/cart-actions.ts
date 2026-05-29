"use server";

import {
  addLine,
  clearCart,
  getCart,
  removeLine,
  updateLine,
} from "@/lib/store/cart";
import type { NormalizedCart } from "@/lib/store/types";

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
