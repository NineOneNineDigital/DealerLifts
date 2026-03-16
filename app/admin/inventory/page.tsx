"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  IconBoxSeam,
  IconCircleCheck,
  IconAlertTriangle,
  IconCircleX,
  IconPackage,
} from "@tabler/icons-react";

type FilterValue = "all" | "in_stock" | "low_stock" | "out_of_stock";

const FILTER_TABS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "in_stock", label: "In Stock" },
  { value: "low_stock", label: "Low Stock" },
  { value: "out_of_stock", label: "Out of Stock" },
];

function getStockStatus(totalStock: number, isInStock: boolean) {
  if (!isInStock || totalStock === 0) return "out_of_stock" as const;
  if (totalStock <= 5) return "low_stock" as const;
  return "in_stock" as const;
}

function StockBadge({
  totalStock,
  isInStock,
}: {
  totalStock: number;
  isInStock: boolean;
}) {
  const status = getStockStatus(totalStock, isInStock);

  const config = {
    in_stock: {
      className: "bg-green-100 text-green-800",
      icon: IconCircleCheck,
      label: "In Stock",
    },
    low_stock: {
      className: "bg-yellow-100 text-yellow-800",
      icon: IconAlertTriangle,
      label: "Low Stock",
    },
    out_of_stock: {
      className: "bg-red-100 text-red-800",
      icon: IconCircleX,
      label: "Out of Stock",
    },
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${config.className}`}
    >
      <config.icon size={10} />
      {config.label}
    </span>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
  activeFilter,
  filter,
  onSelect,
}: {
  label: string;
  value: number | undefined;
  icon: React.ElementType;
  color: string;
  activeFilter: FilterValue;
  filter: FilterValue;
  onSelect: (filter: FilterValue) => void;
}) {
  const isActive = activeFilter === filter;
  return (
    <button
      type="button"
      onClick={() => onSelect(filter)}
      className={`flex items-center gap-4 rounded-xl border p-5 text-left transition-all hover:shadow-md ${
        isActive
          ? "border-primary/30 bg-primary/5 shadow-sm"
          : "border-gray-200 bg-white"
      }`}
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${color}`}
      >
        <Icon size={22} className="text-white" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-heading text-2xl font-bold text-gray-900">
          {value === undefined ? "–" : value}
        </p>
      </div>
    </button>
  );
}

export default function AdminInventoryPage() {
  const [filter, setFilter] = useState<FilterValue>("all");

  const inventory = useQuery(api.inventoryAdmin.list, { filter });
  const summaryData = useQuery(api.inventoryAdmin.summary);

  return (
    <div className="mx-auto max-w-6xl p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-gray-900">
          Inventory
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor stock levels across all products.
        </p>
      </div>

      {/* Summary cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard
          label="Total Products"
          value={summaryData?.totalProducts}
          icon={IconBoxSeam}
          color="bg-gray-500"
          filter="all"
          activeFilter={filter}
          onSelect={setFilter}
        />
        <SummaryCard
          label="In Stock"
          value={summaryData?.inStock}
          icon={IconCircleCheck}
          color="bg-green-500"
          filter="in_stock"
          activeFilter={filter}
          onSelect={setFilter}
        />
        <SummaryCard
          label="Low Stock"
          value={summaryData?.lowStock}
          icon={IconAlertTriangle}
          color="bg-yellow-500"
          filter="low_stock"
          activeFilter={filter}
          onSelect={setFilter}
        />
        <SummaryCard
          label="Out of Stock"
          value={summaryData?.outOfStock}
          icon={IconCircleX}
          color="bg-red-500"
          filter="out_of_stock"
          activeFilter={filter}
          onSelect={setFilter}
        />
      </div>

      {/* Table card */}
      <div className="rounded-xl border border-gray-200 bg-white">
        {/* Filter tabs */}
        <div className="flex border-b border-gray-200">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilter(tab.value)}
              className={`px-5 py-3 text-sm font-semibold transition-colors ${
                filter === tab.value
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {inventory === undefined && (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
          </div>
        )}

        {/* Empty state */}
        {inventory !== undefined && inventory.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <IconPackage size={40} className="mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">
              No inventory records found
            </p>
            <p className="mt-1 text-xs text-gray-400">
              {filter === "all"
                ? "No products have been synced yet."
                : `No products match the "${FILTER_TABS.find((t) => t.value === filter)?.label}" filter.`}
            </p>
          </div>
        )}

        {/* Table */}
        {inventory !== undefined && inventory.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Part Number</th>
                  <th className="px-5 py-3 text-right">Stock</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inventory.map((item) => {
                  const status = getStockStatus(item.totalStock, item.isInStock);
                  return (
                    <tr
                      key={item._id}
                      className="transition-colors hover:bg-gray-50"
                    >
                      {/* Product */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 shrink-0 overflow-hidden rounded-md border border-gray-100 bg-gray-50">
                            {item.thumbnail ? (
                              <Image
                                src={item.thumbnail}
                                alt={item.title}
                                width={32}
                                height={32}
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <IconPackage size={14} className="text-gray-300" />
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-gray-900 line-clamp-1">
                            {item.title}
                          </span>
                        </div>
                      </td>

                      {/* Part number */}
                      <td className="px-5 py-3 font-mono text-xs text-gray-500">
                        {item.partNumber}
                      </td>

                      {/* Stock count */}
                      <td className="px-5 py-3 text-right">
                        <span
                          className={`font-semibold tabular-nums ${
                            status === "out_of_stock"
                              ? "text-red-600"
                              : status === "low_stock"
                                ? "text-yellow-600"
                                : "text-gray-900"
                          }`}
                        >
                          {item.totalStock}
                        </span>
                      </td>

                      {/* Status badge */}
                      <td className="px-5 py-3">
                        <StockBadge
                          totalStock={item.totalStock}
                          isInStock={item.isInStock}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
