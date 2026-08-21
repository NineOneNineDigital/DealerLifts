import type { Metadata } from "next";
import { getJobPositions } from "@/lib/hygraph";
import { CareersContent } from "./CareersContent";
import { getCareersContent } from "./content";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const content = await getCareersContent();

  return {
    title: content.seoTitle,
    description: content.seoDescription,
  };
}

export default async function CareersPage() {
  const content = await getCareersContent();

  let positions: Awaited<ReturnType<typeof getJobPositions>> = [];
  let loadError: string | null = null;

  try {
    positions = await getJobPositions();
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Failed to load positions";
  }

  return (
    <CareersContent
      content={content}
      loadError={loadError}
      positions={positions}
    />
  );
}
