import Link from "next/link";
import {
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandTiktok,
} from "@tabler/icons-react";

const links = [
  { href: "/services", label: "Services" },
  { href: "/store", label: "Parts Store" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

const socials = [
  { href: "https://instagram.com/dealerlifts", icon: IconBrandInstagram, label: "Instagram" },
  { href: "https://facebook.com/dealerlifts", icon: IconBrandFacebook, label: "Facebook" },
  { href: "https://tiktok.com/@dealerlifts", icon: IconBrandTiktok, label: "TikTok" },
];

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block">
              <span className="font-heading text-xl font-bold tracking-wide text-gray-900">
                DEALER<span className="text-[#077BFF]">LIFTS</span>
              </span>
            </Link>
            <p className="mt-3 text-gray-500 text-sm leading-relaxed">
              Premium automotive performance and off-road builds in Raleigh, NC.
            </p>
            <div className="flex gap-3 mt-5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:text-[#077BFF] hover:bg-[#077BFF]/5 transition-colors"
                  aria-label={s.label}
                >
                  <s.icon size={17} />
                </a>
              ))}
            </div>
          </div>

          {/* Pages */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Pages
            </p>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-500 hover:text-gray-900 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Contact
            </p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <a href="tel:919-275-8095" className="hover:text-gray-900 transition-colors">
                  (919) 275-8095
                </a>
              </li>
              <li>
                <a href="mailto:info@dealerlifts.com" className="hover:text-gray-900 transition-colors">
                  info@dealerlifts.com
                </a>
              </li>
              <li>Raleigh, North Carolina</li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Hours
            </p>
            <ul className="space-y-1 text-sm text-gray-500">
              <li className="flex justify-between gap-4">
                <span>Mon&ndash;Fri</span>
                <span className="text-gray-700 font-medium">8am&ndash;6pm</span>
              </li>
              <li className="flex justify-between gap-4">
                <span>Saturday</span>
                <span className="text-gray-700 font-medium">9am&ndash;3pm</span>
              </li>
              <li className="flex justify-between gap-4">
                <span>Sunday</span>
                <span className="text-gray-400">Closed</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-400 text-xs">
            &copy; {new Date().getFullYear()} Dealer Lifts Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
