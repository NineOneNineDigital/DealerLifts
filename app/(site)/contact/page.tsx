import {
  IconClock,
  IconMail,
  IconMapPin,
  IconPhone,
} from "@tabler/icons-react";
import type { Metadata } from "next";
import { ContactFormTabs } from "@/components/forms/ContactFormTabs";
import {
  getSiteSettings,
  socialIcon,
  telHref,
} from "@/lib/content/site-settings";
import { getContactContent } from "./content";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContactContent();

  return {
    title: content.seoTitle,
    description: content.seoDescription,
  };
}

export default async function ContactPage() {
  const [content, settings] = await Promise.all([
    getContactContent(),
    getSiteSettings(),
  ]);
  const { hero } = content;

  return (
    <>
      <section className="pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="mb-3 font-semibold text-[#077BFF] text-sm uppercase tracking-wide">
            {hero.eyebrow}
          </p>
          <h1 className="font-bold font-heading text-4xl md:text-5xl">
            {hero.headline}
            {hero.headlineAccent && (
              <>
                {" "}
                <span className="bg-gradient-to-r from-[#3D9BFF] via-[#077BFF] to-[#0565D4] bg-clip-text text-transparent">
                  {hero.headlineAccent}
                </span>
              </>
            )}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-gray-500 text-lg">
            {hero.subhead}
          </p>
        </div>
      </section>

      <section className="bg-white pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {/* Forms */}
            <div className="lg:col-span-2">
              <ContactFormTabs phone={settings.phone} />
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              <div>
                <h3 className="mb-4 font-semibold text-gray-400 text-xs uppercase tracking-wider">
                  Contact
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <IconPhone
                      className="mt-0.5 shrink-0 text-[#077BFF]"
                      size={18}
                    />
                    <a
                      className="font-medium text-gray-900 text-sm transition-colors hover:text-[#077BFF]"
                      href={telHref(settings.phone)}
                    >
                      {settings.phone}
                    </a>
                  </li>
                  <li className="flex items-start gap-3">
                    <IconMail
                      className="mt-0.5 shrink-0 text-[#077BFF]"
                      size={18}
                    />
                    <a
                      className="font-medium text-gray-900 text-sm transition-colors hover:text-[#077BFF]"
                      href={`mailto:${settings.email}`}
                    >
                      {settings.email}
                    </a>
                  </li>
                  <li className="flex items-start gap-3">
                    <IconMapPin
                      className="mt-0.5 shrink-0 text-[#077BFF]"
                      size={18}
                    />
                    <span className="text-gray-700 text-sm">
                      {settings.addressStreet}
                      <br />
                      {settings.addressCityStateZip}
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-400 text-xs uppercase tracking-wider">
                  <IconClock size={14} />
                  Hours
                </h3>
                <ul className="space-y-2 text-sm">
                  {settings.hours.map((row) => (
                    <li className="flex justify-between" key={row.label}>
                      <span className="text-gray-500">{row.label}</span>
                      <span
                        className={
                          row.value.trim().toLowerCase() === "closed"
                            ? "text-gray-400"
                            : "font-medium text-gray-700"
                        }
                      >
                        {row.value}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-4 font-semibold text-gray-400 text-xs uppercase tracking-wider">
                  Follow Us
                </h3>
                <div className="flex gap-3">
                  {settings.socials.map((social) => {
                    const Icon = socialIcon(social.platform);
                    if (!Icon) {
                      return null;
                    }
                    return (
                      <a
                        aria-label={social.platform}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-400 transition-colors hover:bg-[#077BFF]/5 hover:text-[#077BFF]"
                        href={social.url}
                        key={social.platform}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <Icon size={17} />
                      </a>
                    );
                  })}
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border border-gray-100">
                <iframe
                  allowFullScreen
                  height="220"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`${settings.mapsUrl}&output=embed`}
                  style={{ border: 0 }}
                  title="Dealer Lifts Location"
                  width="100%"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
