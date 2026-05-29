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
import Image from "next/image";
import Link from "next/link";
import { BrandGrid } from "@/components/store/BrandGrid";
import { BuildTypeGrid } from "@/components/store/BuildTypeGrid";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductGrid } from "@/components/store/ProductGrid";
import { StoreHero } from "@/components/store/StoreHero";
import { VehicleSelector } from "@/components/store/VehicleSelector";
import {
  listBrands,
  listFeaturedProducts,
  listNewProducts,
  listTopLevelCategories,
} from "@/lib/store/source";

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

const CATEGORY_GRADIENTS = [
  "from-blue-500 to-blue-700",
  "from-orange-500 to-red-600",
  "from-emerald-500 to-green-700",
  "from-amber-500 to-yellow-600",
  "from-rose-500 to-red-700",
  "from-teal-500 to-cyan-700",
  "from-purple-500 to-indigo-700",
  "from-pink-500 to-rose-700",
];

export default async function StorePage() {
  const [featured, newArrivals, categories, brands] = await Promise.all([
    listFeaturedProducts(8),
    listNewProducts(4),
    listTopLevelCategories(),
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

          {/* Shop by Build Type */}
          <BuildTypeGrid />

          {/* Featured Products */}
          {featured.length > 0 && (
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
              <ProductGrid>
                {featured.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </ProductGrid>
            </section>
          )}

          {/* Shop by Category */}
          {categories.length > 0 && (
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
                  const gradient =
                    CATEGORY_GRADIENTS[i % CATEGORY_GRADIENTS.length];
                  return (
                    <Link
                      className="group relative aspect-[4/3] overflow-hidden rounded-xl shadow-sm transition-all hover:shadow-lg"
                      href={`/store/categories/${cat.slug}`}
                      key={cat.id}
                    >
                      {cat.image ? (
                        <Image
                          alt={cat.name}
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          src={cat.image}
                        />
                      ) : (
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${gradient}`}
                        >
                          <Icon
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/30 transition-transform duration-500 group-hover:scale-110"
                            size={80}
                          />
                        </div>
                      )}
                      {/* Dark overlay for label legibility */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <h3 className="font-bold font-heading text-base text-white leading-tight">
                          {cat.name}
                        </h3>
                        <p className="mt-0.5 font-medium text-white/80 text-xs">
                          Shop now &rarr;
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

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
                  href="/store/search?q="
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

          {/* Shop by Brand */}
          <BrandGrid brands={brands} />

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
