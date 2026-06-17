"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ProductSort } from "@/lib/store/types";

interface SortOption {
  label: string;
  value: ProductSort | "";
}

// Collections support the full ProductCollectionSortKeys set; search-based
// listings (search / brand / vehicle) only support RELEVANCE + PRICE.
const COLLECTION_OPTIONS: SortOption[] = [
  { label: "Featured", value: "" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-low" },
  { label: "Price: High to Low", value: "price-high" },
  { label: "Name: A–Z", value: "name" },
];

const SEARCH_OPTIONS: SortOption[] = [
  { label: "Relevance", value: "" },
  { label: "Price: Low to High", value: "price-low" },
  { label: "Price: High to Low", value: "price-high" },
];

export function CategorySort({
  mode = "collection",
}: {
  mode?: "collection" | "search";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const value = params.get("sort") ?? "";
  const options = mode === "search" ? SEARCH_OPTIONS : COLLECTION_OPTIONS;

  const onChange = (next: string) => {
    const params_ = new URLSearchParams(params.toString());
    if (next) {
      params_.set("sort", next);
    } else {
      params_.delete("sort");
    }
    const qs = params_.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <select
      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-700 text-sm focus:border-[#077BFF] focus:outline-none focus:ring-1 focus:ring-[#077BFF]"
      onChange={(e) => onChange(e.target.value)}
      value={value}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
