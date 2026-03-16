"use client";

import Image from "next/image";
import { PriceDisplay } from "./PriceDisplay";
import { useCart } from "@/hooks/useCart";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { IconTrash } from "@tabler/icons-react";

interface CartItemProps {
  id: Id<"cartItems">;
  product: Doc<"products">;
  quantity: number;
}

export function CartItem({ id, product, quantity }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const price = product.mapPrice || product.retailPrice || 0;
  const image = product.thumbnail || product.images[0];

  return (
    <div className="flex gap-4 py-4 border-b border-gray-100">
      <div className="relative w-16 h-16 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden">
        {image ? (
          <Image src={image} alt={product.title} fill className="object-contain p-1" sizes="64px" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300 text-xs">
            No img
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{product.title}</h4>
        <p className="text-xs text-gray-400">{product.partNumber}</p>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center border border-gray-200 rounded">
            <button
              type="button"
              onClick={() => updateQuantity(id, quantity - 1)}
              className="px-2 py-1 text-gray-500 hover:text-gray-900 text-xs"
            >
              -
            </button>
            <span className="px-2 py-1 text-xs font-medium">{quantity}</span>
            <button
              type="button"
              onClick={() => updateQuantity(id, quantity + 1)}
              className="px-2 py-1 text-gray-500 hover:text-gray-900 text-xs"
            >
              +
            </button>
          </div>
          <div className="flex items-center gap-3">
            <PriceDisplay cents={price * quantity} className="text-sm font-bold text-gray-900" />
            <button
              type="button"
              onClick={() => removeItem(id)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <IconTrash size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
