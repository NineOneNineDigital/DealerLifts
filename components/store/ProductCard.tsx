"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconShoppingCart, IconCheck } from "@tabler/icons-react";
import { PriceDisplay } from "./PriceDisplay";
import { StockBadge } from "./StockBadge";
import { useCart } from "@/hooks/useCart";
import type { Doc } from "@/convex/_generated/dataModel";

interface ProductCardProps {
  product: Doc<"products">;
  brandName?: string;
  inStock?: boolean;
}

export function ProductCard({ product, brandName, inStock = true }: ProductCardProps) {
  const image = product.thumbnail || product.images[0];
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    addItem(product._id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/store/products/${product.slug}`} className="block">
        <div className="relative aspect-square bg-gray-50">
          {image ? (
            <Image
              src={image}
              alt={product.title}
              fill
              unoptimized
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-300 text-sm">
              No Image
            </div>
          )}
        </div>
        <div className="p-4 pb-3">
          {brandName && (
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{brandName}</p>
          )}
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-[#077BFF] transition-colors">
            {product.title}
          </h3>
          <p className="text-xs text-gray-400 mt-1">{product.partNumber}</p>
          <div className="flex items-center justify-between mt-3">
            {product.mapPrice ? (
              <PriceDisplay cents={product.mapPrice} className="text-lg font-bold text-gray-900" />
            ) : product.retailPrice ? (
              <PriceDisplay cents={product.retailPrice} className="text-lg font-bold text-gray-900" />
            ) : (
              <span className="text-sm text-gray-400">Contact for price</span>
            )}
            <StockBadge inStock={inStock} />
          </div>
        </div>
      </Link>

      {/* Add to Cart button — always visible on mobile, hover-revealed on desktop */}
      <div className="px-4 pb-4 md:opacity-0 md:translate-y-1 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-200">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!inStock}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            added
              ? "bg-green-500 text-white"
              : inStock
                ? "bg-[#077BFF] hover:bg-[#0565D4] text-white"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {added ? (
            <>
              <IconCheck size={16} />
              Added
            </>
          ) : (
            <>
              <IconShoppingCart size={16} />
              {inStock ? "Add to Cart" : "Out of Stock"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
