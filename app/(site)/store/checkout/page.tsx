"use client";

import { useCart } from "@/hooks/useCart";
import { CheckoutForm } from "@/components/store/CheckoutForm";
import { PriceDisplay } from "@/components/store/PriceDisplay";
import Image from "next/image";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="pt-32 md:pt-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="font-heading text-2xl font-bold text-gray-900 mb-2">Cart is Empty</h1>
          <p className="text-gray-500 mb-6">Add some items before checking out.</p>
          <Link href="/store" className="text-[#077BFF] hover:underline text-sm font-medium">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 md:pt-40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/store" className="hover:text-gray-900">Store</Link>
          <span>/</span>
          <Link href="/store/cart" className="hover:text-gray-900">Cart</Link>
          <span>/</span>
          <span className="text-gray-900">Checkout</span>
        </div>

        <h1 className="font-heading text-2xl md:text-3xl font-bold text-gray-900 mb-8">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="lg:col-span-3">
            <CheckoutForm />
          </div>

          <div className="lg:col-span-2">
            <div className="bg-gray-50 rounded-xl p-6 sticky top-32">
              <h3 className="font-heading font-bold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {items.map((item) => {
                  const image = item.product?.thumbnail || item.product?.images[0];
                  const price = item.product?.mapPrice || item.product?.retailPrice || 0;
                  return (
                    <div key={item._id} className="flex gap-3">
                      <div className="relative w-12 h-12 bg-white rounded border border-gray-200 flex-shrink-0">
                        {image && (
                          <Image src={image} alt="" fill className="object-contain p-1" sizes="48px" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 line-clamp-1">{item.product?.title}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <PriceDisplay cents={price * item.quantity} className="text-sm font-medium text-gray-900" />
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-gray-200 pt-4 flex justify-between">
                <span className="font-medium text-gray-900">Total</span>
                <PriceDisplay cents={subtotal} className="text-xl font-bold text-gray-900" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
