import { IconArrowLeft, IconStar } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectGallery } from "@/components/gallery/ProjectGallery";
import {
  getCompletedProjectBySlug,
  getCompletedProjects,
} from "@/lib/hygraph";

export const revalidate = 60;
export const dynamicParams = true;

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const projects = await getCompletedProjects();
  return projects
    .filter((p) => p.slug)
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getCompletedProjectBySlug(slug);
  if (!project) return { title: "Build not found" };

  const title =
    project.name?.trim() ||
    [project.year, project.make, project.model].filter(Boolean).join(" ");
  const description =
    project.projectDetails?.text?.slice(0, 160) ||
    `Custom build by Dealer Lifts in Eastern NC.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: project.mainImage ? [project.mainImage] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getCompletedProjectBySlug(slug);
  if (!project) notFound();

  const title =
    project.name?.trim() ||
    [project.year, project.make, project.model]
      .filter(Boolean)
      .join(" ")
      .trim();

  const meta = [project.year, project.make, project.model]
    .filter(Boolean)
    .join(" · ");

  const images = Array.from(
    new Set(
      [project.mainImage, ...(project.images ?? [])].filter(
        (src): src is string => Boolean(src)
      )
    )
  );

  return (
    <section className="pt-28 pb-20 md:pt-36 md:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          className="inline-flex items-center gap-1.5 text-gray-500 text-sm transition-colors hover:text-gray-900"
          href="/gallery"
        >
          <IconArrowLeft size={15} />
          Back to gallery
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <ProjectGallery images={images} title={title} />
          </div>

          <div className="lg:col-span-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-[#077BFF] text-xs uppercase tracking-wider">
                Completed Build
              </span>
              {project.featuredProject && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 font-medium text-amber-800 text-xs">
                  <IconStar size={12} />
                  Featured
                </span>
              )}
            </div>

            <h1 className="mt-3 font-bold font-heading text-3xl text-gray-900 leading-tight md:text-4xl">
              {title}
            </h1>
            {meta && <p className="mt-2 text-gray-500 text-base">{meta}</p>}

            <div className="mt-8 border-gray-100 border-t pt-6">
              <h2 className="mb-3 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                Build Details
              </h2>
              {project.projectDetails?.html ? (
                <div
                  className="project-details-html text-gray-700 leading-relaxed"
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: Trusted Hygraph rich-text output
                  dangerouslySetInnerHTML={{
                    __html: project.projectDetails.html,
                  }}
                />
              ) : (
                <p className="text-gray-500">
                  Details for this build are coming soon.
                </p>
              )}
            </div>

            <div className="mt-10 rounded-xl border border-gray-200 bg-gray-50 p-6">
              <p className="font-semibold text-gray-900">
                Want a build like this?
              </p>
              <p className="mt-1 text-gray-500 text-sm">
                Tell us what you&rsquo;re after — we&rsquo;ll put together a
                quote.
              </p>
              <Link
                className="mt-4 inline-flex items-center justify-center rounded-lg bg-[#077BFF] px-5 py-2.5 font-semibold text-sm text-white transition-colors hover:bg-[#0565D4]"
                href="/contact"
              >
                Start a quote
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
