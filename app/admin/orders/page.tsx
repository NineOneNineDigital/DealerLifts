"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  IconPackage,
  IconChevronDown,
  IconChevronUp,
  IconMapPin,
  IconUser,
  IconMail,
  IconPhone,
} from "@tabler/icons-react";

type Order = {
  _id: Id<"orders">;
  _creationTime: number;
  orderNumber: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  status: string;
  items: {
    productId: Id<"products">;
    title: string;
    partNumber: string;
    price: number;
    quantity: number;
    image?: string;
  }[];
  subtotal: number;
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
};

const STATUS_TABS = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"] as const;
type StatusTab = (typeof STATUS_TABS)[number];

const STATUS_BADGE: Record<string, { label: string; classes: string }> = {
  pending:    { label: "Pending",    classes: "bg-yellow-100 text-yellow-800" },
  processing: { label: "Processing", classes: "bg-blue-100 text-blue-800" },
  shipped:    { label: "Shipped",    classes: "bg-purple-100 text-purple-800" },
  delivered:  { label: "Delivered",  classes: "bg-green-100 text-green-800" },
  cancelled:  { label: "Cancelled",  classes: "bg-red-100 text-red-800" },
};

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"];

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents);
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const badge = STATUS_BADGE[status.toLowerCase()] ?? {
    label: status,
    classes: "bg-gray-100 text-gray-700",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${badge.classes}`}>
      {badge.label}
    </span>
  );
}

function OrderRow({
  order,
  isExpanded,
  onToggle,
  onStatusChange,
}: {
  order: Order;
  isExpanded: boolean;
  onToggle: () => void;
  onStatusChange: (status: string) => void;
}) {
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <>
      <tr
        className="cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
          {order.orderNumber}
        </td>
        <td className="px-4 py-3">
          <p className="text-sm font-medium text-gray-900">{order.contactName}</p>
          <p className="text-xs text-gray-500">{order.contactEmail}</p>
        </td>
        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </td>
        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
          {formatCurrency(order.total)}
        </td>
        <td className="whitespace-nowrap px-4 py-3">
          <StatusBadge status={order.status} />
        </td>
        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
          {formatDate(order._creationTime)}
        </td>
        <td className="px-4 py-3 text-gray-400">
          {isExpanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
        </td>
      </tr>

      {isExpanded && (
        <tr>
          <td colSpan={7} className="bg-gray-50 px-4 pb-5 pt-1">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Left: contact + shipping */}
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-2 font-heading text-xs font-bold uppercase tracking-wide text-gray-500">
                      Customer
                    </h3>
                    <div className="space-y-1.5 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <IconUser size={14} className="shrink-0 text-gray-400" />
                        {order.contactName}
                      </div>
                      <div className="flex items-center gap-2">
                        <IconMail size={14} className="shrink-0 text-gray-400" />
                        {order.contactEmail}
                      </div>
                      {order.contactPhone && (
                        <div className="flex items-center gap-2">
                          <IconPhone size={14} className="shrink-0 text-gray-400" />
                          {order.contactPhone}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 font-heading text-xs font-bold uppercase tracking-wide text-gray-500">
                      Shipping Address
                    </h3>
                    <div className="flex items-start gap-2 text-sm text-gray-700">
                      <IconMapPin size={14} className="mt-0.5 shrink-0 text-gray-400" />
                      <span>
                        {order.shippingAddress.street}
                        <br />
                        {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                        {order.shippingAddress.zip}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 font-heading text-xs font-bold uppercase tracking-wide text-gray-500">
                      Update Status
                    </h3>
                    <select
                      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      value={order.status.toLowerCase()}
                      onChange={(e) => {
                        e.stopPropagation();
                        onStatusChange(e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Right: line items */}
                <div>
                  <h3 className="mb-2 font-heading text-xs font-bold uppercase tracking-wide text-gray-500">
                    Line Items
                  </h3>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 rounded-lg border border-gray-100 p-2.5"
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100">
                            <IconPackage size={16} className="text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-500">{item.partNumber}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.quantity} × {formatCurrency(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 space-y-1 border-t border-gray-100 pt-3 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>{formatCurrency(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-gray-900">
                      <span>Total</span>
                      <span>{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AdminOrdersPage() {
  const orders = useQuery(api.ordersAdmin.list);
  const updateStatus = useMutation(api.ordersAdmin.updateStatus);

  const [activeTab, setActiveTab] = useState<StatusTab>("All");
  const [expandedId, setExpandedId] = useState<Id<"orders"> | null>(null);

  const filteredOrders =
    orders === undefined
      ? undefined
      : activeTab === "All"
      ? orders
      : orders.filter(
          (o) => o.status.toLowerCase() === activeTab.toLowerCase(),
        );

  function handleToggle(id: Id<"orders">) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  async function handleStatusChange(id: Id<"orders">, status: string) {
    await updateStatus({ id, status });
  }

  return (
    <div className="mx-auto max-w-7xl p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-gray-900">Orders</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage and track customer orders.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="mb-5 flex gap-1 rounded-xl border border-gray-200 bg-white p-1 w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setExpandedId(null);
            }}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-primary text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab}
            {orders !== undefined && (
              <span className={`ml-1.5 text-xs ${activeTab === tab ? "opacity-80" : "text-gray-400"}`}>
                {tab === "All"
                  ? orders.length
                  : orders.filter((o) => o.status.toLowerCase() === tab.toLowerCase()).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {filteredOrders === undefined ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center">
            <IconPackage size={36} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-600">No orders found</p>
            <p className="mt-1 text-xs text-gray-400">
              {activeTab === "All"
                ? "Orders will appear here once customers check out."
                : `No ${activeTab.toLowerCase()} orders at the moment.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Order
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Items
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Total
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Date
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <OrderRow
                    key={order._id}
                    order={order as Order}
                    isExpanded={expandedId === order._id}
                    onToggle={() => handleToggle(order._id)}
                    onStatusChange={(status) => handleStatusChange(order._id, status)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
