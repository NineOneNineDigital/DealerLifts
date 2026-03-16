"use client";

import {
  IconBriefcase,
  IconMapPin,
  IconClock,
  IconTool,
  IconUsers,
  IconHeart,
  IconTrophy,
} from "@tabler/icons-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { ApplicationForm } from "@/components/forms/ApplicationForm";

const openPositions = [
  {
    title: "Automotive Mechanic / Technician",
    type: "Full-Time",
    location: "Raleigh, NC",
    description:
      "Experienced mechanic to perform diagnostics, repairs, and maintenance on a variety of vehicles. Must have ASE certification or equivalent experience.",
    requirements: [
      "3+ years automotive repair experience",
      "ASE certification preferred",
      "Own tools required",
      "Valid driver's license",
    ],
  },
  {
    title: "Lift & Suspension Installer",
    type: "Full-Time",
    location: "Raleigh, NC",
    description:
      "Install lift kits, suspension systems, and related components on trucks, Jeeps, and SUVs. Experience with Carli, BDS, Icon, and Fox preferred.",
    requirements: [
      "2+ years lift kit installation experience",
      "Knowledge of major suspension brands",
      "Ability to lift 75+ lbs",
      "Attention to detail",
    ],
  },
  {
    title: "Service Advisor",
    type: "Full-Time",
    location: "Raleigh, NC",
    description:
      "Front-of-house role managing customer interactions, scheduling, estimates, and service coordination. Automotive knowledge required.",
    requirements: [
      "2+ years in automotive service advising",
      "Strong communication skills",
      "Basic automotive knowledge",
      "Experience with shop management software",
    ],
  },
];

const perks = [
  { icon: IconTool, label: "Top-tier brands & parts" },
  { icon: IconUsers, label: "Team-first culture" },
  { icon: IconHeart, label: "Competitive pay & benefits" },
  { icon: IconTrophy, label: "Growth opportunities" },
];

export function CareersContent() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#077BFF] text-sm font-semibold tracking-wide uppercase mb-3">
            Careers
          </p>
          <h1 className="font-heading text-4xl md:text-5xl font-bold">
            Build trucks. Build a career.
          </h1>
          <p className="mt-4 text-gray-500 text-lg max-w-2xl mx-auto">
            We&apos;re always looking for talented, passionate people to join
            the Dealer Lifts crew in Raleigh, NC.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            {perks.map((perk) => (
              <div key={perk.label} className="flex items-center gap-2 text-sm text-gray-500">
                <perk.icon size={16} className="text-[#077BFF]" />
                <span>{perk.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Positions list */}
            <div className="lg:col-span-7 space-y-4">
              <h2 className="font-heading text-2xl font-bold mb-2">
                Open Positions
              </h2>
              {openPositions.map((position) => (
                <ScrollReveal key={position.title}>
                  <div className="border border-gray-100 rounded-lg p-6 hover:border-gray-200 transition-colors">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <h3 className="font-heading text-lg font-bold flex items-center gap-2">
                        <IconBriefcase size={18} className="text-[#077BFF]" />
                        {position.title}
                      </h3>
                      <div className="flex gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <IconClock size={12} />
                          {position.type}
                        </span>
                        <span className="flex items-center gap-1">
                          <IconMapPin size={12} />
                          {position.location}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm mb-4">{position.description}</p>
                    <ul className="flex flex-wrap gap-2">
                      {position.requirements.map((req) => (
                        <li
                          key={req}
                          className="text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded"
                        >
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* Application form */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-28">
                <h2 className="font-heading text-2xl font-bold mb-1">
                  Apply Now
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Interested? Send us your info and we&apos;ll be in touch.
                </p>
                <ApplicationForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
