"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FitmentPanel } from "@/components/store/FitmentPanel";
import { ProductImages } from "@/components/store/ProductImages";
import { ProductInfo } from "@/components/store/ProductInfo";
import { api } from "@/convex/_generated/api";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = useQuery(api.products.getBySlug, { slug });
  const brand = useQuery(
    api.brands.getById,
    product?.brandId ? { id: product.brandId } : "skip"
  );
  const inventory = useQuery(
    api.inventory.getByProductId,
    product ? { productId: product._id } : "skip"
  );

  if (product === undefined) {
    return (
      <div className="pt-32 md:pt-40">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <p className="text-gray-400">Loading product...</p>
        </div>
      </div>
    );
  }

  if (product === null) {
    return (
      <div className="pt-32 md:pt-40">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h1 className="mb-2 font-bold font-heading text-2xl text-gray-900">
            Product Not Found
          </h1>
          <p className="mb-6 text-gray-500">
            The product you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            className="font-medium text-[#077BFF] text-sm hover:underline"
            href="/store"
          >
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 md:pt-40">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-2 text-gray-400 text-sm">
          <Link className="hover:text-gray-900" href="/store">
            Store
          </Link>
          <span>/</span>
          <span className="line-clamp-1 text-gray-900">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
          <ProductImages images={product.images} />
          <ProductInfo
            brandName={brand?.name}
            inStock={inventory?.isInStock ?? true}
            product={product}
          />
        </div>

        <FitmentPanel productId={product._id} />
      </div>
    </div>
  );
}
