"use client";

import { Dialog } from "@base-ui/react/dialog";
import {
  IconCertificate,
  IconClock24,
  IconShieldCheck,
  IconStar,
  IconTool,
  IconUser,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import Image from "next/image";
import { useState } from "react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { buttonVariants } from "@/components/ui/button";
import type { TeamMember } from "@/lib/hygraph";

const strengths = [
  { icon: IconClock24, label: "30+ Years Experience" },
  { icon: IconStar, label: "100+ Five Star Reviews" },
  { icon: IconCertificate, label: "Certified Technicians" },
  { icon: IconShieldCheck, label: "Warranty Backed" },
  { icon: IconTool, label: "40+ Brand Partners" },
  { icon: IconUsers, label: "Customer First" },
];

interface Props {
  team: TeamMember[];
}

export function AboutContent({ team }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const openMember = team.find((m) => m.id === openId) ?? null;

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="mb-3 font-semibold text-[#077BFF] text-sm uppercase tracking-wide">
            About Us
          </p>
          <h1 className="font-bold font-heading text-4xl md:text-5xl">
            More than a shop — we&apos;re builders.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-gray-500 text-lg">
            30+ years of turning stock trucks into something worth talking
            about. Based in Raleigh, NC.
          </p>
        </div>
      </section>

      {/* Story — asymmetric 2-column */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <ScrollReveal>
              <div>
                <h2 className="mb-6 font-bold font-heading text-3xl">
                  Built on passion, driven by results.
                </h2>
                <div className="space-y-4 text-gray-500 leading-relaxed">
                  <p>
                    Dealer Lifts started over 30 years ago with a simple
                    mission: build the best trucks and off-road vehicles in
                    North Carolina. What began as a small garage operation has
                    grown into a full-service performance shop trusted by
                    hundreds of satisfied customers.
                  </p>
                  <p>
                    We&apos;ve built our reputation on quality workmanship,
                    honest pricing, and a genuine love for what we do. Every
                    vehicle that rolls out of our shop is a testament to our
                    commitment to excellence — from a simple oil change to a
                    complete custom build.
                  </p>
                  <p>
                    With partnerships with over 40 premium brands including
                    Carli Suspension, BDS, Method Race Wheels, Morimoto, and
                    Borla, we have access to the best parts in the industry. And
                    our team of certified technicians knows how to install them
                    right.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right">
              <div className="relative">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                  <Image
                    alt="Dealer Lifts shop"
                    className="object-cover"
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    src="/images/webflow/about-us/65b096218e541bb9aa0a55b9-goldamb12.jpg"
                  />
                </div>
                <div className="absolute -bottom-5 -left-5 rounded-lg bg-[#077BFF] px-5 py-4 text-white">
                  <div className="font-bold font-heading text-3xl leading-none">
                    30+
                  </div>
                  <div className="mt-1 font-semibold text-white/80 text-xs uppercase tracking-wider">
                    Years
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Strengths — horizontal strip */}
      <section className="border-gray-100 border-y bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {strengths.map((item) => (
              <div
                className="flex flex-col items-center gap-2 text-center"
                key={item.label}
              >
                <item.icon className="text-[#077BFF]" size={22} />
                <span className="font-medium text-gray-700 text-sm">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Member Bio Modal */}
      <Dialog.Root
        onOpenChange={(open) => {
          if (!open) {
            setOpenId(null);
          }
        }}
        open={openMember !== null}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="data-open:fade-in-0 data-closed:fade-out-0 fixed inset-0 z-50 bg-black/40 duration-150 data-closed:animate-out data-open:animate-in supports-backdrop-filter:backdrop-blur-sm" />
          <Dialog.Popup className="data-open:fade-in-0 data-closed:fade-out-0 data-open:zoom-in-95 data-closed:zoom-out-95 fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100vh-4rem)] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl bg-white shadow-2xl outline-none ring-1 ring-foreground/10 duration-150 data-closed:animate-out data-open:animate-in">
            {openMember ? (
              <>
                <div className="flex items-start justify-between gap-4 border-gray-100 border-b p-6 pb-4">
                  <div className="flex items-center gap-4">
                    {openMember.image ? (
                      <Image
                        alt={openMember.name}
                        className="h-16 w-16 shrink-0 rounded-full object-cover"
                        height={128}
                        src={openMember.image}
                        width={128}
                      />
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gray-100">
                        <IconUser
                          aria-hidden
                          className="text-gray-400"
                          size={28}
                        />
                      </div>
                    )}
                    <div>
                      <Dialog.Title className="font-bold font-heading text-xl">
                        {openMember.name}
                      </Dialog.Title>
                      {openMember.title ? (
                        <p className="mt-0.5 text-gray-500 text-sm">
                          {openMember.title}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <Dialog.Close
                    aria-label="Close"
                    className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                  >
                    <IconX size={18} />
                  </Dialog.Close>
                </div>

                <div className="overflow-y-auto p-6">
                  {openMember.bio?.html ? (
                    <div
                      className="text-gray-600 text-sm leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_a:hover]:text-[#077BFF]/80 [&_a]:text-[#077BFF] [&_a]:underline [&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:font-bold [&_h1]:font-heading [&_h1]:text-gray-900 [&_h1]:text-lg [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:font-bold [&_h2]:font-heading [&_h2]:text-base [&_h2]:text-gray-900 [&_h3]:mt-3 [&_h3]:mb-1.5 [&_h3]:font-bold [&_h3]:font-heading [&_h3]:text-gray-900 [&_h3]:text-sm [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_p]:mb-3 [&_strong]:font-semibold [&_strong]:text-gray-900 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5"
                      // biome-ignore lint/security/noDangerouslySetInnerHtml: Hygraph sanitizes rich-text HTML output server-side
                      dangerouslySetInnerHTML={{
                        __html: openMember.bio.html,
                      }}
                    />
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No bio available yet.
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3 border-gray-100 border-t bg-gray-50/50 p-6 sm:flex-row sm:justify-end">
                  <Dialog.Close
                    className={buttonVariants({ variant: "outline" })}
                  >
                    Close
                  </Dialog.Close>
                </div>
              </>
            ) : null}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Team */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="mb-3 font-semibold text-[#077BFF] text-sm uppercase tracking-wide">
                The Crew
              </p>
              <h2 className="mb-4 font-bold font-heading text-3xl">
                Meet the team behind the builds.
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Every member of our crew brings real-world experience and a
                passion for getting it right the first time.
              </p>
            </div>

            <div className="lg:col-span-8">
              {team.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  Team members coming soon.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {team.map((member) => {
                    const hasBio = Boolean(member.bio?.html);
                    return (
                      <button
                        className="group flex flex-col overflow-hidden rounded-lg border border-gray-100 text-left transition-all enabled:hover:border-gray-300 enabled:hover:shadow-md disabled:cursor-default"
                        disabled={!hasBio}
                        key={member.id}
                        onClick={() => setOpenId(member.id)}
                        type="button"
                      >
                        {member.image ? (
                          <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
                            <Image
                              alt={member.name}
                              className="object-cover transition-transform duration-300 group-enabled:group-hover:scale-105"
                              fill
                              sizes="(min-width: 1024px) 400px, (min-width: 640px) 45vw, 90vw"
                              src={member.image}
                            />
                          </div>
                        ) : (
                          <div className="flex aspect-square w-full items-center justify-center bg-gray-100">
                            <IconUser
                              aria-hidden
                              className="text-gray-300"
                              size={72}
                            />
                          </div>
                        )}
                        <div className="p-5">
                          <h3 className="font-bold font-heading text-base transition-colors group-enabled:group-hover:text-[#077BFF]">
                            {member.name}
                          </h3>
                          {member.title ? (
                            <p className="mt-0.5 text-gray-500 text-sm">
                              {member.title}
                            </p>
                          ) : null}
                          {hasBio ? (
                            <p className="mt-2 font-semibold text-[#077BFF] text-xs">
                              Read bio →
                            </p>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
