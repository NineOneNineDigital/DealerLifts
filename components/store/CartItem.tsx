"use client";

import { IconTrash } from "@tabler/icons-react";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";
import type { NormalizedCartItem } from "@/lib/store/types";
import { PriceDisplay } from "./PriceDisplay";

interface CartItemProps {
  item: NormalizedCartItem;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex gap-4 border-gray-100 border-b py-4">
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50">
        {item.productImage ? (
          <Image
            alt={item.productTitle}
            className="object-contain p-1"
            fill
            sizes="64px"
            src={item.productImage}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300 text-xs">
            No img
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="line-clamp-1 font-medium text-gray-900 text-sm">
          {item.productTitle}
        </h4>
        <p className="text-gray-400 text-xs">{item.partNumber}</p>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center rounded border border-gray-200">
            <button
              className="px-2 py-1 text-gray-500 text-xs hover:text-gray-900"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              type="button"
            >
              -
            </button>
            <span className="px-2 py-1 font-medium text-xs">
              {item.quantity}
            </span>
            <button
              className="px-2 py-1 text-gray-500 text-xs hover:text-gray-900"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              type="button"
            >
              +
            </button>
          </div>
          <div className="flex items-center gap-3">
            <PriceDisplay
              cents={item.priceCents * item.quantity}
              className="font-bold text-gray-900 text-sm"
            />
            <button
              className="text-gray-400 transition-colors hover:text-red-500"
              onClick={() => removeItem(item.id)}
              type="button"
            >
              <IconTrash size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
