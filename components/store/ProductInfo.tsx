"use client";

import { useState } from "react";
import { PriceDisplay } from "./PriceDisplay";
import { StockBadge } from "./StockBadge";
import { useCart } from "@/hooks/useCart";
import type { Doc } from "@/convex/_generated/dataModel";

interface ProductInfoProps {
  product: Doc<"products">;
  brandName?: string;
  inStock?: boolean;
}

export function ProductInfo({ product, brandName, inStock = true }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const price = product.mapPrice || product.retailPrice;

  return (
    <div className="space-y-5">
      {brandName && (
        <p className="text-sm text-[#077BFF] font-medium uppercase tracking-wider">{brandName}</p>
      )}
      <h1 className="font-heading text-2xl md:text-3xl font-bold text-gray-900">
        {product.title}
      </h1>
      <p className="text-sm text-gray-400">Part # {product.partNumber}</p>

      <div className="flex items-center gap-3">
        {price ? (
          <PriceDisplay cents={price} className="text-3xl font-bold text-gray-900" />
        ) : (
          <span className="text-lg text-gray-500">Contact for pricing</span>
        )}
        <StockBadge inStock={inStock} />
      </div>

      {product.description && (
        <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <div className="flex items-center border border-gray-200 rounded-lg">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 py-2 text-gray-500 hover:text-gray-900 transition-colors"
          >
            -
          </button>
          <span className="px-3 py-2 text-sm font-medium min-w-[2.5rem] text-center">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="px-3 py-2 text-gray-500 hover:text-gray-900 transition-colors"
          >
            +
          </button>
        </div>
        <button
          type="button"
          onClick={() => addItem(product._id, quantity)}
          disabled={!inStock}
          className="flex-1 px-6 py-3 bg-[#077BFF] text-white font-heading font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-[#0565D4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {inStock ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </div>
  );
}
