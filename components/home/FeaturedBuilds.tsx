"use client";

import { IconArrowRight } from "@tabler/icons-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import type { CompletedProject } from "@/lib/hygraph";

interface FeaturedBuildsProps {
  projects: CompletedProject[];
}

function buildTitle(project: CompletedProject): string {
  if (project.name?.trim()) return project.name.trim();
  return [project.year, project.make, project.model]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function buildSubtitle(project: CompletedProject): string {
  const specs = [project.year, project.make, project.model]
    .filter(Boolean)
    .join(" · ");
  if (project.name?.trim() && specs && project.name.trim() !== specs) {
    return specs;
  }
  return "";
}

function getDisplayImage(project: CompletedProject): string | null {
  return project.mainImage ?? project.images?.[0] ?? null;
}

function getLayout(index: number, total: number) {
  if (total === 1) {
    return { span: "lg:col-span-12", aspect: "aspect-[16/9]" };
  }
  if (total === 2) {
    return { span: "lg:col-span-6", aspect: "aspect-[3/2]" };
  }
  // 3+ → bento: large hero on the left, two stacked on the right
  if (index === 0) {
    return {
      span: "lg:col-span-7 lg:row-span-2",
      aspect: "aspect-[4/3] lg:aspect-auto lg:h-full",
    };
  }
  return { span: "lg:col-span-5", aspect: "aspect-[3/2]" };
}

export function FeaturedBuilds({ projects }: FeaturedBuildsProps) {
  if (projects.length === 0) return null;

  return (
    <section className="bg-gray-50 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 font-semibold text-[#077BFF] text-sm uppercase tracking-wide">
                Recent work
              </p>
              <h2 className="font-bold font-heading text-3xl md:text-4xl">
                Featured Builds
              </h2>
            </div>
            <Link
              className="inline-flex items-center gap-1.5 font-semibold text-[#077BFF] text-sm transition-all hover:gap-2.5"
              href="/gallery"
            >
              See all builds
              <IconArrowRight size={15} />
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {projects.map((project, i) => {
            const image = getDisplayImage(project);
            if (!image) return null;
            const title = buildTitle(project);
            const subtitle = buildSubtitle(project);
            const { span, aspect } = getLayout(i, projects.length);

            const href = project.slug
              ? `/gallery/${project.slug}`
              : "/gallery";

            return (
              <ScrollReveal className={span} delay={i * 0.1} key={project.id}>
                <Link className="block h-full" href={href}>
                  <motion.div
                    className={`group relative overflow-hidden rounded-xl ${aspect}`}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <Image
                      alt={title}
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      src={image}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent" />
                    <div className="absolute right-0 bottom-0 left-0 p-5 md:p-6">
                      <h3 className="font-bold font-heading text-lg text-white leading-snug md:text-xl">
                        {title}
                      </h3>
                      {subtitle && (
                        <p className="mt-1 text-sm text-white/70">{subtitle}</p>
                      )}
                    </div>
                  </motion.div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
