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
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-bold font-heading text-2xl text-gray-900">
            Shop by Brand
          </h2>
          <p className="mt-1 text-gray-500 text-sm">
            Trusted manufacturers in every category
          </p>
        </div>
      </div>
      {/* Horizontal scroll strip — grayscale logos, full color on hover */}
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="scrollbar-hide overflow-x-auto overscroll-x-contain px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 pb-2">
            {brands.map((brand) => (
              <Link
                className="group flex h-24 w-36 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-[#077BFF] hover:shadow-md"
                href={`/store/brands/${brand.slug}`}
                key={brand.id}
              >
                {brand.logo ? (
                  <Image
                    alt={brand.name}
                    className="max-h-12 w-auto object-contain opacity-70 grayscale transition-all duration-200 group-hover:opacity-100 group-hover:grayscale-0"
                    height={48}
                    src={brand.logo}
                    width={120}
                  />
                ) : (
                  <span className="text-center font-bold text-gray-700 text-sm transition-colors group-hover:text-[#077BFF]">
                    {brand.name}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
