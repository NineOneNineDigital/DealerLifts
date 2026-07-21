"use client";

import { AnimatePresence, motion } from "framer-motion";
import { IconSparkles, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function NewSiteBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = original;
    };
  }, [open]);

  return (
    <>
      {/* Banner bar */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed inset-x-0 top-0 z-[60] flex h-10 w-full items-center justify-center gap-2 bg-[#077BFF] px-4 text-white transition-colors hover:bg-[#0668d8]"
        aria-label="Learn about the new DealerLifts website"
      >
        <IconSparkles size={16} className="shrink-0" />
        <span className="truncate text-xs font-medium sm:text-sm">
          <span className="font-semibold">Welcome to the new DealerLifts</span>
          <span className="hidden sm:inline">
            {" "}
            — new site &amp; online store. We&apos;re still ironing things out —{" "}
          </span>
          <span className="sm:hidden"> — </span>
          <span className="underline underline-offset-2">
            tap to learn more
          </span>
        </span>
      </button>

      {/* Info modal */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-[70] bg-black/50"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="new-site-title"
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl"
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="absolute top-4 right-4 p-1 text-gray-400 transition-colors hover:text-gray-900"
                  aria-label="Close"
                >
                  <IconX size={20} />
                </button>

                <div className="px-6 py-7 sm:px-8">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#077BFF]/10 text-[#077BFF]">
                    <IconSparkles size={22} />
                  </div>

                  <h2
                    id="new-site-title"
                    className="font-bold font-heading text-2xl text-gray-900"
                  >
                    Welcome to our new website
                  </h2>

                  <div className="mt-3 space-y-3 text-gray-600 text-sm leading-relaxed">
                    <p>
                      We&apos;ve just launched a brand-new DealerLifts website
                      and online store — a faster, easier way to browse our
                      products, find parts that fit your vehicle, and order
                      online.
                    </p>
                    <p>
                      Since it&apos;s new, we&apos;re still ironing things out.
                      If you run into anything that looks off or have a question,
                      we&apos;d genuinely love to hear from you — your feedback
                      helps us make it better.
                    </p>
                    <p>Thanks for bearing with us as we get everything dialed in.</p>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href="/contact"
                      onClick={() => setOpen(false)}
                      className="flex-1 rounded-lg bg-[#077BFF] px-4 py-2.5 text-center font-medium text-sm text-white transition-colors hover:bg-[#0668d8]"
                    >
                      Send feedback
                    </Link>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-center font-medium text-gray-700 text-sm transition-colors hover:bg-gray-50"
                    >
                      Got it
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
