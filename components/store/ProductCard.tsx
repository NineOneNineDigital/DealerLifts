"use client";

import { IconCar, IconCheck, IconShoppingCart } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Doc } from "@/convex/_generated/dataModel";
import { useCart } from "@/hooks/useCart";
import { PriceDisplay } from "./PriceDisplay";
import { StockBadge } from "./StockBadge";

interface ProductCardProps {
  brandName?: string;
  fitsVehicle?: boolean;
  inStock?: boolean;
  product: Doc<"products">;
}

export function ProductCard({
  product,
  brandName,
  inStock = true,
  fitsVehicle = false,
}: ProductCardProps) {
  const image = product.thumbnail || product.images[0];
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) {
      return;
    }
    addItem(product._id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md">
      {fitsVehicle && (
        <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 rounded-full bg-green-600 px-2 py-0.5 font-semibold text-[10px] text-white uppercase tracking-wide shadow-sm">
          <IconCar size={11} />
          Fits your vehicle
        </div>
      )}
      <Link className="block" href={`/store/products/${product.slug}`}>
        <div className="relative aspect-square bg-gray-50">
          {image ? (
            <Image
              alt={product.title}
              className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
              fill
              src={image}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300 text-sm">
              No Image
            </div>
          )}
        </div>
        <div className="p-4 pb-3">
          {brandName && (
            <p className="mb-1 text-gray-400 text-xs uppercase tracking-wider">
              {brandName}
            </p>
          )}
          <h3 className="line-clamp-2 font-medium text-gray-900 text-sm transition-colors group-hover:text-[#077BFF]">
            {product.title}
          </h3>
          <p className="mt-1 text-gray-400 text-xs">{product.partNumber}</p>
          <div className="mt-3 flex items-center justify-between">
            {product.mapPrice ? (
              <PriceDisplay
                cents={product.mapPrice}
                className="font-bold text-gray-900 text-lg"
              />
            ) : product.retailPrice ? (
              <PriceDisplay
                cents={product.retailPrice}
                className="font-bold text-gray-900 text-lg"
              />
            ) : (
              <span className="text-gray-400 text-sm">Contact for price</span>
            )}
            <StockBadge inStock={inStock} />
          </div>
        </div>
      </Link>

      {/* Add to Cart button — always visible on mobile, hover-revealed on desktop */}
      <div className="px-4 pb-4 transition-all duration-200 md:translate-y-1 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
        <button
          className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 font-semibold text-sm transition-colors ${
            added
              ? "bg-green-500 text-white"
              : inStock
                ? "bg-[#077BFF] text-white hover:bg-[#0565D4]"
                : "cursor-not-allowed bg-gray-100 text-gray-400"
          }`}
          disabled={!inStock}
          onClick={handleAddToCart}
          type="button"
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
