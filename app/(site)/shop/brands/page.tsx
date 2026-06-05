import Link from "next/link";
import { BrandCardRich } from "@/components/store/BrandCardRich";
import { listBrandsWithCategories } from "@/lib/store/source";

export default async function BrandsPage() {
  const brands = await listBrandsWithCategories();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#077BFF] via-[#0565D4] to-[#044AAF] pt-32 pb-12 md:pt-40 md:pb-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center gap-2 text-blue-200 text-sm">
            <Link className="transition-colors hover:text-white" href="/shop">
              Shop
            </Link>
            <span>/</span>
            <span className="text-white">Brands</span>
          </div>
          <h1 className="font-bold font-heading text-4xl text-white tracking-tight md:text-5xl">
            All Brands
          </h1>
          <p className="mt-3 max-w-2xl text-blue-100 text-lg">
            Shop parts from {brands.length} trusted manufacturers we carry —
            from suspension and air ride to bumpers, lighting, and recovery
            gear.
          </p>
        </div>
      </section>

      {/* Brand grid */}
      <div className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {brands.map((brand) => (
              <BrandCardRich brand={brand} key={brand.id} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
