"use client";

import { useCart } from "@/hooks/useCart";
import { CartItem } from "@/components/store/CartItem";
import { CartSummary } from "@/components/store/CartSummary";
import Link from "next/link";

export default function CartPage() {
  const { items, itemCount, subtotal } = useCart();

  return (
    <div className="pt-32 md:pt-40">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/store" className="hover:text-gray-900">Store</Link>
          <span>/</span>
          <span className="text-gray-900">Cart</span>
        </div>

        <h1 className="font-heading text-2xl md:text-3xl font-bold text-gray-900 mb-8">
          Your Cart
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">Your cart is empty</p>
            <Link
              href="/store"
              className="text-[#077BFF] hover:underline text-sm font-medium"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-0">
            {items.map((item) =>
              item.product ? (
                <CartItem
                  key={item._id}
                  id={item._id}
                  product={item.product}
                  quantity={item.quantity}
                />
              ) : null,
            )}
            <div className="mt-6">
              <CartSummary subtotal={subtotal} itemCount={itemCount} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
