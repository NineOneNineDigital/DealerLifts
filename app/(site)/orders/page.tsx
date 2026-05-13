"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import {
  IconPackage,
  IconChevronDown,
  IconChevronUp,
  IconMapPin,
  IconTruck,
} from "@tabler/icons-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { PriceDisplay } from "@/components/store/PriceDisplay";

const STATUS_BADGE: Record<string, { label: string; classes: string }> = {
  pending:    { label: "Pending",    classes: "bg-yellow-100 text-yellow-800" },
  paid:       { label: "Paid",       classes: "bg-green-100 text-green-800" },
  processing: { label: "Processing", classes: "bg-blue-100 text-blue-800" },
  shipped:    { label: "Shipped",    classes: "bg-purple-100 text-purple-800" },
  delivered:  { label: "Delivered",  classes: "bg-green-100 text-green-800" },
  cancelled:  { label: "Cancelled",  classes: "bg-red-100 text-red-800" },
};

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase();
  const badge = STATUS_BADGE[key] ?? {
    label: status,
    classes: "bg-gray-100 text-gray-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${badge.classes}`}
    >
      {badge.label}
    </span>
  );
}

export default function OrdersPage() {
  const orders = useQuery(api.orders.listForUser);
  const [expandedId, setExpandedId] = useState<Id<"orders"> | null>(null);

  return (
    <div className="pt-32 md:pt-40">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold text-gray-900 md:text-3xl">
            My Orders
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View your order history and tracking details.
          </p>
        </div>

        {orders === undefined ? (
          <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-[#077BFF]" />
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
            <IconPackage size={36} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-600">
              You haven&apos;t placed any orders yet
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Once you check out, your orders will appear here.
            </p>
            <Link
              href="/store"
              className="mt-5 inline-block rounded-lg bg-[#077BFF] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0565D4]"
            >
              Browse the Store
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const isExpanded = expandedId === order._id;
              const itemCount = order.items.reduce(
                (sum, i) => sum + i.quantity,
                0,
              );
              return (
                <div
                  key={order._id}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId((prev) =>
                        prev === order._id ? null : order._id,
                      )
                    }
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-50"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-heading text-sm font-bold text-gray-900">
                          {order.orderNumber}
                        </p>
                        <StatusBadge
                          status={order.fulfillmentStatus || order.status}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {formatDate(order._creationTime)} · {itemCount}{" "}
                        {itemCount === 1 ? "item" : "items"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <PriceDisplay
                        cents={order.total}
                        className="text-sm font-semibold text-gray-900"
                      />
                      {isExpanded ? (
                        <IconChevronUp size={16} className="text-gray-400" />
                      ) : (
                        <IconChevronDown size={16} className="text-gray-400" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50 px-5 py-5">
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-4">
                          <div>
                            <h3 className="mb-2 font-heading text-xs font-bold uppercase tracking-wide text-gray-500">
                              Shipping Address
                            </h3>
                            <div className="flex items-start gap-2 text-sm text-gray-700">
                              <IconMapPin
                                size={14}
                                className="mt-0.5 shrink-0 text-gray-400"
                              />
                              <span>
                                {order.contactName}
                                <br />
                                {order.shippingAddress.street}
                                <br />
                                {order.shippingAddress.city},{" "}
                                {order.shippingAddress.state}{" "}
                                {order.shippingAddress.zip}
                              </span>
                            </div>
                          </div>

                          {order.trackingNumbers &&
                            order.trackingNumbers.length > 0 && (
                              <div>
                                <h3 className="mb-2 font-heading text-xs font-bold uppercase tracking-wide text-gray-500">
                                  Tracking
                                </h3>
                                <div className="space-y-1.5">
                                  {order.trackingNumbers.map((t, i) => (
                                    <div
                                      key={i}
                                      className="flex items-center gap-2 text-sm text-gray-700"
                                    >
                                      <IconTruck
                                        size={14}
                                        className="shrink-0 text-gray-400"
                                      />
                                      <span className="font-medium">
                                        {t.carrier}:
                                      </span>
                                      {t.trackingUrl ? (
                                        <a
                                          href={t.trackingUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-[#077BFF] hover:underline"
                                        >
                                          {t.trackingNumber}
                                        </a>
                                      ) : (
                                        <span>{t.trackingNumber}</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>

                        <div>
                          <h3 className="mb-2 font-heading text-xs font-bold uppercase tracking-wide text-gray-500">
                            Items
                          </h3>
                          <div className="space-y-2">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-2.5"
                              >
                                {item.image ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={item.image}
                                    alt={item.title}
                                    className="h-10 w-10 rounded object-cover"
                                  />
                                ) : (
                                  <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100">
                                    <IconPackage
                                      size={16}
                                      className="text-gray-400"
                                    />
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium text-gray-900">
                                    {item.title}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {item.partNumber}
                                  </p>
                                </div>
                                <div className="shrink-0 text-right">
                                  <PriceDisplay
                                    cents={item.price * item.quantity}
                                    className="text-sm font-medium text-gray-900"
                                  />
                                  <p className="text-xs text-gray-500">
                                    {item.quantity} ×{" "}
                                    <PriceDisplay
                                      cents={item.price}
                                      className="inline"
                                    />
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-3 space-y-1 border-t border-gray-200 pt-3 text-sm">
                            <div className="flex justify-between text-gray-600">
                              <span>Subtotal</span>
                              <PriceDisplay cents={order.subtotal} />
                            </div>
                            <div className="flex justify-between font-semibold text-gray-900">
                              <span>Total</span>
                              <PriceDisplay cents={order.total} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
