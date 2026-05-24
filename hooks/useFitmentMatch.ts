"use client";

import { useQuery } from "convex/react";
import { useMemo } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useSelectedVehicle } from "@/lib/vehicle/VehicleProvider";

/**
 * Given a list of productIds, return a Set of IDs that fit the user's selected vehicle.
 * Returns an empty set when no vehicle is selected or the data is still loading.
 *
 * Use this at the render site (the grid / page) rather than per-card so we issue
 * one query per list instead of one per product.
 */
export function useFitmentMatchSet(productIds: Id<"products">[]): Set<string> {
  const { vehicle } = useSelectedVehicle();

  // Sort to stabilize the query args so duplicate renders hit the same cache key.
  const sortedIds = useMemo(
    () =>
      [...productIds].sort((a, b) => (a.toString() < b.toString() ? -1 : 1)),
    [productIds]
  );

  const matches = useQuery(
    api.fitments.filterMatchingProductIds,
    vehicle && sortedIds.length > 0
      ? {
          productIds: sortedIds,
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
        }
      : "skip"
  );

  return useMemo(() => {
    if (!matches) {
      return new Set<string>();
    }
    return new Set(matches.map((id) => id.toString()));
  }, [matches]);
}
