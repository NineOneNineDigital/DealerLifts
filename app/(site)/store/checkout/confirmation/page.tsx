"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PriceDisplay } from "@/components/store/PriceDisplay";
import Link from "next/link";
import { IconCircleCheck } from "@tabler/icons-react";

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="pt-32 md:pt-40"><div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center"><p className="text-gray-400">Loading...</p></div></div>}>
      <ConfirmationContent />
    </Suspense>
  );
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") || "";
  const order = useQuery(
    api.orders.getByOrderNumber,
    orderNumber ? { orderNumber } : "skip",
  );

  if (!orderNumber) {
    return (
      <div className="pt-32 md:pt-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-gray-500">No order found.</p>
          <Link href="/store" className="text-[#077BFF] hover:underline text-sm font-medium mt-4 inline-block">
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  if (order === undefined) {
    return (
      <div className="pt-32 md:pt-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-gray-400">Loading order...</p>
        </div>
      </div>
    );
  }

  if (order === null) {
    return (
      <div className="pt-32 md:pt-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-gray-500">Order not found.</p>
          <Link href="/store" className="text-[#077BFF] hover:underline text-sm font-medium mt-4 inline-block">
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 md:pt-40">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-10">
          <IconCircleCheck size={56} className="mx-auto text-green-500 mb-4" />
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-gray-500">
            Thank you for your order. We&apos;ll be in touch with shipping details.
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Order Number</p>
              <p className="font-heading font-bold text-gray-900">{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Status</p>
              <p className="font-medium text-gray-900 capitalize">{order.status}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Email</p>
              <p className="text-sm text-gray-900">{order.contactEmail}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total</p>
              <PriceDisplay cents={order.total} className="font-bold text-gray-900" />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Shipping Address</p>
            <p className="text-sm text-gray-700">
              {order.contactName}<br />
              {order.shippingAddress.street}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-heading font-bold text-gray-900 mb-4">Items</h3>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-400">Part # {item.partNumber} &times; {item.quantity}</p>
                </div>
                <PriceDisplay cents={item.price * item.quantity} className="text-sm font-medium text-gray-900" />
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-4 mt-4 flex justify-between">
            <span className="font-medium text-gray-900">Total</span>
            <PriceDisplay cents={order.total} className="text-lg font-bold text-gray-900" />
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            href="/store"
            className="inline-block px-6 py-3 bg-[#077BFF] text-white font-heading font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-[#0565D4] transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
