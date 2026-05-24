"use client";

import {
  IconBolt,
  IconCar,
  IconEngine,
  IconFlame,
  IconHeadset,
  IconRefresh,
  IconSettings,
  IconShieldCheck,
  IconTag,
  IconTool,
  IconTruck,
  IconWind,
} from "@tabler/icons-react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { BrandGrid } from "@/components/store/BrandGrid";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductGrid } from "@/components/store/ProductGrid";
import { StoreHero } from "@/components/store/StoreHero";
import { VehicleSelector } from "@/components/store/VehicleSelector";
import { api } from "@/convex/_generated/api";
import { useFitmentMatchSet } from "@/hooks/useFitmentMatch";

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

const CATEGORY_ICONS = [
  IconEngine,
  IconCar,
  IconTool,
  IconBolt,
  IconFlame,
  IconWind,
  IconSettings,
  IconTag,
];

const CATEGORY_ACCENTS = [
  "border-blue-400",
  "border-orange-400",
  "border-green-400",
  "border-yellow-400",
  "border-red-400",
  "border-teal-400",
  "border-purple-400",
  "border-pink-400",
];

function ProductSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="aspect-square bg-gray-100" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-1/3 rounded bg-gray-100" />
        <div className="h-4 w-full rounded bg-gray-100" />
        <div className="h-4 w-3/4 rounded bg-gray-100" />
        <div className="mt-1 h-3 w-1/4 rounded bg-gray-100" />
        <div className="mt-3 flex justify-between">
          <div className="h-6 w-16 rounded bg-gray-100" />
          <div className="h-5 w-14 rounded bg-gray-100" />
        </div>
        <div className="mt-2 h-9 w-full rounded bg-gray-100" />
      </div>
    </div>
  );
}

function CategorySkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-6">
      <div className="mx-auto h-5 w-2/3 rounded bg-gray-100" />
    </div>
  );
}

export default function StorePage() {
  const featured = useQuery(api.products.listFeatured, { limit: 8 });
  const newArrivals = useQuery(api.products.listAll, { limit: 4 });
  const categories = useQuery(api.categories.listTopLevel);

  const allIds = [
    ...(featured?.map((p) => p._id) ?? []),
    ...(newArrivals?.map((p) => p._id) ?? []),
  ];
  const fitsSet = useFitmentMatchSet(allIds);

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

          {/* Featured Products */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-bold font-heading text-2xl text-gray-900">
                  Featured Products
                </h2>
                <p className="mt-1 text-gray-500 text-sm">
                  Hand-picked top sellers
                </p>
              </div>
              <Link
                className="font-semibold text-[#077BFF] text-sm transition-colors hover:text-[#0565D4]"
                href="/store/search?q="
              >
                View all &rarr;
              </Link>
            </div>
            {featured === undefined ? (
              <ProductGrid>
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </ProductGrid>
            ) : featured.length > 0 ? (
              <ProductGrid>
                {featured.map((product) => (
                  <ProductCard
                    fitsVehicle={fitsSet.has(product._id.toString())}
                    key={product._id}
                    product={product}
                  />
                ))}
              </ProductGrid>
            ) : null}
          </section>

          {/* Shop by Category */}
          {categories === undefined ? (
            <section>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-bold font-heading text-2xl text-gray-900">
                  Shop by Category
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <CategorySkeleton key={i} />
                ))}
              </div>
            </section>
          ) : categories.length > 0 ? (
            <section>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="font-bold font-heading text-2xl text-gray-900">
                    Shop by Category
                  </h2>
                  <p className="mt-1 text-gray-500 text-sm">
                    Browse our full catalog
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {categories.map((cat, i) => {
                  const Icon = CATEGORY_ICONS[i % CATEGORY_ICONS.length];
                  const accent = CATEGORY_ACCENTS[i % CATEGORY_ACCENTS.length];
                  return (
                    <Link
                      className={`group flex items-center gap-3 border border-l-4 bg-white p-5 ${accent} rounded-xl border-gray-200 transition-all hover:border-[#077BFF] hover:border-l-[#077BFF] hover:shadow-md`}
                      href={`/store/categories/${cat.slug}`}
                      key={cat._id}
                    >
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50 transition-colors group-hover:bg-[#077BFF]/10">
                        <Icon
                          className="text-gray-500 transition-colors group-hover:text-[#077BFF]"
                          size={18}
                        />
                      </div>
                      <span className="font-semibold text-gray-900 text-sm transition-colors group-hover:text-[#077BFF]">
                        {cat.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ) : null}

          {/* New Arrivals */}
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
                href="/store/search?q="
              >
                View all &rarr;
              </Link>
            </div>
            {newArrivals === undefined ? (
              <ProductGrid>
                {Array.from({ length: 4 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </ProductGrid>
            ) : newArrivals.length > 0 ? (
              <ProductGrid>
                {newArrivals.map((product) => (
                  <ProductCard
                    fitsVehicle={fitsSet.has(product._id.toString())}
                    key={product._id}
                    product={product}
                  />
                ))}
              </ProductGrid>
            ) : null}
          </section>

          {/* Shop by Brand */}
          <BrandGrid />

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
