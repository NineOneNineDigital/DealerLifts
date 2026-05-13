import type { Metadata } from "next";
import { getTeamMembers } from "@/lib/hygraph";
import { AboutContent } from "./AboutContent";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Dealer Lifts — North Carolina's trusted automotive performance shop with 30+ years of experience. Our story, our team, and our commitment to excellence.",
};

export const revalidate = 60;

export default async function AboutPage() {
  let team: Awaited<ReturnType<typeof getTeamMembers>> = [];

  try {
    team = await getTeamMembers();
  } catch {
    team = [];
  }

  return <AboutContent team={team} />;
}
