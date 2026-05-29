"use client";

import type { NormalizedBrand, NormalizedCategory } from "@/lib/store/types";

interface FilterState {
  brandSlug?: string;
  categorySlug?: string;
  inStockOnly?: boolean;
}

interface FilterSidebarProps {
  brands: NormalizedBrand[];
  categories: NormalizedCategory[];
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export function FilterSidebar({
  brands,
  categories,
  filters,
  onChange,
}: FilterSidebarProps) {
  return (
    <aside className="space-y-6">
      <div>
        <h4 className="mb-3 font-semibold text-gray-400 text-xs uppercase tracking-wider">
          Category
        </h4>
        <ul className="space-y-1.5">
          <li>
            <button
              className={`text-sm ${filters.categorySlug ? "text-gray-600 hover:text-gray-900" : "font-medium text-[#077BFF]"}`}
              onClick={() => onChange({ ...filters, categorySlug: undefined })}
              type="button"
            >
              All Categories
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                className={`text-sm ${filters.categorySlug === cat.slug ? "font-medium text-[#077BFF]" : "text-gray-600 hover:text-gray-900"}`}
                onClick={() => onChange({ ...filters, categorySlug: cat.slug })}
                type="button"
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="mb-3 font-semibold text-gray-400 text-xs uppercase tracking-wider">
          Brand
        </h4>
        <ul className="space-y-1.5">
          <li>
            <button
              className={`text-sm ${filters.brandSlug ? "text-gray-600 hover:text-gray-900" : "font-medium text-[#077BFF]"}`}
              onClick={() => onChange({ ...filters, brandSlug: undefined })}
              type="button"
            >
              All Brands
            </button>
          </li>
          {brands.map((brand) => (
            <li key={brand.id}>
              <button
                className={`text-sm ${filters.brandSlug === brand.slug ? "font-medium text-[#077BFF]" : "text-gray-600 hover:text-gray-900"}`}
                onClick={() => onChange({ ...filters, brandSlug: brand.slug })}
                type="button"
              >
                {brand.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            checked={filters.inStockOnly ?? false}
            className="rounded border-gray-300 text-[#077BFF] focus:ring-[#077BFF]"
            onChange={(e) =>
              onChange({ ...filters, inStockOnly: e.target.checked })
            }
            type="checkbox"
          />
          <span className="text-gray-700 text-sm">In Stock Only</span>
        </label>
      </div>
    </aside>
  );
}
