import type { ProductSort } from "@/lib/store/types";

// Shared parsing of listing-page URL params (filters + sort), used by the
// category, search, brand, and vehicle pages.

const VALID_SORTS: ProductSort[] = [
  "newest",
  "price-low",
  "price-high",
  "name",
];

// Valid top-level `ProductFilter` keys — guards against a crafted `filter` URL
// param erroring the Storefront query.
const ALLOWED_FILTER_KEYS = new Set([
  "available",
  "price",
  "productMetafield",
  "productType",
  "productVendor",
  "tag",
  "taxonomyMetafield",
  "variantMetafield",
  "variantOption",
]);

type Param = string | string[] | undefined;

function toArray(value: Param): string[] {
  if (value == null) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

export function parseSort(value: Param): ProductSort | undefined {
  const raw = typeof value === "string" ? value : undefined;
  return VALID_SORTS.includes(raw as ProductSort)
    ? (raw as ProductSort)
    : undefined;
}

// Each `filter` param is a JSON `ProductFilter` produced by the sidebar; parse
// defensively and drop anything malformed or with unrecognized keys.
export function parseFilters(value: Param): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];
  for (const raw of toArray(value)) {
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const keys = Object.keys(parsed ?? {});
      if (
        parsed &&
        typeof parsed === "object" &&
        keys.length > 0 &&
        keys.every((k) => ALLOWED_FILTER_KEYS.has(k))
      ) {
        out.push(parsed);
      }
    } catch {
      // ignore malformed filter input
    }
  }
  return out;
}
