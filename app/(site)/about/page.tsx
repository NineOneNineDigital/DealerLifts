import type { Metadata } from "next";
import { getTeamMembers } from "@/lib/hygraph";
import { AboutContent } from "./AboutContent";
import { getAboutContent } from "./content";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const content = await getAboutContent();

  return {
    title: content.seoTitle,
    description: content.seoDescription,
  };
}

export default async function AboutPage() {
  const [content, team] = await Promise.all([
    getAboutContent(),
    getTeamMembers().catch(() => []),
  ]);

  return <AboutContent content={content} team={team} />;
}
