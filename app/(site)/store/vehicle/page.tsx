import Link from "next/link";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductGrid } from "@/components/store/ProductGrid";
import { VehicleSelector } from "@/components/store/VehicleSelector";
import { listProductsByVehicle } from "@/lib/store/fitments-source";

interface VehiclePageProps {
  searchParams: Promise<{
    make?: string;
    model?: string;
    submodel?: string;
    year?: string;
  }>;
}

export default async function VehiclePage({ searchParams }: VehiclePageProps) {
  const { year, make, model, submodel } = await searchParams;
  const yearNum = year ? Number.parseInt(year, 10) : null;
  const products =
    yearNum && make && model
      ? await listProductsByVehicle({
          make,
          model,
          submodel: submodel || undefined,
          year: yearNum,
        })
      : [];

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

        {yearNum && make && model && (
          <h2 className="mb-6 font-bold font-heading text-gray-900 text-xl">
            Parts for {yearNum} {make} {model}
            {submodel ? ` ${submodel}` : ""}
          </h2>
        )}

        {yearNum && make && model && products.length === 0 && (
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
        )}
        {products.length > 0 && (
          <ProductGrid>
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </ProductGrid>
        )}
      </div>
    </div>
  );
}
