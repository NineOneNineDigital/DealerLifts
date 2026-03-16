"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSessionId } from "./useSessionId";
import type { Id } from "@/convex/_generated/dataModel";

export function useCart() {
  const sessionId = useSessionId();
  const items = useQuery(api.cart.getItems, sessionId ? { sessionId } : "skip");
  const itemCount = useQuery(api.cart.getItemCount, sessionId ? { sessionId } : "skip");
  const addItemMutation = useMutation(api.cart.addItem);
  const updateQuantityMutation = useMutation(api.cart.updateQuantity);
  const removeItemMutation = useMutation(api.cart.removeItem);
  const clearCartMutation = useMutation(api.cart.clearCart);

  const addItem = (productId: Id<"products">, quantity = 1) => {
    if (!sessionId) return;
    addItemMutation({ sessionId, productId, quantity });
  };

  const updateQuantity = (id: Id<"cartItems">, quantity: number) => {
    updateQuantityMutation({ id, quantity });
  };

  const removeItem = (id: Id<"cartItems">) => {
    removeItemMutation({ id });
  };

  const clearCart = () => {
    if (!sessionId) return;
    clearCartMutation({ sessionId });
  };

  const subtotal =
    items?.reduce((sum, item) => {
      const price = item.product?.mapPrice || item.product?.retailPrice || 0;
      return sum + price * item.quantity;
    }, 0) ?? 0;

  return {
    items: items ?? [],
    itemCount: itemCount ?? 0,
    subtotal,
    sessionId,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };
}
