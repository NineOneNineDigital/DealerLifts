"use client";

import { IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { listProductsByVehicleAction } from "@/lib/store/fitment-actions";
import type { NormalizedProduct } from "@/lib/store/types";
import { useSelectedVehicle } from "@/lib/vehicle/VehicleProvider";
import { ProductCard } from "./ProductCard";
import { ProductGrid } from "./ProductGrid";

export function VehicleFitRail() {
  const { vehicle, hydrated } = useSelectedVehicle();
  const [products, setProducts] = useState<NormalizedProduct[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!vehicle) {
      setProducts([]);
      return;
    }
    let active = true;
    setLoading(true);
    listProductsByVehicleAction({
      make: vehicle.make,
      model: vehicle.model,
      submodel: vehicle.submodel,
      year: vehicle.year,
      limit: 4,
    })
      .then((result) => {
        if (active) {
          setProducts(result);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [vehicle]);

  // Nothing to show until a vehicle is chosen and it has fitting parts.
  if (!(hydrated && vehicle) || (!loading && products.length === 0)) {
    return null;
  }

  const viewAll = `/shop/vehicle?year=${vehicle.year}&make=${encodeURIComponent(
    vehicle.make
  )}&model=${encodeURIComponent(vehicle.model)}${
    vehicle.submodel ? `&submodel=${encodeURIComponent(vehicle.submodel)}` : ""
  }`;

  return (
    <section>
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h2 className="font-bold font-heading text-2xl text-gray-900">
            Fits your {vehicle.year} {vehicle.make} {vehicle.model}
          </h2>
          <p className="mt-1 text-gray-500 text-sm">
            Parts confirmed to fit your vehicle
          </p>
        </div>
        <Link
          className="inline-flex flex-shrink-0 items-center gap-1 font-semibold text-[#077BFF] text-sm transition-colors hover:text-[#0565D4]"
          href={viewAll}
        >
          View all <IconArrowRight size={15} />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              className="aspect-[3/4] animate-pulse rounded-xl bg-gray-100"
              key={i}
            />
          ))}
        </div>
      ) : (
        <ProductGrid>
          {products.map((product) => (
            <ProductCard fitsVehicle key={product.id} product={product} />
          ))}
        </ProductGrid>
      )}
    </section>
  );
}
