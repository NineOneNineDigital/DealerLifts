import {
  IconArrowUpRight,
  IconMail,
  IconMapPin,
  IconPhone,
} from "@tabler/icons-react";
import Link from "next/link";
import { socialIcon, telHref } from "@/lib/content/site-settings";
import type { SiteSettings } from "@/lib/content/site-settings-defaults";

const shopLinks = [
  { href: "/services", label: "Services" },
  { href: "/shop", label: "Parts Store" },
  { href: "/gallery", label: "Gallery" },
];

const companyLinks = [
  { href: "/about", label: "About" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

/**
 * Closed days render muted rather than emphasised. Matching on the value keeps
 * that distinction working however the owner splits or merges the rows.
 */
function isClosed(value: string): boolean {
  return value.trim().toLowerCase() === "closed";
}

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="bg-[#0a0a0a] text-gray-300">
      {/* CTA strip */}
      <div className="border-white/10 border-b">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="font-semibold text-[#077BFF] text-xs uppercase tracking-wider">
                Ready to build?
              </p>
              <p className="mt-1 font-bold font-heading text-2xl text-white sm:text-3xl">
                Let&apos;s spec your next project.
              </p>
            </div>
            <Link
              className="group inline-flex items-center gap-2 rounded-lg bg-[#077BFF] px-5 py-3 font-semibold text-sm text-white shadow-[#077BFF]/20 shadow-lg transition-all hover:bg-[#0565D4] hover:shadow-[#077BFF]/30"
              href="/contact"
            >
              Start a quote
              <IconArrowUpRight
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                size={16}
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-12 md:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4">
            <Link className="inline-block" href="/">
              <span className="font-bold font-heading text-2xl text-white tracking-wide">
                DEALER<span className="text-[#077BFF]">LIFTS</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-gray-400 text-sm leading-relaxed">
              Premium automotive performance and off-road builds in Eastern NC.
            </p>
            <div className="mt-6 flex gap-2">
              {settings.socials.map((social) => {
                const Icon = socialIcon(social.platform);
                if (!Icon) {
                  return null;
                }
                return (
                  <a
                    aria-label={social.platform}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-gray-400 ring-1 ring-white/10 ring-inset transition-all hover:bg-[#077BFF]/10 hover:text-[#077BFF] hover:ring-[#077BFF]/30"
                    href={social.url}
                    key={social.platform}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Shop */}
          <div className="md:col-span-2">
            <p className="mb-4 font-semibold text-[#077BFF] text-xs uppercase tracking-wider">
              Shop
            </p>
            <ul className="space-y-2.5">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    className="text-gray-400 text-sm transition-colors hover:text-white"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="md:col-span-2">
            <p className="mb-4 font-semibold text-[#077BFF] text-xs uppercase tracking-wider">
              Company
            </p>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    className="text-gray-400 text-sm transition-colors hover:text-white"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Visit Us */}
          <div className="col-span-2 md:col-span-4">
            <p className="mb-4 font-semibold text-[#077BFF] text-xs uppercase tracking-wider">
              Visit Us
            </p>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  className="group inline-flex items-start gap-2.5 text-gray-400 transition-colors hover:text-white"
                  href={settings.mapsUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <IconMapPin
                    className="mt-0.5 shrink-0 text-gray-500 transition-colors group-hover:text-[#077BFF]"
                    size={16}
                  />
                  <span className="inline-flex items-center gap-1">
                    {`${settings.addressStreet}, ${settings.addressCityStateZip}`}
                    <IconArrowUpRight
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                      size={13}
                    />
                  </span>
                </a>
              </li>
              <li>
                <a
                  className="group inline-flex items-center gap-2.5 text-gray-400 transition-colors hover:text-white"
                  href={telHref(settings.phone)}
                >
                  <IconPhone
                    className="shrink-0 text-gray-500 transition-colors group-hover:text-[#077BFF]"
                    size={16}
                  />
                  {settings.phone}
                </a>
              </li>
              <li>
                <a
                  className="group inline-flex items-center gap-2.5 text-gray-400 transition-colors hover:text-white"
                  href={`mailto:${settings.email}`}
                >
                  <IconMail
                    className="shrink-0 text-gray-500 transition-colors group-hover:text-[#077BFF]"
                    size={16}
                  />
                  {settings.email}
                </a>
              </li>
            </ul>

            <div className="mt-5 rounded-lg bg-white/5 px-4 py-3 ring-1 ring-white/10 ring-inset">
              <p className="font-semibold text-gray-500 text-xs uppercase tracking-wider">
                Hours
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                {settings.hours.map((row) => (
                  <li
                    className="flex items-center justify-between gap-4"
                    key={row.label}
                  >
                    <span className="text-gray-400">{row.label}</span>
                    <span
                      className={
                        isClosed(row.value)
                          ? "text-gray-500"
                          : "font-medium text-white"
                      }
                    >
                      {row.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-white/10 border-t">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-gray-500 text-xs">
            &copy; {new Date().getFullYear()} Dealer Lifts Inc. All rights
            reserved.
          </p>
          <p className="text-gray-500 text-xs">
            Site by{" "}
            <a
              className="font-medium text-gray-400 transition-colors hover:text-white"
              href="https://nineoneninedigital.com"
              rel="noopener noreferrer"
              target="_blank"
            >
              NineOneNine Digital
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
