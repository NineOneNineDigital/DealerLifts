"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useTransition,
} from "react";
import {
  addLineAction,
  clearCartAction,
  getCartAction,
  removeLineAction,
  updateLineAction,
} from "@/lib/store/cart-actions";
import type { NormalizedCart } from "@/lib/store/types";

const EMPTY_CART: NormalizedCart = {
  checkoutUrl: null,
  itemCount: 0,
  items: [],
  source: "convex",
  subtotalCents: 0,
};

interface CartContextValue {
  addItem: (merchandiseId: string, quantity?: number) => void;
  cart: NormalizedCart;
  clearCart: () => void;
  isPending: boolean;
  refresh: () => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<NormalizedCart>(EMPTY_CART);
  const [isPending, startTransition] = useTransition();

  const refresh = useCallback(() => {
    startTransition(async () => {
      const fresh = await getCartAction();
      setCart(fresh);
    });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback((merchandiseId: string, quantity = 1) => {
    startTransition(async () => {
      const next = await addLineAction(merchandiseId, quantity);
      setCart(next);
    });
  }, []);

  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    startTransition(async () => {
      const next = await updateLineAction(lineId, quantity);
      setCart(next);
    });
  }, []);

  const removeItem = useCallback((lineId: string) => {
    startTransition(async () => {
      const next = await removeLineAction(lineId);
      setCart(next);
    });
  }, []);

  const clearCart = useCallback(() => {
    startTransition(async () => {
      const next = await clearCartAction();
      setCart(next);
    });
  }, []);

  return (
    <CartContext.Provider
      value={{
        addItem,
        cart,
        clearCart,
        isPending,
        refresh,
        removeItem,
        updateQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCartContext must be called inside <CartProvider>");
  }
  return ctx;
}
