import type { Metadata } from "next";
import { AboutContent } from "./AboutContent";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Dealer Lifts — North Carolina's trusted automotive performance shop with 30+ years of experience. Our story, our team, and our commitment to excellence.",
};

export default function AboutPage() {
  return <AboutContent />;
}
