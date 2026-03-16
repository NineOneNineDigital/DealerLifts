"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import {
  IconTruck,
  IconRefresh,
  IconHeadset,
  IconShieldCheck,
  IconTag,
  IconEngine,
  IconCar,
  IconTool,
  IconBolt,
  IconFlame,
  IconWind,
  IconSettings,
} from "@tabler/icons-react";
import { StoreHero } from "@/components/store/StoreHero";
import { VehicleSelector } from "@/components/store/VehicleSelector";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductGrid } from "@/components/store/ProductGrid";
import { BrandGrid } from "@/components/store/BrandGrid";

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
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-100" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/4 mt-1" />
        <div className="flex justify-between mt-3">
          <div className="h-6 bg-gray-100 rounded w-16" />
          <div className="h-5 bg-gray-100 rounded w-14" />
        </div>
        <div className="h-9 bg-gray-100 rounded w-full mt-2" />
      </div>
    </div>
  );
}

function CategorySkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
      <div className="h-5 bg-gray-100 rounded w-2/3 mx-auto" />
    </div>
  );
}

export default function StorePage() {
  const featured = useQuery(api.products.listFeatured, { limit: 8 });
  const newArrivals = useQuery(api.products.listAll, { limit: 4 });
  const categories = useQuery(api.categories.listTopLevel);

  return (
    <>
      <StoreHero />

      {/* Value proposition strip */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-800">
            {VALUE_PROPS.map(({ icon: Icon, title, subtitle }) => (
              <div
                key={title}
                className="flex items-center gap-3 px-4 py-4 md:py-5"
              >
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-[#077BFF]/15 flex items-center justify-center">
                  <Icon size={18} className="text-[#077BFF]" />
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-semibold leading-tight">{title}</p>
                  <p className="text-gray-400 text-xs mt-0.5 truncate">{subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
          {/* Vehicle Selector */}
          <VehicleSelector />

          {/* Featured Products */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-heading text-2xl font-bold text-gray-900">
                  Featured Products
                </h2>
                <p className="text-gray-500 text-sm mt-1">Hand-picked top sellers</p>
              </div>
              <Link
                href="/store/search?q="
                className="text-sm font-semibold text-[#077BFF] hover:text-[#0565D4] transition-colors"
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
                  <ProductCard key={product._id} product={product} />
                ))}
              </ProductGrid>
            ) : null}
          </section>

          {/* Shop by Category */}
          {categories === undefined ? (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-2xl font-bold text-gray-900">Shop by Category</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <CategorySkeleton key={i} />
                ))}
              </div>
            </section>
          ) : categories.length > 0 ? (
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-heading text-2xl font-bold text-gray-900">
                    Shop by Category
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">Browse our full catalog</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {categories.map((cat, i) => {
                  const Icon = CATEGORY_ICONS[i % CATEGORY_ICONS.length];
                  const accent = CATEGORY_ACCENTS[i % CATEGORY_ACCENTS.length];
                  return (
                    <Link
                      key={cat._id}
                      href={`/store/categories/${cat.slug}`}
                      className={`group flex items-center gap-3 p-5 bg-white border border-l-4 ${accent} border-gray-200 rounded-xl hover:shadow-md hover:border-[#077BFF] hover:border-l-[#077BFF] transition-all`}
                    >
                      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gray-50 group-hover:bg-[#077BFF]/10 flex items-center justify-center transition-colors">
                        <Icon size={18} className="text-gray-500 group-hover:text-[#077BFF] transition-colors" />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 group-hover:text-[#077BFF] transition-colors">
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
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-heading text-2xl font-bold text-gray-900">New Arrivals</h2>
                <p className="text-gray-500 text-sm mt-1">Latest additions to our catalog</p>
              </div>
              <Link
                href="/store/search?q="
                className="text-sm font-semibold text-[#077BFF] hover:text-[#0565D4] transition-colors"
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
                  <ProductCard key={product._id} product={product} />
                ))}
              </ProductGrid>
            ) : null}
          </section>

          {/* Shop by Brand */}
          <BrandGrid />

          {/* Bottom CTA banner */}
          <section className="rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-12 text-center">
            <p className="text-[#077BFF] text-sm font-semibold uppercase tracking-wider mb-3">
              Professional Installation Available
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
              Not sure what you need?
            </h2>
            <p className="text-gray-300 text-lg max-w-xl mx-auto mb-8">
              Our experts can help you find the right parts and get them installed. Request a quote today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="px-8 py-3.5 bg-[#077BFF] text-white font-semibold rounded-lg hover:bg-[#0565D4] transition-colors"
              >
                Get a Free Quote
              </Link>
              <a
                href="tel:919-275-8095"
                className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors"
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
