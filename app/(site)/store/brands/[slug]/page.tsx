import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductGrid } from "@/components/store/ProductGrid";
import { SearchBar } from "@/components/store/SearchBar";
import { getBrandBySlug, listProductsByBrand } from "@/lib/store/source";

interface BrandPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params;
  const [brand, products] = await Promise.all([
    getBrandBySlug(slug),
    listProductsByBrand(slug),
  ]);

  if (!brand) {
    notFound();
  }

  return (
    <div className="pt-32 md:pt-40">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-2 text-gray-400 text-sm">
          <Link className="hover:text-gray-900" href="/store">
            Store
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
          <ProductGrid>
            {products.map((product) => (
              <ProductCard
                brandName={brand.name}
                key={product.id}
                product={product}
              />
            ))}
          </ProductGrid>
        )}
      </div>
    </div>
  );
}
