"use client";

import { Dialog } from "@base-ui/react/dialog";
import {
  IconBriefcase,
  IconClock,
  IconMail,
  IconMapPin,
  IconX,
} from "@tabler/icons-react";
import { useState } from "react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { buttonVariants } from "@/components/ui/button";
import { resolveIcon } from "@/lib/content/icons";
import type { JobPosition } from "@/lib/hygraph";
import type { CareersContentData } from "./defaults";

interface Props {
  content: CareersContentData;
  loadError: string | null;
  positions: JobPosition[];
}

function buildMailto(jobTitle: string, email: string) {
  const subject = encodeURIComponent(`Application: ${jobTitle}`);
  const body = encodeURIComponent(
    `Hi Dealer Lifts team,\n\nI'd like to apply for the ${jobTitle} position. My resume is attached.\n\nThanks,\n`
  );
  return `mailto:${email}?subject=${subject}&body=${body}`;
}

/** Collapse a rich-text plain-text description into a clean single-line teaser
 * for the clamped card preview. Handles both real newlines and literal escape
 * sequences (e.g. a `\n` baked into the CMS text), which otherwise render
 * verbatim in the card. */
function descriptionPreview(text: string) {
  return text
    .replace(/\\[nrt]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function JobMeta({ position }: { position: JobPosition }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 text-gray-400 text-xs">
      {position.jobType ? (
        <span className="flex items-center gap-1">
          <IconClock size={12} />
          {position.jobType}
        </span>
      ) : null}
      {position.location ? (
        <span className="flex items-center gap-1">
          <IconMapPin size={12} />
          {position.location}
        </span>
      ) : null}
      {position.workTime ? (
        <span className="flex items-center gap-1">
          <IconBriefcase size={12} />
          {position.workTime}
        </span>
      ) : null}
    </div>
  );
}

function PositionsList({
  applyEmail,
  positions,
  loadError,
  onOpen,
}: {
  applyEmail: string;
  positions: JobPosition[];
  loadError: string | null;
  onOpen: (id: string) => void;
}) {
  if (loadError) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 text-sm">
        We couldn&apos;t load open positions right now. Please email{" "}
        <a className="underline" href={`mailto:${applyEmail}`}>
          {applyEmail}
        </a>{" "}
        to inquire about opportunities.
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="rounded-lg border border-gray-100 p-8 text-center">
        <p className="font-medium text-gray-600">
          No open positions right now.
        </p>
        <p className="mt-2 text-gray-500 text-sm">
          We&apos;re always interested in meeting talented people. Send your
          resume to{" "}
          <a
            className="text-[#077BFF] hover:underline"
            href={`mailto:${applyEmail}`}
          >
            {applyEmail}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {positions.map((position) => {
        const preview = position.jobDescription?.text
          ? descriptionPreview(position.jobDescription.text)
          : "";
        return (
          <ScrollReveal key={position.id}>
            <button
              className="group w-full rounded-lg border border-gray-100 p-6 text-left transition-all hover:border-gray-300 hover:shadow-sm"
              onClick={() => onOpen(position.id)}
              type="button"
            >
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <h3 className="flex items-center gap-2 font-bold font-heading text-lg transition-colors group-hover:text-[#077BFF]">
                  <IconBriefcase className="text-[#077BFF]" size={18} />
                  {position.name}
                </h3>
                <span className="font-semibold text-[#077BFF] text-xs">
                  View details →
                </span>
              </div>
              <JobMeta position={position} />
              {preview ? (
                <p className="mt-3 line-clamp-2 text-gray-500 text-sm">
                  {preview}
                </p>
              ) : null}
            </button>
          </ScrollReveal>
        );
      })}
    </div>
  );
}

