"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import {
  IconShoppingCart,
  IconClock,
  IconTruckDelivery,
  IconAlertTriangle,
  IconArrowRight,
  IconBoxSeam,
} from "@tabler/icons-react";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents);
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  href,
}: {
  label: string;
  value: number | undefined;
  icon: React.ElementType;
  color: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-heading text-2xl font-bold text-gray-900">
          {value === undefined ? "–" : value}
        </p>
      </div>
      <IconArrowRight size={16} className="text-gray-300" />
    </Link>
  );
}

export default function AdminDashboardPage() {
  const { user } = useUser();
  const orders = useQuery(api.ordersAdmin.list);
  const inventorySummary = useQuery(api.inventoryAdmin.summary);

  const pendingOrders = orders?.filter((o) => o.status === "pending").length;
  const processingOrders = orders?.filter((o) => o.status === "processing").length;
  const lowStockCount =
    inventorySummary && inventorySummary.lowStock + inventorySummary.outOfStock;

  const recentOrders = orders?.slice(0, 5);
  const firstName = user?.firstName || "Admin";

  return (
    <div className="mx-auto max-w-4xl p-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-gray-900">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here's a snapshot of orders and inventory.
        </p>
      </div>

      {/* Stats grid */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Pending Orders"
          value={pendingOrders}
          icon={IconClock}
          color="bg-yellow-500"
          href="/admin/orders"
        />
        <StatCard
          label="Processing"
          value={processingOrders}
          icon={IconTruckDelivery}
          color="bg-blue-500"
          href="/admin/orders"
        />
        <StatCard
          label="Low / Out of Stock"
          value={lowStockCount}
          icon={IconAlertTriangle}
          color="bg-red-500"
          href="/admin/inventory"
        />
      </div>

      {/* Recent orders */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="font-heading text-sm font-bold text-gray-900">
            Recent Orders
          </h2>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            View all
            <IconArrowRight size={12} />
          </Link>
        </div>

        {orders === undefined ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
          </div>
        ) : recentOrders?.length === 0 ? (
          <div className="py-12 text-center">
            <IconShoppingCart size={32} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-500">No orders yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentOrders?.map((order) => (
              <Link
                key={order._id}
                href="/admin/orders"
                className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-gray-50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {order.contactName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </p>
                    <span className="text-xs font-medium text-gray-600">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                  <p className="truncate text-xs text-gray-500">
                    {order.contactName} &middot;{" "}
                    <span className="capitalize">{order.status}</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/admin/orders"
          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
        >
          <IconShoppingCart size={20} className="text-primary" />
          <div>
            <p className="text-sm font-medium text-gray-900">Manage Orders</p>
            <p className="text-xs text-gray-500">Update status and fulfillment</p>
          </div>
        </Link>
        <Link
          href="/admin/inventory"
          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
        >
          <IconBoxSeam size={20} className="text-primary" />
          <div>
            <p className="text-sm font-medium text-gray-900">Check Inventory</p>
            <p className="text-xs text-gray-500">Review stock levels by product</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
