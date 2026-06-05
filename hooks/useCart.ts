"use client";

import { useCartContext } from "@/lib/store/cart-context";

export function useCart() {
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
    source: cart.source,
    subtotal: cart.subtotalCents,
    updateQuantity,
  };
}
