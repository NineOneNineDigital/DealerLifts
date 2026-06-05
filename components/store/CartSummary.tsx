"use client";

import Link from "next/link";
import { PriceDisplay } from "./PriceDisplay";

interface CartSummaryProps {
  checkoutUrl: string | null;
  itemCount: number;
  subtotal: number;
}

export function CartSummary({
  subtotal,
  itemCount,
  checkoutUrl,
}: CartSummaryProps) {
  return (
    <div className="space-y-4 border-gray-200 border-t pt-4">
      <div className="flex items-center justify-between">
        <span className="text-gray-600 text-sm">
          Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})
        </span>
        <PriceDisplay
          cents={subtotal}
          className="font-bold text-gray-900 text-lg"
        />
      </div>
      <p className="text-gray-400 text-xs">Shipping calculated at checkout</p>
      {checkoutUrl ? (
        <a
          className="block w-full rounded-lg bg-[#077BFF] px-6 py-3 text-center font-bold font-heading text-sm text-white uppercase tracking-wider transition-colors hover:bg-[#0565D4]"
          href={checkoutUrl}
        >
          Checkout
        </a>
      ) : (
        <button
          className="block w-full cursor-not-allowed rounded-lg bg-gray-300 px-6 py-3 text-center font-bold font-heading text-sm text-white uppercase tracking-wider"
          disabled
          type="button"
        >
          Checkout
        </button>
      )}
      <Link
        className="block w-full text-center text-gray-500 text-sm transition-colors hover:text-gray-900"
        href="/shop"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
