"use client";

import { useCartContext } from "@/lib/store/cart-context";
import { useSessionId } from "./useSessionId";

export function useCart() {
  const sessionId = useSessionId();
  const {
    addItem,
    cart,
    clearCart,
    isPending,
    refresh,
    removeItem,
    updateQuantity,
  } = useCartContext();

  return {
    addItem,
    checkoutUrl: cart.checkoutUrl,
    clearCart,
    isPending,
    itemCount: cart.itemCount,
    items: cart.items,
    refresh,
    removeItem,
    sessionId,
    source: cart.source,
    subtotal: cart.subtotalCents,
    updateQuantity,
  };
}
