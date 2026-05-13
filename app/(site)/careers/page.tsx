import type { Metadata } from "next";
import { getJobPositions } from "@/lib/hygraph";
import { CareersContent } from "./CareersContent";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Join the Dealer Lifts team. We're looking for passionate automotive technicians, fabricators, and service professionals in Raleigh, NC.",
};

export const revalidate = 60;

export default async function CareersPage() {
  let positions: Awaited<ReturnType<typeof getJobPositions>> = [];
  let loadError: string | null = null;

  try {
    positions = await getJobPositions();
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Failed to load positions";
  }

  return <CareersContent loadError={loadError} positions={positions} />;
}
