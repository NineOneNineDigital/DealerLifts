"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductGrid } from "@/components/store/ProductGrid";
import { SearchBar } from "@/components/store/SearchBar";
import { api } from "@/convex/_generated/api";
import { useFitmentMatchSet } from "@/hooks/useFitmentMatch";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-32 md:pt-40">
          <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const results = useQuery(api.products.search, q ? { query: q } : "skip");
  const fitsSet = useFitmentMatchSet(results?.map((p) => p._id) ?? []);

  return (
    <div className="pt-32 md:pt-40">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-2 text-gray-400 text-sm">
          <Link className="hover:text-gray-900" href="/store">
            Store
          </Link>
          <span>/</span>
          <span className="text-gray-900">Search</span>
        </div>

        <div className="mb-8">
          <SearchBar defaultValue={q} />
        </div>

        {q && (
          <p className="mb-6 text-gray-500 text-sm">
            {results === undefined
              ? "Searching..."
              : `${results.length} result${results.length !== 1 ? "s" : ""} for "${q}"`}
          </p>
        )}

        {results && results.length > 0 ? (
          <ProductGrid>
            {results.map((product) => (
              <ProductCard
                fitsVehicle={fitsSet.has(product._id.toString())}
                key={product._id}
                product={product}
              />
            ))}
          </ProductGrid>
        ) : results && results.length === 0 ? (
          <div className="py-16 text-center">
            <p className="mb-4 text-gray-500">
              No products found for &quot;{q}&quot;
            </p>
            <Link
              className="font-medium text-[#077BFF] text-sm hover:underline"
              href="/store"
            >
              Browse all products
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
