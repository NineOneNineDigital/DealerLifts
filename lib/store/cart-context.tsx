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
  source: "shopify",
  subtotalCents: 0,
};

interface CartContextValue {
  addItem: (merchandiseId: string, quantity?: number) => void;
  cart: NormalizedCart;
  clearCart: () => void;
  /** Last failed cart operation, if any — lets the UI show a message instead
   * of the whole app crashing when a server action throws. */
  error: string | null;
  isPending: boolean;
  refresh: () => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<NormalizedCart>(EMPTY_CART);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Wraps a cart server action so a failure surfaces as `error` state rather
  // than an unhandled rejection that bubbles to the error boundary and takes
  // down the page.
  const run = useCallback((op: () => Promise<NormalizedCart>) => {
    startTransition(async () => {
      try {
        const next = await op();
        setCart(next);
        setError(null);
      } catch (e) {
        // The server already logs the throw; keep the cart usable and surface a
        // message instead of letting the rejection crash the page.
        setError(e instanceof Error ? e.message : "Cart operation failed.");
      }
    });
  }, []);

  const refresh = useCallback(() => run(() => getCartAction()), [run]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(
    (merchandiseId: string, quantity = 1) =>
      run(() => addLineAction(merchandiseId, quantity)),
    [run]
  );

  const updateQuantity = useCallback(
    (lineId: string, quantity: number) =>
      run(() => updateLineAction(lineId, quantity)),
    [run]
  );

  const removeItem = useCallback(
    (lineId: string) => run(() => removeLineAction(lineId)),
    [run]
  );

  const clearCart = useCallback(() => run(() => clearCartAction()), [run]);

  return (
    <CartContext.Provider
      value={{
        addItem,
        cart,
        clearCart,
        error,
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
