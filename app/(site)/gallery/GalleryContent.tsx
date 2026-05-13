"use client";

import { AnimatePresence, motion } from "framer-motion";
import { IconCamera } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { CompletedProject } from "@/lib/hygraph";

const categories = ["All", "Trucks", "Jeeps", "SUVs", "Other"] as const;
type Category = (typeof categories)[number];

const TRUCK_PATTERNS =
  /\b(f-?\d{3}|silverado|sierra|colorado|tundra|tacoma|ram|1500|2500|3500|titan|ridgeline|maverick|canyon|frontier|gladiator)\b/;
const SUV_PATTERNS =
  /\b(bronco|4runner|tahoe|suburban|escalade|sequoia|yukon|expedition|land cruiser|defender|wagoneer|cherokee|range rover)\b/;

function getVehicleType(project: CompletedProject): Category {
  const make = (project.make ?? "").trim().toLowerCase();
  const model = (project.model ?? "").trim().toLowerCase();
  if (make === "jeep") return "Jeeps";
  if (TRUCK_PATTERNS.test(model)) return "Trucks";
  if (SUV_PATTERNS.test(model)) return "SUVs";
  return "Other";
}

function buildTitle(project: CompletedProject): string {
  if (project.name?.trim()) return project.name.trim();
  return [project.year, project.make, project.model]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function getDisplayImage(project: CompletedProject): string | null {
  return project.mainImage ?? project.images?.[0] ?? null;
}

function getPhotoCount(project: CompletedProject): number {
  const all = [project.mainImage, ...(project.images ?? [])].filter(Boolean);
  return new Set(all).size;
}

interface GalleryContentProps {
  projects: CompletedProject[];
}

export function GalleryContent({ projects }: GalleryContentProps) {
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const visibleProjects = useMemo(() => {
    const withImages = projects.filter((p) => getDisplayImage(p) && p.slug);
    return withImages.slice().sort((a, b) => {
      if (a.featuredProject && !b.featuredProject) return -1;
      if (!a.featuredProject && b.featuredProject) return 1;
      return (b.year ?? 0) - (a.year ?? 0);
    });
  }, [projects]);

  const filtered = useMemo(() => {
    if (activeCategory === "All") return visibleProjects;
    return visibleProjects.filter((p) => getVehicleType(p) === activeCategory);
  }, [visibleProjects, activeCategory]);

  const counts = useMemo(() => {
    const map: Record<Category, number> = {
      All: visibleProjects.length,
      Trucks: 0,
      Jeeps: 0,
      SUVs: 0,
      Other: 0,
    };
    for (const p of visibleProjects) {
      map[getVehicleType(p)]++;
    }
    return map;
  }, [visibleProjects]);

  return (
    <section className="bg-white pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              aria-pressed={activeCategory === cat}
              className={`rounded px-4 py-1.5 font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#077BFF] focus-visible:ring-offset-2 ${
                activeCategory === cat
                  ? "bg-[#077BFF] text-white"
                  : "bg-gray-100 text-gray-500 hover:text-gray-900"
              }`}
              key={cat}
              onClick={() => setActiveCategory(cat)}
              type="button"
            >
              {cat}
              <span className="ml-1.5 text-xs opacity-70">{counts[cat]}</span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="py-20 text-center text-gray-500">
            No builds in this category yet — check back soon.
          </p>
        ) : (
          <div className="columns-1 gap-4 space-y-4 sm:columns-2 lg:columns-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((project) => {
                const image = getDisplayImage(project);
                if (!image) return null;
                const title = buildTitle(project);
                const photoCount = getPhotoCount(project);
                return (
                  <motion.div
                    animate={{ opacity: 1, scale: 1 }}
                    className="break-inside-avoid rounded-lg"
                    exit={{ opacity: 0, scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    key={project.id}
                    layout
                    transition={{ duration: 0.25 }}
                  >
                    <Link
                      aria-label={`View ${title} build details`}
                      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#077BFF] focus-visible:ring-offset-2 rounded-lg"
                      href={`/gallery/${project.slug}`}
                    >
                      <div className="relative overflow-hidden rounded-lg">
                        <Image
                          alt={title}
                          className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          height={600}
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          src={image}
                          width={800}
                        />
                        {photoCount > 1 && (
                          <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 font-medium text-white text-xs backdrop-blur-sm">
                            <IconCamera size={12} />
                            {photoCount}
                          </span>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                          <div className="absolute right-4 bottom-4 left-4">
                            <h4 className="font-bold font-heading text-base text-white">
                              {title}
                            </h4>
                            <p className="mt-1 font-medium text-white/80 text-xs uppercase tracking-wide">
                              View build details →
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
