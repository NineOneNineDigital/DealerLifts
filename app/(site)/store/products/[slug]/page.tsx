"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProductImages } from "@/components/store/ProductImages";
import { ProductInfo } from "@/components/store/ProductInfo";
import Link from "next/link";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = useQuery(api.products.getBySlug, { slug });
  const brand = useQuery(
    api.brands.getById,
    product?.brandId ? { id: product.brandId } : "skip",
  );
  const inventory = useQuery(
    api.inventory.getByProductId,
    product ? { productId: product._id } : "skip",
  );

  if (product === undefined) {
    return (
      <div className="pt-32 md:pt-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-gray-400">Loading product...</p>
        </div>
      </div>
    );
  }

  if (product === null) {
    return (
      <div className="pt-32 md:pt-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="font-heading text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
          <p className="text-gray-500 mb-6">The product you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/store" className="text-[#077BFF] hover:underline text-sm font-medium">
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 md:pt-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/store" className="hover:text-gray-900">Store</Link>
          <span>/</span>
          <span className="text-gray-900 line-clamp-1">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <ProductImages images={product.images} />
          <ProductInfo
            product={product}
            brandName={brand?.name}
            inStock={inventory?.isInStock ?? true}
          />
        </div>
      </div>
    </div>
  );
}
