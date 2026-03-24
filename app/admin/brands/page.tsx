"use client";

import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  IconSearch,
  IconRefresh,
  IconLoader2,
  IconBuildingStore,
  IconCheck,
} from "@tabler/icons-react";

type SyncBrand = {
  _id: Id<"syncBrands">;
  turn14BrandId: number;
  brandName: string;
  isEnabled: boolean;
};

type Turn14Brand = {
  id: number;
  name: string;
};

export default function AdminBrandsPage() {
  const syncBrands = useQuery(api.syncBrands.list);
  const addBrand = useMutation(api.syncBrands.add);
  const toggleBrand = useMutation(api.syncBrands.toggle);
  const removeBrand = useMutation(api.syncBrands.remove);
  const fetchTurn14Brands = useAction(api.turn14.discoverBrands.fetchAll);

  const [turn14Brands, setTurn14Brands] = useState<Turn14Brand[] | null>(null);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState<Set<number>>(new Set());

  const handleFetchBrands = async () => {
    setFetching(true);
    setFetchError(null);
    try {
      const brands = await fetchTurn14Brands();
      setTurn14Brands(brands);
    } catch (err) {
      setFetchError(
        err instanceof Error ? err.message : "Failed to fetch brands",
      );
    } finally {
      setFetching(false);
    }
  };

  const handleAddBrand = async (brand: Turn14Brand) => {
    setAdding((prev) => new Set(prev).add(brand.id));
    try {
      await addBrand({
        turn14BrandId: brand.id,
        brandName: brand.name,
      });
    } finally {
      setAdding((prev) => {
        const next = new Set(prev);
        next.delete(brand.id);
        return next;
      });
    }
  };

  const enabledIds = new Set(
    (syncBrands as SyncBrand[] | undefined)
      ?.filter((b) => b.isEnabled)
      .map((b) => b.turn14BrandId) ?? [],
  );
  const allSyncIds = new Set(
    (syncBrands as SyncBrand[] | undefined)?.map((b) => b.turn14BrandId) ?? [],
  );

  const filteredTurn14 = turn14Brands?.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()),
  );

  const enabledCount =
    (syncBrands as SyncBrand[] | undefined)?.filter((b) => b.isEnabled)
      .length ?? 0;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-5">
        <h1 className="font-heading text-2xl font-bold text-gray-900">
          Brands
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Select which Turn14 brands to sync. Only enabled brands will be
          included in the product sync.
        </p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Enabled brands section */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-heading text-lg font-bold text-gray-900">
                  Enabled Brands
                </h2>
                <p className="text-xs text-gray-400">
                  {enabledCount} brand{enabledCount !== 1 ? "s" : ""} will sync
                </p>
              </div>
            </div>

            {syncBrands === undefined ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
              </div>
            ) : (syncBrands as SyncBrand[]).length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white py-10 text-center">
                <IconBuildingStore
                  size={32}
                  className="mx-auto mb-2 text-gray-300"
                />
                <p className="text-sm text-gray-500">No brands added yet</p>
                <p className="mt-1 text-xs text-gray-400">
                  Fetch brands from Turn14 below to get started
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {(syncBrands as SyncBrand[]).map((brand) => (
                  <div
                    key={brand._id}
                    className={`flex items-center justify-between rounded-lg border px-4 py-3 transition-colors ${
                      brand.isEnabled
                        ? "border-primary/20 bg-primary/5"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {brand.brandName}
                      </p>
                      <p className="text-xs text-gray-400">
                        ID: {brand.turn14BrandId}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={brand.isEnabled}
                        aria-label={`Toggle sync for ${brand.brandName}`}
                        onClick={() =>
                          toggleBrand({
                            id: brand._id,
                            isEnabled: !brand.isEnabled,
                          })
                        }
                        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none ${
                          brand.isEnabled ? "bg-primary" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            brand.isEnabled
                              ? "translate-x-4"
                              : "translate-x-0"
                          }`}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeBrand({ id: brand._id })}
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove brand"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Turn14 brand picker */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-heading text-lg font-bold text-gray-900">
                  Turn14 Brand Catalog
                </h2>
                <p className="text-xs text-gray-400">
                  Browse all available brands from Turn14
                </p>
              </div>
              <button
                type="button"
                onClick={handleFetchBrands}
                disabled={fetching}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {fetching ? (
                  <IconLoader2 size={15} className="animate-spin" />
                ) : (
                  <IconRefresh size={15} />
                )}
                {fetching
                  ? "Fetching..."
                  : turn14Brands
                    ? "Refresh"
                    : "Fetch Brands"}
              </button>
            </div>

            {fetchError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-600">{fetchError}</p>
                <p className="mt-1 text-xs text-red-400">
                  Make sure your Turn14 API credentials are configured in Convex
                  environment variables.
                </p>
              </div>
            )}

            {turn14Brands && (
              <>
                {/* Search */}
                <div className="relative mb-4">
                  <IconSearch
                    size={16}
                    className="pointer-events-none absolute inset-y-0 left-3 my-auto text-gray-400"
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={`Search ${turn14Brands.length} brands...`}
                    className="w-full rounded-lg border border-gray-300 py-2 pr-3 pl-9 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>

                {/* Brand grid */}
                <div className="max-h-[480px] overflow-auto rounded-xl border border-gray-200 bg-white">
                  {filteredTurn14 && filteredTurn14.length === 0 ? (
                    <div className="py-10 text-center">
                      <p className="text-sm text-gray-500">
                        No brands match &quot;{search}&quot;
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {filteredTurn14?.map((brand) => {
                        const isAdded = allSyncIds.has(brand.id);
                        const isEnabled = enabledIds.has(brand.id);
                        const isAdding = adding.has(brand.id);

                        return (
                          <div
                            key={brand.id}
                            className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors"
                          >
                            <div className="min-w-0 flex-1">
                              <span className="text-sm text-gray-900">
                                {brand.name}
                              </span>
                              <span className="ml-2 text-xs text-gray-400">
                                #{brand.id}
                              </span>
                            </div>

                            {isAdded ? (
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  isEnabled
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                <IconCheck size={12} />
                                {isEnabled ? "Enabled" : "Disabled"}
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleAddBrand(brand)}
                                disabled={isAdding}
                                className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary disabled:opacity-50"
                              >
                                {isAdding ? "Adding..." : "Add"}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <p className="mt-2 text-xs text-gray-400">
                  {turn14Brands.length} total brands available
                </p>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
