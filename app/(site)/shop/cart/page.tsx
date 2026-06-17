"use client";

import Link from "next/link";
import { CartItem } from "@/components/store/CartItem";
import { CartSummary } from "@/components/store/CartSummary";
import { useCart } from "@/hooks/useCart";

export default function CartPage() {
  const { items, itemCount, subtotal, checkoutUrl } = useCart();

  return (
    <div className="pt-24 md:pt-28">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-2 text-gray-400 text-sm">
          <Link className="hover:text-gray-900" href="/shop">
            Shop
          </Link>
          <span>/</span>
          <span className="text-gray-900">Cart</span>
        </div>

        <h1 className="mb-8 font-bold font-heading text-2xl text-gray-900 md:text-3xl">
          Your Cart
        </h1>

        {items.length === 0 ? (
          <div className="py-16 text-center">
            <p className="mb-4 text-gray-500">Your cart is empty</p>
            <Link
              className="font-medium text-[#077BFF] text-sm hover:underline"
              href="/shop"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-0">
            {items.map((item) => (
              <CartItem item={item} key={item.id} />
            ))}
            <div className="mt-6">
              <CartSummary
                checkoutUrl={checkoutUrl}
                itemCount={itemCount}
                subtotal={subtotal}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
