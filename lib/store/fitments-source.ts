import {
  getFitmentsForProduct as convexGetFitmentsForProduct,
  listMakes as convexListMakes,
  listModels as convexListModels,
  listProductsByVehicle as convexListProductsByVehicle,
  listYears as convexListYears,
} from "@/lib/store/fitments-convex";
import {
  getFitmentsForProduct as shopifyGetFitmentsForProduct,
  listMakes as shopifyListMakes,
  listModels as shopifyListModels,
  listProductsByVehicle as shopifyListProductsByVehicle,
  listYears as shopifyListYears,
} from "@/lib/store/fitments-shopify";
import type { StorefrontSource } from "@/lib/store/types";

function getSource(): StorefrontSource {
  const flag = process.env.STOREFRONT_SOURCE;
  return flag === "shopify" ? "shopify" : "convex";
}

export function listMakes() {
  return getSource() === "shopify" ? shopifyListMakes() : convexListMakes();
}

export function listModels(make: string) {
  return getSource() === "shopify"
    ? shopifyListModels(make)
    : convexListModels(make);
}

export function listYears(make: string, model: string) {
  return getSource() === "shopify"
    ? shopifyListYears(make, model)
    : convexListYears(make, model);
}

/**
 * `productIdentifier` is the product slug on the Shopify side and the
 * Convex product Id on the Convex side. Both come from `NormalizedProduct`:
 * Convex callers pass `.id`, Shopify callers pass `.slug`. The Phase 1a-pages
 * refactor will reconcile this so callers always pass `.slug` and the Convex
 * adapter looks up by slug internally.
 */
export function getFitmentsForProduct(productIdentifier: string) {
  return getSource() === "shopify"
    ? shopifyGetFitmentsForProduct(productIdentifier)
    : convexGetFitmentsForProduct(productIdentifier);
}

export function listProductsByVehicle(args: {
  year: number;
  make: string;
  model: string;
  limit?: number;
}) {
  return getSource() === "shopify"
    ? shopifyListProductsByVehicle(args)
    : convexListProductsByVehicle(args);
}
