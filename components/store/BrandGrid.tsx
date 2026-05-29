import Image from "next/image";
import Link from "next/link";
import type { NormalizedBrand } from "@/lib/store/types";

interface BrandGridProps {
  brands: NormalizedBrand[];
}

export function BrandGrid({ brands }: BrandGridProps) {
  if (brands.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="mb-6 font-bold font-heading text-gray-900 text-xl">
        Shop by Brand
      </h2>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {brands.map((brand) => (
          <Link
            className="flex aspect-square items-center justify-center rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-[#077BFF] hover:shadow-sm"
            href={`/store/brands/${brand.slug}`}
            key={brand.id}
          >
            {brand.logo ? (
              <Image
                alt={brand.name}
                className="object-contain"
                height={80}
                src={brand.logo}
                width={80}
              />
            ) : (
              <span className="text-center font-medium text-gray-700 text-xs">
                {brand.name}
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
