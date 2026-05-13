"use client";

import { IconCircleCheck } from "@tabler/icons-react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PriceDisplay } from "@/components/store/PriceDisplay";
import { api } from "@/convex/_generated/api";
import { useSessionId } from "@/hooks/useSessionId";

function ConfirmationSkeleton() {
  return (
    <div className="pt-32 md:pt-40">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="mx-auto h-8 w-1/3 rounded bg-gray-100" />
          <div className="h-64 rounded-xl bg-gray-100" />
          <div className="h-48 rounded-xl bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<ConfirmationSkeleton />}>
      <ConfirmationContent />
    </Suspense>
  );
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") || "";
  const sessionId = useSessionId();

  const order = useQuery(
    api.orders.getByOrderNumber,
    orderNumber && sessionId ? { orderNumber, sessionId } : "skip"
  );

  if (!orderNumber) {
    return (
      <div className="pt-32 md:pt-40">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <p className="text-gray-500">No order found.</p>
          <Link
            className="mt-4 inline-block font-medium text-[#077BFF] text-sm hover:underline"
            href="/store"
          >
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  if (!sessionId || order === undefined) {
    return <ConfirmationSkeleton />;
  }

  if (!order) {
    return (
      <div className="pt-32 md:pt-40">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <p className="text-gray-700">
            We couldn&apos;t locate that order yet — give us a moment, or
            contact{" "}
            <a
              className="text-[#077BFF] hover:underline"
              href="tel:919-275-8095"
            >
              (919) 275-8095
            </a>{" "}
            if this persists.
          </p>
          <Link
            className="mt-4 inline-block font-medium text-[#077BFF] text-sm hover:underline"
            href="/store"
          >
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  const statusLabel = (order.paymentStatus || order.status).replace(/_/g, " ");

  return (
    <div aria-live="polite" className="pt-32 md:pt-40" role="status">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <IconCircleCheck className="mx-auto mb-4 text-green-500" size={56} />
          <h1 className="mb-2 font-bold font-heading text-2xl text-gray-900 md:text-3xl">
            Order Confirmed!
          </h1>
          <p className="text-gray-500">
            Thank you for your order. We&apos;ll be in touch with shipping
            details.
          </p>
        </div>

        <div className="mb-8 rounded-xl bg-gray-50 p-6">
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div>
              <p className="mb-1 text-gray-400 text-xs uppercase tracking-wider">
                Order Number
              </p>
              <p className="font-bold font-heading text-gray-900">
                {order.orderNumber}
              </p>
            </div>
            <div>
              <p className="mb-1 text-gray-400 text-xs uppercase tracking-wider">
                Status
              </p>
              <p className="font-medium text-gray-900 capitalize">
                {statusLabel}
              </p>
            </div>
            <div>
              <p className="mb-1 text-gray-400 text-xs uppercase tracking-wider">
                Email
              </p>
              <p className="text-gray-900 text-sm">{order.contactEmail}</p>
            </div>
            <div>
              <p className="mb-1 text-gray-400 text-xs uppercase tracking-wider">
                Total
              </p>
              <PriceDisplay
                cents={order.total}
                className="font-bold text-gray-900"
              />
            </div>
          </div>

          <div className="border-gray-200 border-t pt-4">
            <p className="mb-3 text-gray-400 text-xs uppercase tracking-wider">
              Shipping Address
            </p>
            <p className="text-gray-700 text-sm">
              {order.contactName}
              <br />
              {order.shippingAddress.street}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.zip}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 font-bold font-heading text-gray-900">Items</h3>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div
                className="flex items-center justify-between border-gray-50 border-b py-2 last:border-0"
                key={`${item.partNumber}-${i}`}
              >
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {item.title}
                  </p>
                  <p className="text-gray-400 text-xs">
                    Part # {item.partNumber} &times; {item.quantity}
                  </p>
                </div>
                <PriceDisplay
                  cents={item.price * item.quantity}
                  className="font-medium text-gray-900 text-sm"
                />
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-gray-200 border-t pt-4">
            <span className="font-medium text-gray-900">Total</span>
            <PriceDisplay
              cents={order.total}
              className="font-bold text-gray-900 text-lg"
            />
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            className="inline-block rounded-lg bg-[#077BFF] px-6 py-3 font-bold font-heading text-sm text-white uppercase tracking-wider transition-colors hover:bg-[#0565D4]"
            href="/store"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
