import Link from "next/link";
import { CategoryFilters } from "@/components/store/CategoryFilters";
import { CategorySort } from "@/components/store/CategorySort";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductGrid } from "@/components/store/ProductGrid";
import { VehicleSelector } from "@/components/store/VehicleSelector";
import { parseFilters, parseSort } from "@/lib/store/filter-params";
import { listProductsByVehicleFiltered } from "@/lib/store/source";

interface VehiclePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function VehiclePage({ searchParams }: VehiclePageProps) {
  const sp = await searchParams;
  const year = typeof sp.year === "string" ? sp.year : undefined;
  const make = typeof sp.make === "string" ? sp.make : undefined;
  const model = typeof sp.model === "string" ? sp.model : undefined;
  const submodel = typeof sp.submodel === "string" ? sp.submodel : undefined;
  const sort = parseSort(sp.sort);
  const filters = parseFilters(sp.filter);

  const yearNum = year ? Number.parseInt(year, 10) : null;
  const hasVehicle = Boolean(yearNum && make && model);

  const { products, facets } =
    yearNum && make && model
      ? await listProductsByVehicleFiltered(
          { make, model, submodel: submodel || undefined, year: yearNum },
          { filters, sort }
        )
      : { facets: [], products: [] };

  return (
    <div className="pt-24 md:pt-28">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-2 text-gray-400 text-sm">
          <Link className="hover:text-gray-900" href="/shop">
            Shop
          </Link>
          <span>/</span>
          <span className="text-gray-900">Vehicle Parts</span>
        </div>

        <div className="mb-8">
          <VehicleSelector />
        </div>

        {hasVehicle ? (
          <h2 className="mb-6 font-bold font-heading text-gray-900 text-xl">
            Parts for {yearNum} {make} {model}
            {submodel ? ` ${submodel}` : ""}
          </h2>
        ) : null}

        {hasVehicle && products.length === 0 ? (
          <div className="py-12 text-center">
            <p className="mb-4 text-gray-500">
              No parts found for this vehicle.
            </p>
            <Link
              className="font-medium text-[#077BFF] text-sm hover:underline"
              href="/shop"
            >
              Browse all products
            </Link>
          </div>
        ) : null}

        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <CategoryFilters facets={facets} />
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between gap-4">
                <p className="text-gray-500 text-sm">
                  {products.length} {products.length === 1 ? "part" : "parts"}
                </p>
                <CategorySort mode="search" />
              </div>
              <ProductGrid>
                {products.map((product) => (
                  <ProductCard key={product.slug} product={product} />
                ))}
              </ProductGrid>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
