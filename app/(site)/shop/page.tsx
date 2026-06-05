import {
  IconHeadset,
  IconRefresh,
  IconShieldCheck,
  IconTruck,
} from "@tabler/icons-react";
import Link from "next/link";
import { BrandGrid } from "@/components/store/BrandGrid";
import { BuildTypeGrid } from "@/components/store/BuildTypeGrid";
import { CategoryGrid } from "@/components/store/CategoryGrid";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductGrid } from "@/components/store/ProductGrid";
import { StoreHero } from "@/components/store/StoreHero";
import { VehicleFitRail } from "@/components/store/VehicleFitRail";
import { VehicleSelector } from "@/components/store/VehicleSelector";
import { listBrands, listNewProducts } from "@/lib/store/source";

const VALUE_PROPS = [
  {
    icon: IconTruck,
    title: "Free Shipping",
    subtitle: "On orders over $99",
  },
  {
    icon: IconRefresh,
    title: "Easy Returns",
    subtitle: "30-day hassle-free returns",
  },
  {
    icon: IconHeadset,
    title: "Expert Support",
    subtitle: "Real techs, real answers",
  },
  {
    icon: IconShieldCheck,
    title: "Secure Checkout",
    subtitle: "256-bit SSL encryption",
  },
];

export default async function StorePage() {
  const [newArrivals, brands] = await Promise.all([
    listNewProducts(8),
    listBrands(),
  ]);

  return (
    <>
      <StoreHero />

      {/* Value proposition strip */}
      <div className="border-gray-800 border-b bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 divide-x divide-gray-800 md:grid-cols-4">
            {VALUE_PROPS.map(({ icon: Icon, title, subtitle }) => (
              <div
                className="flex items-center gap-3 px-4 py-4 md:py-5"
                key={title}
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#077BFF]/15">
                  <Icon className="text-[#077BFF]" size={18} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-white leading-tight">
                    {title}
                  </p>
                  <p className="mt-0.5 truncate text-gray-400 text-xs">
                    {subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-50">
        <div className="mx-auto max-w-7xl space-y-16 px-4 py-12 sm:px-6 lg:px-8">
          {/* Vehicle Selector */}
          <VehicleSelector />

          {/* Parts that fit the selected vehicle (hidden when none selected) */}
          <VehicleFitRail />

          {/* Shop by Build Type */}
          <BuildTypeGrid />

          {/* Shop by Category */}
          <CategoryGrid />

          {/* New Arrivals */}
          {newArrivals.length > 0 && (
            <section>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="font-bold font-heading text-2xl text-gray-900">
                    New Arrivals
                  </h2>
                  <p className="mt-1 text-gray-500 text-sm">
                    Latest additions to our catalog
                  </p>
                </div>
                <Link
                  className="font-semibold text-[#077BFF] text-sm transition-colors hover:text-[#0565D4]"
                  href="/shop/search?q="
                >
                  View all &rarr;
                </Link>
              </div>
              <ProductGrid>
                {newArrivals.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </ProductGrid>
            </section>
          )}

          {/* Shop by Brand — most popular, with a link to the full list */}
          <BrandGrid brands={brands.slice(0, 8)} viewAllHref="/shop/brands" />

          {/* Bottom CTA banner */}
          <section className="rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-12 text-center">
            <p className="mb-3 font-semibold text-[#077BFF] text-sm uppercase tracking-wider">
              Professional Installation Available
            </p>
            <h2 className="mb-4 font-bold font-heading text-3xl text-white md:text-4xl">
              Not sure what you need?
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-gray-300 text-lg">
              Our experts can help you find the right parts and get them
              installed. Request a quote today.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                className="rounded-lg bg-[#077BFF] px-8 py-3.5 font-semibold text-white transition-colors hover:bg-[#0565D4]"
                href="/contact"
              >
                Get a Free Quote
              </Link>
              <a
                className="rounded-lg bg-white/10 px-8 py-3.5 font-semibold text-white transition-colors hover:bg-white/20"
                href="tel:919-275-8095"
              >
                Call (919) 275-8095
              </a>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
