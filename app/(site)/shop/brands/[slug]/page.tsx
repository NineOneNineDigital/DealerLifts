import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryFilters } from "@/components/store/CategoryFilters";
import { CategorySort } from "@/components/store/CategorySort";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductGrid } from "@/components/store/ProductGrid";
import { SearchBar } from "@/components/store/SearchBar";
import { parseFilters, parseSort } from "@/lib/store/filter-params";
import {
  getBrandBySlug,
  listProductsByBrandFiltered,
} from "@/lib/store/source";

interface BrandPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function BrandPage({
  params,
  searchParams,
}: BrandPageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const sort = parseSort(sp.sort);
  const filters = parseFilters(sp.filter);

  const [brand, { products, facets }] = await Promise.all([
    getBrandBySlug(slug),
    listProductsByBrandFiltered(slug, { filters, sort }),
  ]);

  if (!brand) {
    notFound();
  }

  return (
    <div className="pt-24 md:pt-28">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-2 text-gray-400 text-sm">
          <Link className="hover:text-gray-900" href="/shop">
            Shop
          </Link>
          <span>/</span>
          <span className="text-gray-900">{brand.name}</span>
        </div>

        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="font-bold font-heading text-2xl text-gray-900 md:text-3xl">
            {brand.name}
          </h1>
          <SearchBar />
        </div>

        {products.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No products found for this brand.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <CategoryFilters facets={facets} />
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between gap-4">
                <p className="text-gray-500 text-sm">
                  {products.length}{" "}
                  {products.length === 1 ? "product" : "products"}
                </p>
                <CategorySort mode="search" />
              </div>
              <ProductGrid>
                {products.map((product) => (
                  <ProductCard
                    brandName={brand.name}
                    key={product.id}
                    product={product}
                  />
                ))}
              </ProductGrid>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
