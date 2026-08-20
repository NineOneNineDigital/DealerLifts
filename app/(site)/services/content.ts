import { cache } from "react";
import { list, str } from "@/lib/content/merge";
import type {
  IconCard,
  PageHero,
  RawIconCard,
  RawPageHero,
} from "@/lib/content/types";
import { hygraphFetchSafe } from "@/lib/hygraph";

export interface ServicesContent {
  hero: PageHero;
  processCtaHref: string;
  processCtaLabel: string;
  processEyebrow: string;
  processHeading: string;
  processSteps: IconCard[];
  seoDescription: string;
  seoTitle: string;
  services: IconCard[];
}

interface RawServicesPage {
  hero?: RawPageHero | null;
  processCtaHref?: string | null;
  processCtaLabel?: string | null;
  processEyebrow?: string | null;
  processHeading?: string | null;
  processSteps?: RawIconCard[] | null;
  seoDescription?: string | null;
  seoTitle?: string | null;
  services?: RawIconCard[] | null;
}

/** Today's hardcoded copy, lifted verbatim. Renders when Hygraph has nothing. */
export const SERVICES_DEFAULTS: ServicesContent = {
  seoTitle: "Services",
  seoDescription:
    "Oil changes, scheduled maintenance, brakes, engine and drivetrain repair, diagnostics, plus performance upgrades and custom builds at Dealer Lifts.",
  hero: {
    eyebrow: "Services",
    headline: "Performance pedigree,",
    headlineAccent: "full-service shop.",
    subhead:
      "From oil changes and brakes to lift kits and custom builds — expert service for every make and model, backed by 30+ years and 40+ premium brands.",
  },
  services: [
    {
      icon: "Droplet",
      title: "Oil Changes & Scheduled Maintenance",
      description:
        "Quick, quality oil changes, fluid flushes, and routine maintenance. Premium synthetic oils and filters to keep your vehicle running its best.",
      tags: [],
      href: "",
    },
    {
      icon: "Engine",
      title: "Engine & Drivetrain Service",
      description:
        "Complete engine diagnostics, repair, and tuning. Transmission service, differential rebuilds, and drivetrain repair for all makes and models.",
      tags: ["Borla"],
      href: "",
    },
    {
      icon: "Disc",
      title: "Brakes & Repair",
      description:
        "Brake inspections, pad and rotor replacement, stainless steel lines, and performance upgrades — stopping power you can count on.",
      tags: [],
      href: "",
    },
    {
      icon: "Wheel",
      title: "Wheels, Tires & Alignment",
      description:
        "Tire mounting, balancing, and alignment for any vehicle. New wheels and tires from Method, Fuel, BFGoodrich, Nitto, and Toyo.",
      tags: ["Method", "Fuel", "BFGoodrich"],
      href: "",
    },
    {
      icon: "ArrowUp",
      title: "Lift Kits & Suspension",
      description:
        'Premium lift kits and suspension systems from Carli, BDS, Fox, Icon, and King. From 2" leveling kits to 12" full suspension lifts.',
      tags: ["Carli", "BDS", "Fox", "Icon"],
      href: "",
    },
    {
      icon: "Bulb",
      title: "Lighting & Electrical",
      description:
        "Morimoto headlights, Rigid Industries light bars, rock lights, and complete electrical upgrades and diagnostics.",
      tags: ["Morimoto", "Rigid"],
      href: "",
    },
    {
      icon: "ShieldCheck",
      title: "Bumpers & Armor",
      description:
        "Heavy-duty steel bumpers, rock sliders, skid plates, and body armor from Fab Fours, ADD, and ARB for maximum trail protection.",
      tags: ["Fab Fours", "ADD", "ARB"],
      href: "",
    },
    {
      icon: "Car4wd",
      title: "Custom Builds",
      description:
        "Full-service custom build packages. From concept to completion, your dream vehicle assembled with the best parts available.",
      tags: [],
      href: "",
    },
  ],
  processEyebrow: "How It Works",
  processHeading: "From drop-off to drive-off in four steps.",
  processCtaLabel: "Request a Quote",
  processCtaHref: "/contact",
  processSteps: [
    {
      icon: "MessageCircle",
      title: "Consult",
      description: "Tell us about your vehicle and what it needs.",
      tags: [],
      href: "",
    },
    {
      icon: "FileDescription",
      title: "Quote",
      description: "Transparent pricing — no hidden fees.",
      tags: [],
      href: "",
    },
    {
      icon: "Hammer",
      title: "Service",
      description: "Quality parts and labor, done right the first time.",
      tags: [],
      href: "",
    },
    {
      icon: "CircleCheck",
      title: "Deliver",
      description: "Walk-through and you drive away.",
      tags: [],
      href: "",
    },
  ],
};

const QUERY = /* GraphQL */ `
  query ServicesPageContent {
    servicesPages(first: 1) {
      seoTitle
      seoDescription
      hero {
        eyebrow
        headline
        headlineAccent
        subhead
      }
      services {
        icon
        title
        description
        tags
        href
      }
      processEyebrow
      processHeading
      processCtaLabel
      processCtaHref
      processSteps {
        icon
        title
        description
        tags
        href
      }
    }
  }
`;

/**
 * Normalize one CMS card. Cards arrive whole from the CMS or not at all, so
 * unlike scalars there is no per-field default to fall back to — missing
 * values become "" / [] to satisfy the no-optionals contract. An unrecognized
 * icon string is passed through for resolveIcon() to handle at render.
 */
function toIconCard(raw: RawIconCard): IconCard {
  return {
    icon: (raw.icon ?? "") as IconCard["icon"],
    title: raw.title?.trim() ?? "",
    description: raw.description?.trim() ?? "",
    tags: raw.tags ?? [],
    href: raw.href?.trim() ?? "",
  };
}

/** Pure merge of a Hygraph response over SERVICES_DEFAULTS. Exported for tests. */
export function mergeServicesContent(
  cms: RawServicesPage | null
): ServicesContent {
  if (!cms) {
    return SERVICES_DEFAULTS;
  }

  const d = SERVICES_DEFAULTS;

  return {
    seoTitle: str(cms.seoTitle, d.seoTitle),
    seoDescription: str(cms.seoDescription, d.seoDescription),
    hero: {
      eyebrow: str(cms.hero?.eyebrow, d.hero.eyebrow),
      headline: str(cms.hero?.headline, d.hero.headline),
      headlineAccent: str(cms.hero?.headlineAccent, d.hero.headlineAccent),
      subhead: str(cms.hero?.subhead, d.hero.subhead),
    },
    services: list(cms.services?.map(toIconCard), d.services),
    processEyebrow: str(cms.processEyebrow, d.processEyebrow),
    processHeading: str(cms.processHeading, d.processHeading),
    processCtaLabel: str(cms.processCtaLabel, d.processCtaLabel),
    processCtaHref: str(cms.processCtaHref, d.processCtaHref),
    processSteps: list(cms.processSteps?.map(toIconCard), d.processSteps),
  };
}

/**
 * Fetch and merge Services page content.
 *
 * cache() dedupes across generateMetadata() and the page component, so a
 * render performs exactly one Hygraph request.
 */
export const getServicesContent = cache(async (): Promise<ServicesContent> => {
  const data = await hygraphFetchSafe<{
    servicesPages: RawServicesPage[] | null;
  }>(QUERY);

  return mergeServicesContent(data?.servicesPages?.[0] ?? null);
});
