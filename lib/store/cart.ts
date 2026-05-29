import {
  addLine as convexAddLine,
  clearCart as convexClearCart,
  getCart as convexGetCart,
  removeLine as convexRemoveLine,
  updateLine as convexUpdateLine,
} from "@/lib/store/cart-convex";
import {
  addLine as shopifyAddLine,
  clearCart as shopifyClearCart,
  getCart as shopifyGetCart,
  removeLine as shopifyRemoveLine,
  updateLine as shopifyUpdateLine,
} from "@/lib/store/cart-shopify";
import type { StorefrontSource } from "@/lib/store/types";

function getSource(): StorefrontSource {
  const flag = process.env.STOREFRONT_SOURCE;
  return flag === "shopify" ? "shopify" : "convex";
}

export function getCart() {
  return getSource() === "shopify" ? shopifyGetCart() : convexGetCart();
}

export function addLine(merchandiseId: string, quantity: number) {
  return getSource() === "shopify"
    ? shopifyAddLine(merchandiseId, quantity)
    : convexAddLine(merchandiseId, quantity);
}

export function updateLine(lineId: string, quantity: number) {
  return getSource() === "shopify"
    ? shopifyUpdateLine(lineId, quantity)
    : convexUpdateLine(lineId, quantity);
}

export function removeLine(lineId: string) {
  return getSource() === "shopify"
    ? shopifyRemoveLine(lineId)
    : convexRemoveLine(lineId);
}

export function clearCart() {
  return getSource() === "shopify" ? shopifyClearCart() : convexClearCart();
}
