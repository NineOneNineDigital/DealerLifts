"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductGrid } from "@/components/store/ProductGrid";
import { SearchBar } from "@/components/store/SearchBar";
import Link from "next/link";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="pt-32 md:pt-40"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center"><p className="text-gray-400">Loading...</p></div></div>}>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const results = useQuery(api.products.search, q ? { query: q } : "skip");

  return (
    <div className="pt-32 md:pt-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/store" className="hover:text-gray-900">Store</Link>
          <span>/</span>
          <span className="text-gray-900">Search</span>
        </div>

        <div className="mb-8">
          <SearchBar defaultValue={q} />
        </div>

        {q && (
          <p className="text-sm text-gray-500 mb-6">
            {results === undefined
              ? "Searching..."
              : `${results.length} result${results.length !== 1 ? "s" : ""} for "${q}"`}
          </p>
        )}

        {results && results.length > 0 ? (
          <ProductGrid>
            {results.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </ProductGrid>
        ) : results && results.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">No products found for &quot;{q}&quot;</p>
            <Link href="/store" className="text-[#077BFF] hover:underline text-sm font-medium">
              Browse all products
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