export function CareersContent({ content, positions, loadError }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const openPosition = positions.find((p) => p.id === openId) ?? null;

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="mb-3 font-semibold text-[#077BFF] text-sm uppercase tracking-wide">
            {content.hero.eyebrow}
          </p>
          <h1 className="font-bold font-heading text-4xl md:text-5xl">
            {content.hero.headline}
            {content.hero.headlineAccent && (
              <>
                {" "}
                <span className="bg-gradient-to-r from-[#3D9BFF] via-[#077BFF] to-[#0565D4] bg-clip-text text-transparent">
                  {content.hero.headlineAccent}
                </span>
              </>
            )}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-gray-500 text-lg">
            {content.hero.subhead}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-6">
            {content.perks.map((perk, i) => {
              const Icon = resolveIcon(perk.icon);
              return (
                <div
                  className="flex items-center gap-2 text-gray-500 text-sm"
                  // biome-ignore lint/suspicious/noArrayIndexKey: label alone can collide when CMS perks are mid-edit; index disambiguates
                  key={`${i}-${perk.label}`}
                >
                  <Icon className="text-[#077BFF]" size={16} />
                  <span>{perk.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-bold font-heading text-2xl">
              {content.positionsHeading}
            </h2>
            <a
              className="hidden items-center gap-1.5 text-[#077BFF] text-sm hover:underline sm:inline-flex"
              href={`mailto:${content.applyEmail}`}
            >
              <IconMail size={14} />
              {content.applyEmail}
            </a>
          </div>

          <PositionsList
            applyEmail={content.applyEmail}
            loadError={loadError}
            onOpen={setOpenId}
            positions={positions}
          />
        </div>
      </section>

      {/* Job Details Modal */}
      <Dialog.Root
        onOpenChange={(open) => {
          if (!open) {
            setOpenId(null);
          }
        }}
        open={openPosition !== null}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="data-open:fade-in-0 data-closed:fade-out-0 fixed inset-0 z-50 bg-black/40 duration-150 data-closed:animate-out data-open:animate-in supports-backdrop-filter:backdrop-blur-sm" />
          <Dialog.Popup className="data-open:fade-in-0 data-closed:fade-out-0 data-open:zoom-in-95 data-closed:zoom-out-95 fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100vh-4rem)] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl bg-white shadow-2xl outline-none ring-1 ring-foreground/10 duration-150 data-closed:animate-out data-open:animate-in">
            {openPosition ? (
              <>
                <div className="flex items-start justify-between gap-4 border-gray-100 border-b p-6 pb-4">
                  <div>
                    <Dialog.Title className="font-bold font-heading text-xl">
                      {openPosition.name}
                    </Dialog.Title>
                    <div className="mt-2">
                      <JobMeta position={openPosition} />
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
                  {openPosition.jobDescription?.html ? (
                    <div
                      className="job-description text-gray-600 text-sm leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_a:hover]:text-[#077BFF]/80 [&_a]:text-[#077BFF] [&_a]:underline [&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:font-bold [&_h1]:font-heading [&_h1]:text-gray-900 [&_h1]:text-lg [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:font-bold [&_h2]:font-heading [&_h2]:text-base [&_h2]:text-gray-900 [&_h3]:mt-3 [&_h3]:mb-1.5 [&_h3]:font-bold [&_h3]:font-heading [&_h3]:text-gray-900 [&_h3]:text-sm [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_p]:mb-3 [&_strong]:font-semibold [&_strong]:text-gray-900 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5"
                      // biome-ignore lint/security/noDangerouslySetInnerHtml: Hygraph sanitizes rich-text HTML output server-side
                      dangerouslySetInnerHTML={{
                        __html: openPosition.jobDescription.html,
                      }}
                    />
                  ) : (
                    <p className="text-gray-500 text-sm">
                      Details coming soon. Email us to learn more about this
                      role.
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3 border-gray-100 border-t bg-gray-50/50 p-6 sm:flex-row sm:justify-end">
                  <Dialog.Close
                    className={buttonVariants({ variant: "outline" })}
                  >
                    Close
                  </Dialog.Close>
                  <a
                    className={buttonVariants()}
                    href={buildMailto(openPosition.name, content.applyEmail)}
                  >
                    <IconMail size={16} />
                    Email your application
                  </a>
                </div>
              </>
            ) : null}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
