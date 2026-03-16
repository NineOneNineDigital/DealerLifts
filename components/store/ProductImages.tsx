"use client";

import { useState } from "react";
import Image from "next/image";

export function ProductImages({ images }: { images: string[] }) {
  const [selected, setSelected] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-gray-50 rounded-xl flex items-center justify-center text-gray-300">
        No Image Available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden">
        <Image
          src={images[selected]}
          alt="Product image"
          fill
          unoptimized
          className="object-contain p-6"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={() => setSelected(i)}
              className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 ${
                i === selected ? "border-[#077BFF]" : "border-gray-200"
              }`}
            >
              <Image
                src={img}
                alt={`Thumbnail ${i + 1}`}
                fill
                unoptimized
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
