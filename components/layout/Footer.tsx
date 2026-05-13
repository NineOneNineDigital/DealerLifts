import Link from "next/link";
import {
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandTiktok,
  IconArrowUpRight,
  IconMapPin,
  IconPhone,
  IconMail,
} from "@tabler/icons-react";

const shopLinks = [
  { href: "/services", label: "Services" },
  { href: "/store", label: "Parts Store" },
  { href: "/gallery", label: "Gallery" },
];

const companyLinks = [
  { href: "/about", label: "About" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

const socials = [
  {
    href: "https://instagram.com/dealerlifts",
    icon: IconBrandInstagram,
    label: "Instagram",
  },
  {
    href: "https://facebook.com/dealerlifts",
    icon: IconBrandFacebook,
    label: "Facebook",
  },
  {
    href: "https://tiktok.com/@dealerlifts",
    icon: IconBrandTiktok,
    label: "TikTok",
  },
];

const MAPS_URL =
  "https://maps.google.com/maps?q=73+Crape+Myrtle+Dr+Benson+NC+27504";

export function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-gray-300">
      {/* CTA strip */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#077BFF]">
                Ready to build?
              </p>
              <p className="mt-1 font-heading text-2xl font-bold text-white sm:text-3xl">
                Let&apos;s spec your next project.
              </p>
            </div>
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 rounded-lg bg-[#077BFF] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#077BFF]/20 transition-all hover:bg-[#0565D4] hover:shadow-[#077BFF]/30"
            >
              Start a quote
              <IconArrowUpRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
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
            <Link href="/" className="inline-block">
              <span className="font-heading text-2xl font-bold tracking-wide text-white">
                DEALER<span className="text-[#077BFF]">LIFTS</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-400">
              Premium automotive performance and off-road builds in Raleigh, NC.
            </p>
            <div className="mt-6 flex gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-gray-400 ring-1 ring-inset ring-white/10 transition-all hover:bg-[#077BFF]/10 hover:text-[#077BFF] hover:ring-[#077BFF]/30"
                  aria-label={s.label}
                >
                  <s.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div className="md:col-span-2">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#077BFF]">
              Shop
            </p>
            <ul className="space-y-2.5">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="md:col-span-2">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#077BFF]">
              Company
            </p>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Visit Us */}
          <div className="col-span-2 md:col-span-4">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#077BFF]">
              Visit Us
            </p>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-start gap-2.5 text-gray-400 transition-colors hover:text-white"
                >
                  <IconMapPin
                    size={16}
                    className="mt-0.5 shrink-0 text-gray-500 transition-colors group-hover:text-[#077BFF]"
                  />
                  <span className="inline-flex items-center gap-1">
                    Raleigh, North Carolina
                    <IconArrowUpRight
                      size={13}
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="tel:919-275-8095"
                  className="group inline-flex items-center gap-2.5 text-gray-400 transition-colors hover:text-white"
                >
                  <IconPhone
                    size={16}
                    className="shrink-0 text-gray-500 transition-colors group-hover:text-[#077BFF]"
                  />
                  (919) 275-8095
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@dealerlifts.com"
                  className="group inline-flex items-center gap-2.5 text-gray-400 transition-colors hover:text-white"
                >
                  <IconMail
                    size={16}
                    className="shrink-0 text-gray-500 transition-colors group-hover:text-[#077BFF]"
                  />
                  info@dealerlifts.com
                </a>
              </li>
            </ul>

            <div className="mt-5 rounded-lg bg-white/5 px-4 py-3 ring-1 ring-inset ring-white/10">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Hours
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                <li className="flex items-center justify-between gap-4">
                  <span className="text-gray-400">Mon&ndash;Fri</span>
                  <span className="font-medium text-white">8am&ndash;5pm</span>
                </li>
                <li className="flex items-center justify-between gap-4">
                  <span className="text-gray-400">Sat &amp; Sun</span>
                  <span className="text-gray-500">Closed</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Dealer Lifts Inc. All rights
            reserved.
          </p>
          <p className="text-xs text-gray-500">
            Site by{" "}
            <a
              href="https://nineoneninedigital.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gray-400 transition-colors hover:text-white"
            >
              NineOneNine Digital
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
