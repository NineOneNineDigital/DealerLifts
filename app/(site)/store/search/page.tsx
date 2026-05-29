import Link from "next/link";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductGrid } from "@/components/store/ProductGrid";
import { SearchBar } from "@/components/store/SearchBar";
import { searchProducts } from "@/lib/store/source";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const results = q ? await searchProducts(q, 24) : [];

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
          <SearchBar defaultValue={q ?? ""} />
        </div>

        {q && (
          <p className="mb-6 text-gray-500 text-sm">
            {`${results.length} result${results.length !== 1 ? "s" : ""} for "${q}"`}
          </p>
        )}

        {results.length > 0 && (
          <ProductGrid>
            {results.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </ProductGrid>
        )}
        {q && results.length === 0 && (
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
        )}
      </div>
    </div>
  );
}
