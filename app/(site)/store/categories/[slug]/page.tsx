"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductGrid } from "@/components/store/ProductGrid";
import { SearchBar } from "@/components/store/SearchBar";
import { api } from "@/convex/_generated/api";
import { useFitmentMatchSet } from "@/hooks/useFitmentMatch";

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const category = useQuery(api.categories.getBySlug, { slug });
  const products = useQuery(
    api.products.listByCategory,
    category ? { categoryId: category._id } : "skip"
  );
  const fitsSet = useFitmentMatchSet(products?.map((p) => p._id) ?? []);

  return (
    <div className="pt-32 md:pt-40">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-2 text-gray-400 text-sm">
          <Link className="hover:text-gray-900" href="/store">
            Store
          </Link>
          <span>/</span>
          <span className="text-gray-900">{category?.name ?? "Category"}</span>
        </div>

        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="font-bold font-heading text-2xl text-gray-900 md:text-3xl">
            {category?.name ?? "Loading..."}
          </h1>
          <SearchBar />
        </div>

        {products === undefined ? (
          <p className="text-gray-400 text-sm">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No products found in this category.
          </p>
        ) : (
          <ProductGrid>
            {products.map((product) => (
              <ProductCard
                fitsVehicle={fitsSet.has(product._id.toString())}
                key={product._id}
                product={product}
              />
            ))}
          </ProductGrid>
        )}
      </div>
    </div>
  );
}
