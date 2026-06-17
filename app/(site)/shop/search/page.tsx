import Link from "next/link";
import { CategoryFilters } from "@/components/store/CategoryFilters";
import { CategorySort } from "@/components/store/CategorySort";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductGrid } from "@/components/store/ProductGrid";
import { SearchBar } from "@/components/store/SearchBar";
import { parseFilters, parseSort } from "@/lib/store/filter-params";
import { searchProductsFiltered } from "@/lib/store/source";

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const sort = parseSort(sp.sort);
  const filters = parseFilters(sp.filter);

  const { products, facets } = q
    ? await searchProductsFiltered(q, { filters, sort })
    : { facets: [], products: [] };

  return (
    <div className="pt-24 md:pt-28">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-2 text-gray-400 text-sm">
          <Link className="hover:text-gray-900" href="/shop">
            Shop
          </Link>
          <span>/</span>
          <span className="text-gray-900">Search</span>
        </div>

        <div className="mb-8">
          <SearchBar defaultValue={q} />
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <CategoryFilters facets={facets} />
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between gap-4">
                <p className="text-gray-500 text-sm">
                  {`${products.length} result${products.length !== 1 ? "s" : ""} for "${q}"`}
                </p>
                <CategorySort mode="search" />
              </div>
              <ProductGrid>
                {products.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </ProductGrid>
            </div>
          </div>
        ) : null}

        {q && products.length === 0 ? (
          <div className="py-16 text-center">
            <p className="mb-4 text-gray-500">
              No products found for &quot;{q}&quot;
            </p>
            <Link
              className="font-medium text-[#077BFF] text-sm hover:underline"
              href="/shop"
            >
              Browse all products
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
