"use client";

import {
  IconCar,
  IconCheck,
  IconHeart,
  IconHeartFilled,
  IconPhoto,
  IconShoppingCart,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import type { NormalizedProduct } from "@/lib/store/types";
import { PriceDisplay } from "./PriceDisplay";
import { StockBadge } from "./StockBadge";

interface ProductCardProps {
  brandName?: string | null;
  fitsVehicle?: boolean;
  inStock?: boolean;
  product: NormalizedProduct;
}

export function ProductCard({
  product,
  brandName,
  inStock = true,
  fitsVehicle = false,
}: ProductCardProps) {
  const image = product.thumbnail ?? product.images[0] ?? null;
  const { addItem } = useCart();
  const { isSaved, toggle } = useWishlist();
  const [added, setAdded] = useState(false);

  const saved = isSaved(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) {
      return;
    }
    addItem(product.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
  };

  const displayPrice = product.mapPrice ?? product.retailPrice;
  const compareAt = product.compareAtPriceCents;
  const onSale =
    displayPrice != null && compareAt != null && compareAt > displayPrice;
  const savingsPct = onSale
    ? Math.round(((compareAt - displayPrice) / compareAt) * 100)
    : 0;

  let addToCartClass = "cursor-not-allowed bg-gray-100 text-gray-400";
  if (added) {
    addToCartClass = "bg-green-500 text-white";
  } else if (inStock) {
    addToCartClass = "bg-[#077BFF] text-white hover:bg-[#0565D4]";
  }

  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md">
      {fitsVehicle && (
        <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 rounded-full bg-green-600 px-2 py-0.5 font-semibold text-[10px] text-white uppercase tracking-wide shadow-sm">
          <IconCar size={11} />
          Fits your vehicle
        </div>
      )}
      {/* Wishlist toggle */}
      <button
        aria-label={saved ? "Remove from saved" : "Save for later"}
        aria-pressed={saved}
        className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-sm backdrop-blur transition-colors hover:bg-white hover:text-rose-500"
        onClick={handleToggleSave}
        type="button"
      >
        {saved ? (
          <IconHeartFilled className="text-rose-500" size={17} />
        ) : (
          <IconHeart size={17} />
        )}
      </button>

      <Link className="block" href={`/shop/products/${product.slug}`}>
        <div className="relative aspect-square bg-gray-50">
          {onSale && (
            <span
              className={`absolute left-3 z-[1] inline-flex items-center rounded-full bg-rose-600 px-2 py-0.5 font-bold text-[11px] text-white shadow-sm ${
                fitsVehicle ? "top-9" : "top-3"
              }`}
            >
              Save {savingsPct}%
            </span>
          )}
          {image ? (
            <Image
              alt={product.title}
              className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
              fill
              src={image}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1.5 text-gray-300">
              <IconPhoto size={32} stroke={1.5} />
              <span className="font-medium text-xs">No image</span>
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
            {displayPrice != null ? (
              <div className="flex items-baseline gap-2">
                <PriceDisplay
                  cents={displayPrice}
                  className={`font-bold text-lg ${onSale ? "text-rose-600" : "text-gray-900"}`}
                />
                {onSale && (
                  <PriceDisplay
                    cents={compareAt}
                    className="text-gray-400 text-sm line-through"
                  />
                )}
              </div>
            ) : (
              <span className="text-gray-400 text-sm">Contact for price</span>
            )}
            <StockBadge inStock={inStock} />
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4 transition-all duration-200 md:translate-y-1 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
        <button
          className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 font-semibold text-sm transition-colors ${addToCartClass}`}
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
