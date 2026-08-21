import type {
  CtaBlock,
  IconCard,
  Stat,
  Testimonial,
} from "@/lib/content/types";

/*
 * Home page content shape and defaults.
 *
 * Deliberately free of runtime imports so scripts/hygraph-seed.mjs can load it
 * under Node's type stripping. See app/(site)/services/defaults.ts.
 */

export interface HomeContent {
  ctaBanner: CtaBlock;
  hero: CtaBlock;
  seoDescription: string;
  seoTitle: string;
  servicesEyebrow: string;
  servicesHeading: string;
  servicesLinkHref: string;
  servicesLinkLabel: string;
  servicesPreview: IconCard[];
  servicesSubhead: string;
  stats: Stat[];
  testimonials: Testimonial[];
  testimonialsEyebrow: string;
  testimonialsHeading: string;
  testimonialsRatingLabel: string;
}

/** Today's hardcoded copy, lifted verbatim. Renders when Hygraph has nothing. */
export const HOME_DEFAULTS: HomeContent = {
  seoTitle: "Dealer Lifts | Premium Automotive Performance & Off-Road Shop",
  seoDescription:
    "North Carolina's premier automotive performance and off-road shop. Lift kits, suspension, wheels, custom builds, and expert auto repair. 30+ years experience, 100+ five-star reviews.",
  hero: {
    eyebrow: "",
    headline: "Built for performance.",
    headlineAccent: "Trusted for everything else.",
    subhead:
      "From oil changes and brakes to lift kits and custom builds — every make, every model, all under one roof. Backed by 30 years of experience.",
    buttonLabel: "Get a free quote",
    buttonHref: "/contact",
    phoneLabel: "(919) 275-8095",
    phoneHref: "tel:919-275-8095",
  },
  stats: [
    { value: 100, suffix: "+", label: "Five-Star Reviews" },
    { value: 30, suffix: "+", label: "Years Experience" },
    { value: 40, suffix: "+", label: "Brand Partners" },
    { value: 1000, suffix: "+", label: "Builds Completed" },
  ],
  servicesEyebrow: "What we do",
  servicesHeading: "Everything your vehicle needs, under one roof.",
  servicesSubhead:
    "From routine maintenance to performance upgrades — our certified techs keep every make and model running its best.",
  servicesLinkLabel: "View all services",
  servicesLinkHref: "/services",
  servicesPreview: [
    {
      icon: "CalendarCheck",
      title: "Scheduled Maintenance",
      description:
        "Oil changes, fluid flushes, tire rotations, and routine maintenance to keep your vehicle running its best.",
      tags: ["Oil Change", "Tires", "Fluids"],
      href: "/services",
    },
    {
      icon: "Tool",
      title: "Auto Repair & Diagnostics",
      description:
        "Expert diagnostics and repair for all makes and models. Brakes, engine, drivetrain — done right the first time.",
      tags: ["Diagnostics", "Brakes", "Engine"],
      href: "/services",
    },
    {
      icon: "ArrowUp",
      title: "Performance Upgrades",
      description:
        "Lift kits, suspension, wheels & tires, bumpers, lighting, and custom builds from 40+ premium brands.",
      tags: ["Carli", "BDS", "Fox", "Method"],
      href: "/services",
    },
  ],
  testimonialsEyebrow: "Reviews",
  testimonialsHeading: "Don't take our word for it.",
  testimonialsRatingLabel: "100+ five-star reviews",
  testimonials: [
    {
      name: "Mike J.",
      vehicle: "2023 Ford F-250",
      quote:
        "The 6-inch BDS lift with Method wheels looks absolutely amazing. Professional crew, fair pricing, and they finished ahead of schedule.",
    },
    {
      name: "Sarah W.",
      vehicle: "2024 Jeep Wrangler",
      quote:
        "Best off-road shop in NC, hands down. Carli suspension rides like a dream on and off the trail.",
    },
    {
      name: "Chris M.",
      vehicle: "2023 Toyota Tacoma",
      quote:
        "I've been bringing all my vehicles here for years. Their maintenance work is top-notch and their custom builds are on another level.",
    },
  ],
  ctaBanner: {
    eyebrow: "Ready to start?",
    headline: "Let's keep your vehicle",
    headlineAccent: "running its best.",
    subhead:
      "From an oil change to a full custom build — we treat every vehicle like it's our own.",
    buttonLabel: "Get a free quote",
    buttonHref: "/contact",
    phoneLabel: "(919) 275-8095",
    phoneHref: "tel:919-275-8095",
  },
};
