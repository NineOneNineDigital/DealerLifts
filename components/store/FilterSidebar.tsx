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

export function FilterSidebar({ brands, categories, filters, onChange }: FilterSidebarProps) {
  return (
    <aside className="space-y-6">
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
          Category
        </h4>
        <ul className="space-y-1.5">
          <li>
            <button
              type="button"
              onClick={() => onChange({ ...filters, categorySlug: undefined })}
              className={`text-sm ${!filters.categorySlug ? "text-[#077BFF] font-medium" : "text-gray-600 hover:text-gray-900"}`}
            >
              All Categories
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                type="button"
                onClick={() => onChange({ ...filters, categorySlug: cat.slug })}
                className={`text-sm ${filters.categorySlug === cat.slug ? "text-[#077BFF] font-medium" : "text-gray-600 hover:text-gray-900"}`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
          Brand
        </h4>
        <ul className="space-y-1.5">
          <li>
            <button
              type="button"
              onClick={() => onChange({ ...filters, brandSlug: undefined })}
              className={`text-sm ${!filters.brandSlug ? "text-[#077BFF] font-medium" : "text-gray-600 hover:text-gray-900"}`}
            >
              All Brands
            </button>
          </li>
          {brands.map((brand) => (
            <li key={brand.id}>
              <button
                type="button"
                onClick={() => onChange({ ...filters, brandSlug: brand.slug })}
                className={`text-sm ${filters.brandSlug === brand.slug ? "text-[#077BFF] font-medium" : "text-gray-600 hover:text-gray-900"}`}
              >
                {brand.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStockOnly ?? false}
            onChange={(e) => onChange({ ...filters, inStockOnly: e.target.checked })}
            className="rounded border-gray-300 text-[#077BFF] focus:ring-[#077BFF]"
          />
          <span className="text-sm text-gray-700">In Stock Only</span>
        </label>
      </div>
    </aside>
  );
}
