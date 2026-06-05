import { IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";
import type { NormalizedBrand } from "@/lib/store/types";

interface BrandGridProps {
  brands: NormalizedBrand[];
  heading?: string;
  subheading?: string;
  viewAllHref?: string;
}

export function BrandGrid({
  brands,
  heading = "Shop by Brand",
  subheading = "Trusted manufacturers in every category",
  viewAllHref,
}: BrandGridProps) {
  if (brands.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h2 className="font-bold font-heading text-2xl text-gray-900">
            {heading}
          </h2>
          <p className="mt-1 text-gray-500 text-sm">{subheading}</p>
        </div>
        {viewAllHref && (
          <Link
            className="inline-flex flex-shrink-0 items-center gap-1 font-semibold text-[#077BFF] text-sm transition-colors hover:text-[#0565D4]"
            href={viewAllHref}
          >
            View all <IconArrowRight size={15} />
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {brands.map((brand) => (
          <Link
            className="group flex flex-col items-center justify-center rounded-xl border-2 border-gray-200 bg-white px-4 py-7 text-center transition-all hover:-translate-y-0.5 hover:border-[#077BFF] hover:shadow-md"
            href={`/shop/brands/${brand.slug}`}
            key={brand.id}
          >
            <span className="font-bold font-heading text-gray-900 text-lg leading-tight transition-colors group-hover:text-[#077BFF]">
              {brand.name}
            </span>
            {brand.productCount != null && (
              <span className="mt-1.5 text-gray-400 text-xs">
                {brand.productCount} product{brand.productCount === 1 ? "" : "s"}
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
