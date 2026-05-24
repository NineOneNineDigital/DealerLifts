"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductGrid } from "@/components/store/ProductGrid";
import { VehicleSelector } from "@/components/store/VehicleSelector";
import { api } from "@/convex/_generated/api";
import { useSelectedVehicle } from "@/lib/vehicle/VehicleProvider";

export default function VehiclePage() {
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
      <VehicleContent />
    </Suspense>
  );
}

function VehicleContent() {
  const searchParams = useSearchParams();
  const { vehicle, setVehicle } = useSelectedVehicle();

  // URL params win when present (shareable links), otherwise fall back to persisted vehicle.
  const urlYear = searchParams.get("year");
  const urlMake = searchParams.get("make");
  const urlModel = searchParams.get("model");

  const year = urlYear ? Number(urlYear) : vehicle?.year;
  const make = urlMake || vehicle?.make || "";
  const model = urlModel || vehicle?.model || "";

  // If we landed here from a shared link, persist the selection so the banner
  // and badges work consistently on subsequent pages.
  useEffect(() => {
    if (
      urlYear &&
      urlMake &&
      urlModel &&
      (!vehicle ||
        vehicle.year !== Number(urlYear) ||
        vehicle.make !== urlMake ||
        vehicle.model !== urlModel)
    ) {
      setVehicle({ year: Number(urlYear), make: urlMake, model: urlModel });
    }
  }, [urlYear, urlMake, urlModel, vehicle, setVehicle]);

  const products = useQuery(
    api.fitments.getProductsByFitment,
    year && make && model ? { year, make, model } : "skip"
  );

  return (
    <div className="pt-32 md:pt-40">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-2 text-gray-400 text-sm">
          <Link className="hover:text-gray-900" href="/store">
            Store
          </Link>
          <span>/</span>
          <span className="text-gray-900">Vehicle Parts</span>
        </div>

        <div className="mb-8">
          <VehicleSelector />
        </div>

        {year && make && model && (
          <h2 className="mb-6 font-bold font-heading text-gray-900 text-xl">
            Parts for {year} {make} {model}
          </h2>
        )}

        {products === undefined && year ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : products && products.length === 0 ? (
          <div className="py-12 text-center">
            <p className="mb-4 text-gray-500">
              No parts found for this vehicle.
            </p>
            <Link
              className="font-medium text-[#077BFF] text-sm hover:underline"
              href="/store"
            >
              Browse all products
            </Link>
          </div>
        ) : products && products.length > 0 ? (
          <ProductGrid>
            {products.map((product) =>
              product ? (
                <ProductCard key={product._id} product={product} />
              ) : null
            )}
          </ProductGrid>
        ) : null}
      </div>
    </div>
  );
}
