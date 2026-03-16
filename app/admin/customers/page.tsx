"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  IconSearch,
  IconUsers,
  IconChevronDown,
  IconChevronUp,
  IconShoppingCart,
  IconMessageCircle,
  IconClock,
  IconCircleCheck,
} from "@tabler/icons-react";

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(cents: number) {
  return `$${cents.toFixed(2)}`;
}

function OrderStatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };
  const classes = config[status] ?? "bg-gray-100 text-gray-600";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${classes}`}
    >
      {status}
    </span>
  );
}

function ChatStatusBadge({ status }: { status: "pending" | "active" | "closed" }) {
  const config = {
    pending: { classes: "bg-yellow-100 text-yellow-800", Icon: IconClock },
    active: { classes: "bg-green-100 text-green-800", Icon: IconMessageCircle },
    closed: { classes: "bg-gray-100 text-gray-600", Icon: IconCircleCheck },
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${config.classes}`}
    >
      <config.Icon size={10} />
      {status}
    </span>
  );
}

function AvatarCircle({ name, email }: { name?: string; email: string }) {
  const letter = (name ?? email).charAt(0).toUpperCase();
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
      {letter}
    </div>
  );
}

function ExpandedCustomer({ id }: { id: Id<"users"> }) {
  const data = useQuery(api.customersAdmin.getById, { id });

  if (data === undefined) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <p className="px-5 py-4 text-sm text-gray-400">Customer not found.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-0 border-t border-gray-100 bg-gray-50 px-5 py-4 sm:grid-cols-2 sm:gap-6">
      {/* Orders */}
      <div>
        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
          <IconShoppingCart size={12} />
          Orders ({data.orders.length})
        </h3>
        {data.orders.length === 0 ? (
          <p className="text-xs text-gray-400">No orders yet.</p>
        ) : (
          <div className="space-y-1.5">
            {data.orders.map((order) => (
              <div
                key={order._id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {order.orderNumber}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(order._creationTime)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    {formatCurrency(order.total)}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat conversations */}
      <div className="mt-4 sm:mt-0">
        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
          <IconMessageCircle size={12} />
          Chats ({data.chats.length})
        </h3>
        {data.chats.length === 0 ? (
          <p className="text-xs text-gray-400">No conversations yet.</p>
        ) : (
          <div className="space-y-1.5">
            {data.chats.map((chat) => (
              <div
                key={chat._id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {chat.customerName}
                  </p>
                  {chat.lastMessagePreview && (
                    <p className="truncate text-xs text-gray-400">
                      {chat.lastMessagePreview}
                    </p>
                  )}
                </div>
                <div className="ml-2 shrink-0">
                  <ChatStatusBadge status={chat.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminCustomersPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [expandedId, setExpandedId] = useState<Id<"users"> | null>(null);

  // Simple debounce via controlled state update on blur / onChange
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setDebouncedSearch(value);
  };

  const customers = useQuery(api.customersAdmin.list, {
    search: debouncedSearch || undefined,
  });

  const toggleExpand = (id: Id<"users">) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="mx-auto max-w-5xl p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-gray-900">
          Customers
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Registered users, their orders, and support conversations.
        </p>
      </div>

      {/* Search + summary */}
      <div className="mb-4 flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <IconSearch
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
          />
        </div>
        {customers !== undefined && (
          <p className="text-sm text-gray-500">
            {customers.length} {customers.length === 1 ? "customer" : "customers"}
          </p>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white">
        {/* Loading */}
        {customers === undefined && (
          <div className="flex items-center justify-center py-16">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
          </div>
        )}

        {/* Empty */}
        {customers !== undefined && customers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <IconUsers size={36} className="mb-2 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">No customers found</p>
            {debouncedSearch && (
              <p className="mt-1 text-xs text-gray-400">
                Try a different search term.
              </p>
            )}
          </div>
        )}

        {/* Rows */}
        {customers !== undefined && customers.length > 0 && (
          <div className="divide-y divide-gray-100">
            {/* Column header */}
            <div className="grid grid-cols-[auto_1fr_1fr_auto_auto_auto] items-center gap-4 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              <div className="w-9" />
              <div>Name</div>
              <div>Email / Phone</div>
              <div className="text-center">Orders</div>
              <div className="text-center">Chats</div>
              <div className="w-5" />
            </div>

            {customers.map((customer) => {
              const isExpanded = expandedId === customer._id;
              return (
                <div key={customer._id}>
                  <button
                    type="button"
                    onClick={() => toggleExpand(customer._id)}
                    className="grid w-full grid-cols-[auto_1fr_1fr_auto_auto_auto] items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-gray-50"
                  >
                    <AvatarCircle name={customer.name} email={customer.email} />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {customer.name ?? "—"}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm text-gray-600">
                        {customer.email}
                      </p>
                      <p className="text-xs text-gray-400">
                        {customer.phone ?? "—"}
                      </p>
                    </div>

                    <div className="flex justify-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                        <IconShoppingCart size={11} />
                        {customer.orderCount}
                      </span>
                    </div>

                    <div className="flex justify-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                        <IconMessageCircle size={11} />
                        {customer.chatCount}
                      </span>
                    </div>

                    <div className="text-gray-400">
                      {isExpanded ? (
                        <IconChevronUp size={16} />
                      ) : (
                        <IconChevronDown size={16} />
                      )}
                    </div>
                  </button>

                  {isExpanded && <ExpandedCustomer id={customer._id} />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
