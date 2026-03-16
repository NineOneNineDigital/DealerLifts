"use client";

import {
  IconClock24,
  IconStar,
  IconCertificate,
  IconShieldCheck,
  IconTool,
  IconUsers,
} from "@tabler/icons-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

const strengths = [
  { icon: IconClock24, label: "30+ Years Experience" },
  { icon: IconStar, label: "100+ Five Star Reviews" },
  { icon: IconCertificate, label: "Certified Technicians" },
  { icon: IconShieldCheck, label: "Warranty Backed" },
  { icon: IconTool, label: "40+ Brand Partners" },
  { icon: IconUsers, label: "Customer First" },
];

const team = [
  { initials: "DL", name: "Owner / Lead Technician", role: "Founder & Master Builder", years: "30+ years" },
  { initials: "SM", name: "Service Manager", role: "Operations & Customer Relations", years: "15+ years" },
  { initials: "LM", name: "Lead Mechanic", role: "Performance & Suspension Specialist", years: "20+ years" },
  { initials: "FT", name: "Fabrication Tech", role: "Custom Fabrication & Welding", years: "12+ years" },
];

export function AboutContent() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#077BFF] text-sm font-semibold tracking-wide uppercase mb-3">
            About Us
          </p>
          <h1 className="font-heading text-4xl md:text-5xl font-bold">
            More than a shop — we&apos;re builders.
          </h1>
          <p className="mt-4 text-gray-500 text-lg max-w-2xl mx-auto">
            30+ years of turning stock trucks into something worth
            talking about. Based in Raleigh, NC.
          </p>
        </div>
      </section>

      {/* Story — asymmetric 2-column */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal>
              <div>
                <h2 className="font-heading text-3xl font-bold mb-6">
                  Built on passion, driven by results.
                </h2>
                <div className="space-y-4 text-gray-500 leading-relaxed">
                  <p>
                    Dealer Lifts started over 30 years ago with a simple mission:
                    build the best trucks and off-road vehicles in North Carolina.
                    What began as a small garage operation has grown into a
                    full-service performance shop trusted by hundreds of satisfied
                    customers.
                  </p>
                  <p>
                    We&apos;ve built our reputation on quality workmanship, honest
                    pricing, and a genuine love for what we do. Every vehicle that
                    rolls out of our shop is a testament to our commitment to
                    excellence — from a simple oil change to a complete custom build.
                  </p>
                  <p>
                    With partnerships with over 40 premium brands including Carli
                    Suspension, BDS, Method Race Wheels, Morimoto, and Borla, we
                    have access to the best parts in the industry. And our team of
                    certified technicians knows how to install them right.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right">
              <div className="relative">
                <div className="aspect-[4/3] rounded-lg overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=800&q=80"
                    alt="Dealer Lifts shop"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-5 -left-5 bg-[#077BFF] text-white px-5 py-4 rounded-lg">
                  <div className="text-3xl font-heading font-bold leading-none">30+</div>
                  <div className="text-xs font-semibold uppercase tracking-wider mt-1 text-white/80">
                    Years
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Strengths — horizontal strip */}
      <section className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {strengths.map((item) => (
              <div key={item.label} className="flex flex-col items-center text-center gap-2">
                <item.icon size={22} className="text-[#077BFF]" />
                <span className="text-gray-700 text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <p className="text-[#077BFF] text-sm font-semibold tracking-wide uppercase mb-3">
                The Crew
              </p>
              <h2 className="font-heading text-3xl font-bold mb-4">
                Meet the team behind the builds.
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Every member of our crew brings real-world experience and a
                passion for getting it right the first time.
              </p>
            </div>

            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {team.map((member) => (
                  <div
                    key={member.name}
                    className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-gray-400">{member.initials}</span>
                    </div>
                    <div>
                      <h3 className="font-heading text-sm font-bold">{member.name}</h3>
                      <p className="text-gray-500 text-xs">{member.role}</p>
                      <p className="text-[#077BFF] text-xs font-medium mt-0.5">{member.years}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
