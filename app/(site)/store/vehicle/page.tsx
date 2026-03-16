"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductGrid } from "@/components/store/ProductGrid";
import { VehicleSelector } from "@/components/store/VehicleSelector";
import Link from "next/link";

export default function VehiclePage() {
  return (
    <Suspense fallback={<div className="pt-32 md:pt-40"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center"><p className="text-gray-400">Loading...</p></div></div>}>
      <VehicleContent />
    </Suspense>
  );
}

function VehicleContent() {
  const searchParams = useSearchParams();
  const year = searchParams.get("year");
  const make = searchParams.get("make") || "";
  const model = searchParams.get("model") || "";

  const products = useQuery(
    api.fitments.getProductsByFitment,
    year && make && model
      ? { year: Number(year), make, model }
      : "skip",
  );

  return (
    <div className="pt-32 md:pt-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/store" className="hover:text-gray-900">Store</Link>
          <span>/</span>
          <span className="text-gray-900">Vehicle Parts</span>
        </div>

        <div className="mb-8">
          <VehicleSelector />
        </div>

        {year && make && model && (
          <h2 className="font-heading text-xl font-bold text-gray-900 mb-6">
            Parts for {year} {make} {model}
          </h2>
        )}

        {products === undefined && year ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : products && products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No parts found for this vehicle.</p>
            <Link href="/store" className="text-[#077BFF] hover:underline text-sm font-medium">
              Browse all products
            </Link>
          </div>
        ) : products && products.length > 0 ? (
          <ProductGrid>
            {products.map((product) =>
              product ? (
                <ProductCard key={product._id} product={product} />
              ) : null,
            )}
          </ProductGrid>
        ) : null}
      </div>
    </div>
  );
}
