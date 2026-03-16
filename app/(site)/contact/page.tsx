import type { Metadata } from "next";
import {
  IconPhone,
  IconMail,
  IconMapPin,
  IconClock,
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandTiktok,
} from "@tabler/icons-react";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { ContactForm } from "@/components/forms/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get a free quote for your next build or schedule service at Dealer Lifts. Call (919) 275-8095 or fill out our online form.",
};

export default function ContactPage() {
  return (
    <>
      <section className="pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#077BFF] text-sm font-semibold tracking-wide uppercase mb-3">
            Get In Touch
          </p>
          <h1 className="font-heading text-4xl md:text-5xl font-bold">
            Let&apos;s talk about your build.
          </h1>
          <p className="mt-4 text-gray-500 text-lg max-w-2xl mx-auto">
            Request a quote, ask a question, or schedule a consultation.
            We typically respond within 24 hours.
          </p>
        </div>
      </section>

      <section className="pb-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Forms */}
            <div className="lg:col-span-2 space-y-10">
              <div>
                <h2 className="font-heading text-2xl font-bold mb-1">
                  Request a Quote
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Tell us about your vehicle and the work you&apos;d like done.
                </p>
                <QuoteForm />
              </div>

              <hr className="border-gray-100" />

              <div>
                <h2 className="font-heading text-2xl font-bold mb-1">
                  General Inquiry
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Have a question? Drop us a message.
                </p>
                <ContactForm />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                  Contact
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <IconPhone size={18} className="text-[#077BFF] mt-0.5 shrink-0" />
                    <a href="tel:919-275-8095" className="text-gray-900 hover:text-[#077BFF] transition-colors font-medium text-sm">
                      (919) 275-8095
                    </a>
                  </li>
                  <li className="flex items-start gap-3">
                    <IconMail size={18} className="text-[#077BFF] mt-0.5 shrink-0" />
                    <a href="mailto:info@dealerlifts.com" className="text-gray-900 hover:text-[#077BFF] transition-colors font-medium text-sm">
                      info@dealerlifts.com
                    </a>
                  </li>
                  <li className="flex items-start gap-3">
                    <IconMapPin size={18} className="text-[#077BFF] mt-0.5 shrink-0" />
                    <span className="text-gray-700 text-sm">Raleigh, North Carolina</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                  <IconClock size={14} />
                  Hours
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="text-gray-500">Mon&ndash;Fri</span>
                    <span className="text-gray-700 font-medium">8am&ndash;6pm</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500">Saturday</span>
                    <span className="text-gray-700 font-medium">9am&ndash;3pm</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500">Sunday</span>
                    <span className="text-gray-400">Closed</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                  Follow Us
                </h3>
                <div className="flex gap-3">
                  {[
                    { href: "https://instagram.com/dealerlifts", icon: IconBrandInstagram, label: "Instagram" },
                    { href: "https://facebook.com/dealerlifts", icon: IconBrandFacebook, label: "Facebook" },
                    { href: "https://tiktok.com/@dealerlifts", icon: IconBrandTiktok, label: "TikTok" },
                  ].map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:text-[#077BFF] hover:bg-[#077BFF]/5 transition-colors"
                      aria-label={social.label}
                    >
                      <social.icon size={17} />
                    </a>
                  ))}
                </div>
              </div>

              <div className="rounded-lg overflow-hidden border border-gray-100">
                <iframe
                  title="Dealer Lifts Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d207478.0567879757!2d-78.8185!3d35.7796!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89ac5a2f9f51e0f7%3A0x6790b6528a11f0ad!2sRaleigh%2C%20NC!5e0!3m2!1sen!2sus!4v1709000000000!5m2!1sen!2sus"
                  width="100%"
                  height="220"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
