import Link from "next/link";
import Image from "next/image";
import type { NormalizedBrand } from "@/lib/store/types";

interface BrandGridProps {
  brands: NormalizedBrand[];
}

export function BrandGrid({ brands }: BrandGridProps) {
  if (brands.length === 0) return null;

  return (
    <section>
      <h2 className="font-heading text-xl font-bold text-gray-900 mb-6">Shop by Brand</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            href={`/store/brands/${brand.slug}`}
            className="flex items-center justify-center p-4 bg-white border border-gray-200 rounded-xl hover:border-[#077BFF] hover:shadow-sm transition-all aspect-square"
          >
            {brand.logo ? (
              <Image
                src={brand.logo}
                alt={brand.name}
                width={80}
                height={80}
                className="object-contain"
              />
            ) : (
              <span className="text-xs font-medium text-gray-700 text-center">{brand.name}</span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
