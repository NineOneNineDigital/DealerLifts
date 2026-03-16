"use client";

import Link from "next/link";
import { PriceDisplay } from "./PriceDisplay";

interface CartSummaryProps {
  subtotal: number;
  itemCount: number;
}

export function CartSummary({ subtotal, itemCount }: CartSummaryProps) {
  return (
    <div className="border-t border-gray-200 pt-4 space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">
          Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})
        </span>
        <PriceDisplay cents={subtotal} className="text-lg font-bold text-gray-900" />
      </div>
      <p className="text-xs text-gray-400">Shipping calculated at checkout</p>
      <Link
        href="/store/checkout"
        className="block w-full text-center px-6 py-3 bg-[#077BFF] text-white font-heading font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-[#0565D4] transition-colors"
      >
        Checkout
      </Link>
      <Link
        href="/store"
        className="block w-full text-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
