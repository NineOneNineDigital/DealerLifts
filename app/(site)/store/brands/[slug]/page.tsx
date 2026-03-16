"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductGrid } from "@/components/store/ProductGrid";
import { SearchBar } from "@/components/store/SearchBar";
import Link from "next/link";

export default function BrandPage() {
  const { slug } = useParams<{ slug: string }>();
  const brand = useQuery(api.brands.getBySlug, { slug });
  const products = useQuery(
    api.products.listByBrand,
    brand ? { brandId: brand._id } : "skip",
  );

  return (
    <div className="pt-32 md:pt-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/store" className="hover:text-gray-900">Store</Link>
          <span>/</span>
          <span className="text-gray-900">{brand?.name ?? "Brand"}</span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-gray-900">
            {brand?.name ?? "Loading..."}
          </h1>
          <SearchBar />
        </div>

        {products === undefined ? (
          <p className="text-gray-400 text-sm">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-500 text-sm">No products found for this brand.</p>
        ) : (
          <ProductGrid>
            {products.map((product) => (
              <ProductCard key={product._id} product={product} brandName={brand?.name} />
            ))}
          </ProductGrid>
        )}
      </div>
    </div>
  );
}
