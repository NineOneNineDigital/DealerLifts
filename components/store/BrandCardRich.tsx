import { IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";
import type { BrandWithCategories } from "@/lib/store/types";

export function BrandCardRich({ brand }: { brand: BrandWithCategories }) {
  return (
    <Link
      className="group flex flex-col rounded-2xl border-2 border-gray-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-[#077BFF] hover:shadow-lg"
      href={`/shop/brands/${brand.slug}`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-bold font-heading text-gray-900 text-xl leading-tight transition-colors group-hover:text-[#077BFF]">
          {brand.name}
        </h2>
        {brand.productCount != null && (
          <span className="flex-shrink-0 text-gray-400 text-xs">
            {brand.productCount} product{brand.productCount === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {brand.topCategories.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {brand.topCategories.map((cat) => (
            <span
              className="rounded-full bg-gray-100 px-2.5 py-1 font-medium text-gray-600 text-xs"
              key={cat}
            >
              {cat}
            </span>
          ))}
        </div>
      )}

      <span className="mt-5 inline-flex items-center gap-1 font-semibold text-[#077BFF] text-sm">
        Shop {brand.name}
        <IconArrowRight
          className="transition-transform group-hover:translate-x-0.5"
          size={14}
        />
      </span>
    </Link>
  );
}
