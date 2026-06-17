"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { vehicleTagPrefix } from "@/lib/store/fitments";
import type { StoreFacet } from "@/lib/store/types";
import { useSelectedVehicle } from "@/lib/vehicle/VehicleProvider";

interface CategoryFiltersProps {
  /** Show the "Fits my vehicle" toggle (only the category page honors `?fit=`). */
  enableVehicleFilter?: boolean;
  facets: StoreFacet[];
}

function parsePriceBounds(input: string): { min?: number; max?: number } {
  try {
    const parsed = JSON.parse(input) as {
      price?: { min?: number; max?: number };
    };
    return parsed.price ?? {};
  } catch {
    return {};
  }
}

function isPriceFilter(input: string): boolean {
  try {
    return "price" in (JSON.parse(input) as Record<string, unknown>);
  } catch {
    return false;
  }
}

// Above this many values a facet (e.g. Brand) collapses behind "Show all".
const FACET_COLLAPSE_THRESHOLD = 8;

function FacetGroup({
  facet,
  activeFilters,
  onToggle,
}: {
  activeFilters: string[];
  facet: StoreFacet;
  onToggle: (input: string, checked: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  // Drop empty buckets, but keep any value that's currently selected so it can
  // still be unchecked.
  const values = facet.values.filter(
    (v) => v.count > 0 || activeFilters.includes(v.input)
  );
  if (values.length === 0) {
    return null;
  }
  const collapsible = values.length > FACET_COLLAPSE_THRESHOLD;
  const shown =
    collapsible && !expanded
      ? values.slice(0, FACET_COLLAPSE_THRESHOLD)
      : values;

  return (
    <div>
      <h4 className="mb-3 font-semibold text-gray-400 text-xs uppercase tracking-wider">
        {facet.label}
      </h4>
      <ul
        className={`space-y-1.5 ${expanded ? "max-h-64 overflow-y-auto pr-1" : ""}`}
      >
        {shown.map((value) => (
          <li key={value.id}>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                checked={activeFilters.includes(value.input)}
                className="rounded border-gray-300 text-[#077BFF] focus:ring-[#077BFF]"
                onChange={(e) => onToggle(value.input, e.target.checked)}
                type="checkbox"
              />
              <span className="text-gray-700 text-sm">
                {value.label}
                <span className="ml-1 text-gray-400">({value.count})</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
      {collapsible ? (
        <button
          className="mt-2 text-[#077BFF] text-xs hover:underline"
          onClick={() => setExpanded((v) => !v)}
          type="button"
        >
          {expanded ? "Show less" : `Show all ${values.length}`}
        </button>
      ) : null}
    </div>
  );
}

export function CategoryFilters({
  enableVehicleFilter = false,
  facets,
}: CategoryFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { vehicle } = useSelectedVehicle();

  const activeFilters = params.getAll("filter");
  const activePrice = activeFilters.find(isPriceFilter);
  const priceSeed = activePrice ? parsePriceBounds(activePrice) : {};
  const [minPrice, setMinPrice] = useState(
    priceSeed.min != null ? String(priceSeed.min) : ""
  );
  const [maxPrice, setMaxPrice] = useState(
    priceSeed.max != null ? String(priceSeed.max) : ""
  );

  const commit = (next: URLSearchParams) => {
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  // Rebuild the param list, replacing every `filter` entry that matches `match`.
  const replaceFilters = (
    keep: (input: string) => boolean,
    add: string[]
  ): URLSearchParams => {
    const next = new URLSearchParams(params.toString());
    const remaining = next.getAll("filter").filter(keep);
    next.delete("filter");
    for (const f of [...remaining, ...add]) {
      next.append("filter", f);
    }
    return next;
  };

  const toggleValue = (input: string, checked: boolean) => {
    commit(replaceFilters((f) => f !== input, checked ? [input] : []));
  };

  const applyPrice = () => {
    const min = minPrice.trim() === "" ? undefined : Number(minPrice);
    const max = maxPrice.trim() === "" ? undefined : Number(maxPrice);
    const price: Record<string, number> = {};
    if (min != null && Number.isFinite(min)) {
      price.min = min;
    }
    if (max != null && Number.isFinite(max)) {
      price.max = max;
    }
    const add =
      Object.keys(price).length > 0 ? [JSON.stringify({ price })] : [];
    commit(replaceFilters((f) => !isPriceFilter(f), add));
  };

  const toggleVehicle = (checked: boolean) => {
    const next = new URLSearchParams(params.toString());
    if (checked && vehicle) {
      next.set(
        "fit",
        vehicleTagPrefix(
          vehicle.year,
          vehicle.make,
          vehicle.model,
          vehicle.submodel
        )
      );
    } else {
      next.delete("fit");
    }
    commit(next);
  };

  const clearAll = () => {
    const next = new URLSearchParams();
    const sort = params.get("sort");
    if (sort) {
      next.set("sort", sort);
    }
    commit(next);
  };

  const hasActive = activeFilters.length > 0 || params.has("fit");
  const listFacets = facets.filter(
    (f) => f.type === "LIST" && f.values.length > 0
  );
  const priceFacet = facets.find((f) => f.type === "PRICE_RANGE");
  const priceBounds = priceFacet?.values[0]
    ? parsePriceBounds(priceFacet.values[0].input)
    : {};

  return (
    <aside className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-sm">Filters</h3>
        {hasActive ? (
          <button
            className="text-[#077BFF] text-xs hover:underline"
            onClick={clearAll}
            type="button"
          >
            Clear all
          </button>
        ) : null}
      </div>

      {/* Vehicle fit — only when enabled (category page) and a vehicle is saved */}
      {enableVehicleFilter && vehicle ? (
        <div>
          <h4 className="mb-3 font-semibold text-gray-400 text-xs uppercase tracking-wider">
            Vehicle
          </h4>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              checked={params.has("fit")}
              className="rounded border-gray-300 text-[#077BFF] focus:ring-[#077BFF]"
              onChange={(e) => toggleVehicle(e.target.checked)}
              type="checkbox"
            />
            <span className="text-gray-700 text-sm">
              Fits my {vehicle.year} {vehicle.make} {vehicle.model}
            </span>
          </label>
        </div>
      ) : null}

      {/* LIST facets — Availability today; Brand/Type appear once enabled in admin */}
      {listFacets.map((facet) => (
        <FacetGroup
          activeFilters={activeFilters}
          facet={facet}
          key={facet.id}
          onToggle={toggleValue}
        />
      ))}

      {/* Price range */}
      {priceFacet ? (
        <div>
          <h4 className="mb-3 font-semibold text-gray-400 text-xs uppercase tracking-wider">
            Price
          </h4>
          <div className="flex items-center gap-2">
            <input
              className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF]"
              inputMode="numeric"
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder={
                priceBounds.min != null
                  ? `$${Math.floor(priceBounds.min)}`
                  : "Min"
              }
              value={minPrice}
            />
            <span className="text-gray-400">–</span>
            <input
              className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF]"
              inputMode="numeric"
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder={
                priceBounds.max != null
                  ? `$${Math.ceil(priceBounds.max)}`
                  : "Max"
              }
              value={maxPrice}
            />
          </div>
          <button
            className="mt-2 w-full rounded-lg border border-gray-300 py-1.5 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-50"
            onClick={applyPrice}
            type="button"
          >
            Apply
          </button>
        </div>
      ) : null}
    </aside>
  );
}
