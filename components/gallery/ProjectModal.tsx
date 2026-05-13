"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  IconChevronLeft,
  IconChevronRight,
  IconStar,
  IconX,
} from "@tabler/icons-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { CompletedProject } from "@/lib/hygraph";

interface ProjectModalProps {
  project: CompletedProject | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  const [imageIndex, setImageIndex] = useState(0);

  const images = useMemo(() => {
    if (!project) return [] as string[];
    const all = [project.mainImage, ...(project.images ?? [])].filter(
      (src): src is string => Boolean(src)
    );
    return Array.from(new Set(all));
  }, [project]);

  useEffect(() => {
    if (isOpen) setImageIndex(0);
  }, [isOpen, project?.id]);

  const safeIndex =
    images.length === 0
      ? 0
      : Math.min(Math.max(imageIndex, 0), images.length - 1);
  const currentImage = images[safeIndex];

  const goPrev = useCallback(() => {
    setImageIndex((i) => (i > 0 ? i - 1 : i));
  }, []);
  const goNext = useCallback(() => {
    setImageIndex((i) => (i < images.length - 1 ? i + 1 : i));
  }, [images.length]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    document.addEventListener("keydown", handler);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = original;
    };
  }, [isOpen, onClose, goPrev, goNext]);

  const title = project
    ? project.name?.trim() ||
      [project.year, project.make, project.model]
        .filter(Boolean)
        .join(" ")
        .trim()
    : "";

  return (
    <AnimatePresence>
      {isOpen && project && (
        <motion.div
          animate={{ opacity: 1 }}
          aria-labelledby="project-modal-title"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-6"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
        >
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative flex h-full max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl md:flex-row"
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            transition={{ duration: 0.2 }}
          >
            <button
              aria-label="Close project details"
              className="absolute top-3 right-3 z-20 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              onClick={onClose}
              type="button"
            >
              <IconX size={20} />
            </button>

            <div className="relative flex min-w-0 flex-1 flex-col bg-black md:basis-7/12">
              {currentImage ? (
                <div className="relative h-64 w-full sm:h-80 md:h-auto md:flex-1">
                  <Image
                    alt={`${title} — photo ${safeIndex + 1}`}
                    className="object-contain"
                    fill
                    key={currentImage}
                    priority={safeIndex === 0}
                    sizes="(min-width: 768px) 58vw, 100vw"
                    src={currentImage}
                  />

                  {images.length > 1 && (
                    <>
                      {safeIndex > 0 && (
                        <button
                          aria-label="Previous photo"
                          className="-translate-y-1/2 absolute top-1/2 left-3 z-10 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                          onClick={goPrev}
                          type="button"
                        >
                          <IconChevronLeft size={24} />
                        </button>
                      )}
                      {safeIndex < images.length - 1 && (
                        <button
                          aria-label="Next photo"
                          className="-translate-y-1/2 absolute top-1/2 right-3 z-10 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                          onClick={goNext}
                          type="button"
                        >
                          <IconChevronRight size={24} />
                        </button>
                      )}
                      <div className="absolute right-3 bottom-3 rounded-full bg-black/50 px-2.5 py-1 text-white/90 text-xs">
                        {safeIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex h-64 items-center justify-center text-white/50 text-sm md:h-full">
                  No photos available
                </div>
              )}

              {images.length > 1 && (
                <div className="hidden min-w-0 gap-2 overflow-x-auto bg-black px-3 py-3 md:flex">
                  {images.map((src, i) => (
                    <button
                      aria-current={i === safeIndex}
                      aria-label={`View photo ${i + 1}`}
                      className={`relative h-16 w-24 flex-none overflow-hidden rounded transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                        i === safeIndex
                          ? "ring-2 ring-[#077BFF]"
                          : "opacity-60 hover:opacity-100"
                      }`}
                      key={src}
                      onClick={() => setImageIndex(i)}
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

            <div className="flex min-w-0 flex-1 flex-col overflow-y-auto md:basis-5/12">
              <div className="border-gray-100 border-b px-6 pt-6 pb-4">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[#077BFF] text-xs font-semibold uppercase tracking-wide">
                      Completed Build
                    </p>
                    <h2
                      className="mt-1 font-bold font-heading text-2xl text-gray-900"
                      id="project-modal-title"
                    >
                      {title}
                    </h2>
                    {(project.make || project.model || project.year) && (
                      <p className="mt-1 text-gray-500 text-sm">
                        {[project.year, project.make, project.model]
                          .filter(Boolean)
                          .join(" • ")}
                      </p>
                    )}
                  </div>
                  {project.featuredProject && (
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 font-medium text-amber-800 text-xs">
                      <IconStar size={14} />
                      Featured
                    </span>
                  )}
                </div>
              </div>

              <div className="px-6 py-5">
                <h3 className="mb-3 font-semibold text-gray-900 text-sm uppercase tracking-wide">
                  Build Details
                </h3>
                {project.projectDetails?.html ? (
                  <div
                    className="project-details-html text-gray-700 text-sm leading-relaxed"
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: Trusted Hygraph rich-text output
                    dangerouslySetInnerHTML={{
                      __html: project.projectDetails.html,
                    }}
                  />
                ) : (
                  <p className="text-gray-500 text-sm">
                    Details for this build are coming soon.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
