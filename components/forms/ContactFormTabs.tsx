"use client";

import { useState } from "react";

import { ContactForm } from "@/components/forms/ContactForm";
import { QuoteForm } from "@/components/forms/QuoteForm";

type Tab = "quote" | "general";

const TABS: { id: Tab; label: string; blurb: string }[] = [
  {
    id: "quote",
    label: "Get a Quote",
    blurb: "Tell us about your vehicle and the work you'd like done.",
  },
  {
    id: "general",
    label: "General Question",
    blurb: "Have a question? Drop us a message.",
  },
];

export function ContactFormTabs() {
  const [tab, setTab] = useState<Tab>("quote");
  const active = TABS.find((t) => t.id === tab) ?? TABS[0];

  return (
    <div>
      <div className="mb-6 flex gap-1 border-gray-200 border-b" role="tablist">
        {TABS.map((t) => {
          const isActive = t.id === tab;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setTab(t.id)}
              className={`-mb-px border-b-2 px-4 py-2.5 font-bold font-heading text-sm uppercase tracking-wider transition-colors ${
                isActive
                  ? "border-[#077BFF] text-[#077BFF]"
                  : "border-transparent text-gray-400 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <p className="mb-6 text-gray-500 text-sm">{active.blurb}</p>

      {/* Only the active form is mounted, so exactly one hCaptcha widget renders. */}
      {tab === "quote" ? <QuoteForm /> : <ContactForm />}
    </div>
  );
}
