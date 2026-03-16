"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  IconSearch,
  IconPackage,
  IconDeviceFloppy,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";

type ProductRow = {
  _id: Id<"products">;
  title: string;
  partNumber: string;
  thumbnail?: string;
  images: string[];
  description?: string;
  mapPrice?: number;
  retailPrice?: number;
  isActive: boolean;
  isFeatured?: boolean;
  brandName: string | null;
};

function formatCurrency(value: number | undefined) {
  if (value === undefined || value === null) return "–";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none ${
        checked ? "bg-primary" : "bg-gray-200"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  );
}

function ExpandedRow({
  product,
  onClose,
}: {
  product: ProductRow;
  onClose: () => void;
}) {
  const updatePricing = useMutation(api.productsAdmin.updatePricing);

  const [mapPrice, setMapPrice] = useState(
    product.mapPrice !== undefined ? String(product.mapPrice) : "",
  );
  const [retailPrice, setRetailPrice] = useState(
    product.retailPrice !== undefined ? String(product.retailPrice) : "",
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const patch: { id: Id<"products">; mapPrice?: number; retailPrice?: number } =
      { id: product._id };

    const parsedMap = parseFloat(mapPrice);
    const parsedRetail = parseFloat(retailPrice);

    if (!Number.isNaN(parsedMap)) patch.mapPrice = parsedMap;
    if (!Number.isNaN(parsedRetail)) patch.retailPrice = parsedRetail;

    await updatePricing(patch);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <tr>
      <td colSpan={8} className="bg-gray-50 px-6 py-5">
        <div className="space-y-4">
          {/* Description */}
          {product.description && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Description
              </p>
              <p className="text-sm leading-relaxed text-gray-700">
                {product.description}
              </p>
            </div>
          )}

          {/* Images */}
          {product.images.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Images ({product.images.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {product.images.map((src, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: image list has no stable key
                  <div
                    key={i}
                    className="h-16 w-16 overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
                  >
                    <img
                      src={src}
                      alt={`${product.title} image ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing editor */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Edit Pricing
            </p>
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label
                  htmlFor={`map-${product._id}`}
                  className="mb-1 block text-xs font-medium text-gray-600"
                >
                  MAP Price
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-sm text-gray-400">
                    $
                  </span>
                  <input
                    id={`map-${product._id}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={mapPrice}
                    onChange={(e) => setMapPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-32 rounded-lg border border-gray-300 py-1.5 pr-3 pl-6 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor={`retail-${product._id}`}
                  className="mb-1 block text-xs font-medium text-gray-600"
                >
                  Retail Price
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-sm text-gray-400">
                    $
                  </span>
                  <input
                    id={`retail-${product._id}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-32 rounded-lg border border-gray-300 py-1.5 pr-3 pl-6 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                <IconDeviceFloppy size={15} />
                {saving ? "Saving..." : saved ? "Saved!" : "Save"}
              </button>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

function ProductTableRow({
  product,
  isExpanded,
  onToggleExpand,
}: {
  product: ProductRow;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const toggleActive = useMutation(api.productsAdmin.toggleActive);
  const toggleFeatured = useMutation(api.productsAdmin.toggleFeatured);

  return (
    <>
      <tr
        className={`cursor-pointer border-b border-gray-100 transition-colors hover:bg-gray-50 ${
          isExpanded ? "bg-gray-50" : ""
        }`}
        onClick={onToggleExpand}
      >
        {/* Thumbnail */}
        <td className="py-3 pl-5 pr-3">
          <div className="h-10 w-10 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
            {product.thumbnail ? (
              <img
                src={product.thumbnail}
                alt={product.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <IconPackage size={18} className="text-gray-300" />
              </div>
            )}
          </div>
        </td>

        {/* Title */}
        <td className="px-3 py-3">
          <p className="max-w-xs truncate text-sm font-medium text-gray-900">
            {product.title}
          </p>
        </td>

        {/* Part number */}
        <td className="px-3 py-3">
          <span className="font-mono text-xs text-gray-500">
            {product.partNumber}
          </span>
        </td>

        {/* Brand */}
        <td className="px-3 py-3">
          <span className="text-sm text-gray-600">
            {product.brandName ?? "–"}
          </span>
        </td>

        {/* MAP */}
        <td className="px-3 py-3 text-right">
          <span className="text-sm text-gray-700">
            {formatCurrency(product.mapPrice)}
          </span>
        </td>

        {/* Retail */}
        <td className="px-3 py-3 text-right">
          <span className="text-sm text-gray-700">
            {formatCurrency(product.retailPrice)}
          </span>
        </td>

        {/* Active toggle */}
        <td className="px-3 py-3 text-center">
          <Toggle
            checked={product.isActive}
            onChange={() => toggleActive({ id: product._id })}
            label={`Toggle active for ${product.title}`}
          />
        </td>

        {/* Featured toggle */}
        <td className="px-3 py-3 text-center">
          <Toggle
            checked={product.isFeatured ?? false}
            onChange={() => toggleFeatured({ id: product._id })}
            label={`Toggle featured for ${product.title}`}
          />
        </td>

        {/* Expand chevron */}
        <td className="py-3 pr-5 pl-3 text-right">
          {isExpanded ? (
            <IconChevronUp size={15} className="inline text-gray-400" />
          ) : (
            <IconChevronDown size={15} className="inline text-gray-400" />
          )}
        </td>
      </tr>

      {isExpanded && (
        <ExpandedRow product={product} onClose={onToggleExpand} />
      )}
    </>
  );
}

export default function AdminProductsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [activeOnly, setActiveOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [expandedId, setExpandedId] = useState<Id<"products"> | null>(null);

  // Debounce search so we don't fire a query on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchInput.trim();
      setSearch(trimmed.length > 0 ? trimmed : undefined);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const products = useQuery(api.productsAdmin.list, {
    search,
    isActive: activeOnly ? true : undefined,
    isFeatured: featuredOnly ? true : undefined,
  });

  const handleToggleExpand = (id: Id<"products">) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-5">
        <h1 className="font-heading text-2xl font-bold text-gray-900">
          Products
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Manage product listings, pricing, and visibility.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 bg-white px-6 py-3">
        {/* Search */}
        <div className="relative flex-1 min-w-48 max-w-sm">
          <IconSearch
            size={16}
            className="pointer-events-none absolute inset-y-0 left-3 my-auto text-gray-400"
          />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by title..."
            className="w-full rounded-lg border border-gray-300 py-1.5 pr-3 pl-9 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
          />
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2">
          <FilterChip
            label="Active only"
            active={activeOnly}
            onClick={() => setActiveOnly((v) => !v)}
          />
          <FilterChip
            label="Featured only"
            active={featuredOnly}
            onClick={() => setFeaturedOnly((v) => !v)}
          />
        </div>

        {/* Result count */}
        {products !== undefined && (
          <span className="ml-auto text-xs text-gray-400">
            {products.length} result{products.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Table area */}
      <div className="flex-1 overflow-auto">
        {products === undefined ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <IconPackage size={40} className="mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">
              No products found
            </p>
            {(search || activeOnly || featuredOnly) && (
              <p className="mt-1 text-xs text-gray-400">
                Try adjusting your search or filters.
              </p>
            )}
          </div>
        ) : (
          <table className="w-full min-w-[800px] border-collapse">
            <thead className="sticky top-0 z-10 bg-gray-50">
              <tr className="border-b border-gray-200">
                <th className="py-2.5 pl-5 pr-3 text-left" />
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Title
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Part #
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Brand
                </th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  MAP
                </th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Retail
                </th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Active
                </th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Featured
                </th>
                <th className="py-2.5 pr-5 pl-3" />
              </tr>
            </thead>
            <tbody className="bg-white">
              {(products as ProductRow[]).map((product) => (
                <ProductTableRow
                  key={product._id}
                  product={product}
                  isExpanded={expandedId === product._id}
                  onToggleExpand={() => handleToggleExpand(product._id)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
