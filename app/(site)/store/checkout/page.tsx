"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckoutForm } from "@/components/store/CheckoutForm";
import { PriceDisplay } from "@/components/store/PriceDisplay";
import { useCart } from "@/hooks/useCart";

export default function CheckoutPage() {
  const { items, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="pt-32 md:pt-40">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h1 className="mb-2 font-bold font-heading text-2xl text-gray-900">
            Cart is Empty
          </h1>
          <p className="mb-6 text-gray-500">
            Add some items before checking out.
          </p>
          <Link
            className="font-medium text-[#077BFF] text-sm hover:underline"
            href="/store"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 md:pt-40">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-2 text-gray-400 text-sm">
          <Link className="hover:text-gray-900" href="/store">
            Store
          </Link>
          <span>/</span>
          <Link className="hover:text-gray-900" href="/store/cart">
            Cart
          </Link>
          <span>/</span>
          <span className="text-gray-900">Checkout</span>
        </div>

        <h1 className="mb-8 font-bold font-heading text-2xl text-gray-900 md:text-3xl">
          Checkout
        </h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-12">
          <div className="lg:col-span-3">
            <CheckoutForm />
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-32 rounded-xl bg-gray-50 p-6">
              <h3 className="mb-4 font-bold font-heading text-gray-900">
                Order Summary
              </h3>
              <div className="mb-4 space-y-3">
                {items.map((item) => (
                  <div className="flex gap-3" key={item.id}>
                    <div className="relative h-12 w-12 flex-shrink-0 rounded border border-gray-200 bg-white">
                      {item.productImage && (
                        <Image
                          alt=""
                          className="object-contain p-1"
                          fill
                          sizes="48px"
                          src={item.productImage}
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-gray-900 text-sm">
                        {item.productTitle}
                      </p>
                      <p className="text-gray-400 text-xs">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <PriceDisplay
                      cents={item.priceCents * item.quantity}
                      className="font-medium text-gray-900 text-sm"
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between border-gray-200 border-t pt-4">
                <span className="font-medium text-gray-900">Total</span>
                <PriceDisplay
                  cents={subtotal}
                  className="font-bold text-gray-900 text-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
