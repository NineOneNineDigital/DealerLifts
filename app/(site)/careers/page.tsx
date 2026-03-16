import type { Metadata } from "next";
import { CareersContent } from "./CareersContent";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Join the Dealer Lifts team. We're looking for passionate automotive technicians, fabricators, and service professionals in Raleigh, NC.",
};

export default function CareersPage() {
  return <CareersContent />;
}
