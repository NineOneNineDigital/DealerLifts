"use client";

import {
  IconAlertTriangle,
  IconBoxSeam,
  IconCar,
  IconCircleCheck,
  IconCircleX,
  IconLoader2,
  IconMinus,
  IconPackage,
  IconRefresh,
} from "@tabler/icons-react";
import { useAction, useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";

type SyncRecord = {
  _id: string;
  syncType: string;
  lastPage: number;
  totalPages?: number;
  status: string;
  lastSyncedAt?: number;
  error?: string;
};

function relativeTime(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return "just now";
  }
  if (diffMins < 60) {
    return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "complete" || status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 font-medium text-green-700 text-xs">
        <IconCircleCheck size={12} />
        Complete
      </span>
    );
  }
  if (status === "running" || status === "in_progress") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 font-medium text-blue-700 text-xs">
        <IconLoader2 className="animate-spin" size={12} />
        Running
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 font-medium text-red-700 text-xs">
        <IconCircleX size={12} />
        Error
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 font-medium text-gray-500 text-xs">
      <IconMinus size={12} />
      Idle
    </span>
  );
}

function SyncCard({ record }: { record: SyncRecord }) {
  const progress =
    record.totalPages != null && record.totalPages > 0
      ? Math.min(100, Math.round((record.lastPage / record.totalPages) * 100))
      : null;

  const displayName =
    record.syncType.charAt(0).toUpperCase() + record.syncType.slice(1);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <IconRefresh className="text-primary" size={18} />
          </div>
          <div>
            <p className="font-bold font-heading text-gray-900 text-sm">
              {displayName}
            </p>
            {record.lastSyncedAt != null ? (
              <p className="mt-0.5 text-gray-400 text-xs">
                Last synced {relativeTime(record.lastSyncedAt)}
              </p>
            ) : (
              <p className="mt-0.5 text-gray-400 text-xs">Never synced</p>
            )}
          </div>
        </div>
        <StatusBadge status={record.status} />
      </div>

      {progress !== null && (
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-gray-500 text-xs">
              Page {record.lastPage} of {record.totalPages}
            </span>
            <span className="font-medium text-gray-700 text-xs">
              {progress}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {record.error && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2">
          <IconAlertTriangle
            className="mt-0.5 shrink-0 text-red-500"
            size={14}
          />
          <p className="text-red-600 text-xs">{record.error}</p>
        </div>
      )}
    </div>
  );
}

function SyncActions() {
  const syncStates = useQuery(api.syncAdmin.list);
  const triggerProductSync = useAction(api.syncAdmin.triggerProductSync);
  const triggerInventorySync = useAction(api.syncAdmin.triggerInventorySync);
  const triggerPricingSync = useAction(api.syncAdmin.triggerPricingSync);
  const triggerFitmentSync = useAction(api.syncAdmin.triggerFitmentSync);
  const cancelSync = useMutation(api.syncAdmin.cancelSync);
  const [productSyncing, setProductSyncing] = useState(false);
  const [inventorySyncing, setInventorySyncing] = useState(false);
  const [pricingSyncing, setPricingSyncing] = useState(false);
  const [fitmentSyncing, setFitmentSyncing] = useState(false);

  const productState = syncStates?.find((s) => s.syncType === "products");
  const isRunning = productState?.status === "running";

  const handleProductSync = async () => {
    setProductSyncing(true);
    try {
      await triggerProductSync();
    } catch (err) {
      console.error("Product sync failed:", err);
    } finally {
      setProductSyncing(false);
    }
  };

  const handleCancelSync = async () => {
    await cancelSync({ syncType: "products" });
  };

  const handleInventorySync = async () => {
    setInventorySyncing(true);
    try {
      await triggerInventorySync();
    } catch (err) {
      console.error("Inventory sync failed:", err);
    } finally {
      setInventorySyncing(false);
    }
  };

  const handlePricingSync = async () => {
    setPricingSyncing(true);
    try {
      await triggerPricingSync();
    } catch (err) {
      console.error("Pricing sync failed:", err);
    } finally {
      setPricingSyncing(false);
    }
  };

  const handleFitmentSync = async () => {
    setFitmentSyncing(true);
    try {
      await triggerFitmentSync();
    } catch (err) {
      console.error("Fitment sync failed:", err);
    } finally {
      setFitmentSyncing(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {isRunning ? (
        <button
          className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 font-medium text-sm text-white transition-colors hover:bg-red-600"
          onClick={handleCancelSync}
          type="button"
        >
          <IconCircleX size={16} />
          Stop Sync
        </button>
      ) : (
        <button
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-medium text-sm text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
          disabled={productSyncing}
          onClick={handleProductSync}
          type="button"
        >
          {productSyncing ? (
            <IconLoader2 className="animate-spin" size={16} />
          ) : (
            <IconPackage size={16} />
          )}
          {productSyncing ? "Starting..." : "Sync Products"}
        </button>
      )}
      <button
        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
        disabled={pricingSyncing}
        onClick={handlePricingSync}
        type="button"
      >
        {pricingSyncing ? (
          <IconLoader2 className="animate-spin" size={16} />
        ) : (
          <IconPackage size={16} />
        )}
        {pricingSyncing ? "Starting..." : "Sync Pricing"}
      </button>
      <button
        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
        disabled={inventorySyncing}
        onClick={handleInventorySync}
        type="button"
      >
        {inventorySyncing ? (
          <IconLoader2 className="animate-spin" size={16} />
        ) : (
          <IconBoxSeam size={16} />
        )}
        {inventorySyncing ? "Starting..." : "Sync Inventory"}
      </button>
      <button
        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
        disabled={fitmentSyncing}
        onClick={handleFitmentSync}
        type="button"
      >
        {fitmentSyncing ? (
          <IconLoader2 className="animate-spin" size={16} />
        ) : (
          <IconCar size={16} />
        )}
        {fitmentSyncing ? "Starting..." : "Sync Fitments"}
      </button>
    </div>
  );
}

export default function SyncStatusPage() {
  const syncStates = useQuery(api.syncAdmin.list);

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-bold font-heading text-2xl text-gray-900">
            Sync Status
          </h1>
          <p className="mt-1 text-gray-500 text-sm">
            Monitor Turn14 data synchronization
          </p>
        </div>
        <SyncActions />
      </div>

      {syncStates === undefined ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
        </div>
      ) : syncStates.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
          <IconRefresh className="mx-auto mb-3 text-gray-300" size={32} />
          <p className="font-medium text-gray-500 text-sm">
            No sync data available
          </p>
          <p className="mt-1 text-gray-400 text-xs">
            Sync jobs will appear here once they run.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {syncStates.map((record) => (
            <SyncCard key={record._id} record={record as SyncRecord} />
          ))}
        </div>
      )}
    </div>
  );
}
