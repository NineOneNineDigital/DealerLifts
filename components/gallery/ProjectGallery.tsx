"use client";

import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

interface ProjectGalleryProps {
  images: string[];
  title: string;
}

export function ProjectGallery({ images, title }: ProjectGalleryProps) {
  const [index, setIndex] = useState(0);

  const safeIndex = images.length === 0 ? 0 : Math.min(index, images.length - 1);
  const current = images[safeIndex];

  const goPrev = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : i));
  }, []);
  const goNext = useCallback(() => {
    setIndex((i) => (i < images.length - 1 ? i + 1 : i));
  }, [images.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [goPrev, goNext]);

  if (!current) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-gray-100 text-gray-400 text-sm">
        No photos available
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-black">
        <Image
          alt={`${title} — photo ${safeIndex + 1}`}
          className="object-contain"
          fill
          key={current}
          priority={safeIndex === 0}
          sizes="(min-width: 1024px) 60vw, 100vw"
          src={current}
        />

        {images.length > 1 && (
          <>
            {safeIndex > 0 && (
              <button
                aria-label="Previous photo"
                className="-translate-y-1/2 absolute top-1/2 left-3 z-10 rounded-full bg-black/50 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                onClick={goPrev}
                type="button"
              >
                <IconChevronLeft size={22} />
              </button>
            )}
            {safeIndex < images.length - 1 && (
              <button
                aria-label="Next photo"
                className="-translate-y-1/2 absolute top-1/2 right-3 z-10 rounded-full bg-black/50 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                onClick={goNext}
                type="button"
              >
                <IconChevronRight size={22} />
              </button>
            )}
            <div className="absolute right-3 bottom-3 rounded-full bg-black/55 px-2.5 py-1 font-medium text-white/90 text-xs backdrop-blur-sm">
              {safeIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-4 flex min-w-0 gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              aria-current={i === safeIndex}
              aria-label={`View photo ${i + 1}`}
              className={`relative h-16 w-24 flex-none overflow-hidden rounded-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#077BFF] ${
                i === safeIndex
                  ? "ring-2 ring-[#077BFF] ring-offset-2"
                  : "opacity-60 hover:opacity-100"
              }`}
              key={src}
              onClick={() => setIndex(i)}
              type="button"
            >
              <Image
                alt=""
                className="object-cover"
                fill
                sizes="96px"
                src={src}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
