import {
  IconArrowUp,
  IconBulb,
  IconCalendarCheck,
  IconCar4wd,
  IconCertificate,
  IconCircle,
  IconCircleCheck,
  IconClock24,
  IconDisc,
  IconDroplet,
  IconEngine,
  IconFileDescription,
  IconHammer,
  IconHeart,
  IconMessageCircle,
  IconShieldCheck,
  IconStar,
  IconTool,
  IconTrophy,
  IconUsers,
  IconWheel,
} from "@tabler/icons-react";

/**
 * Every Tabler icon referenced by CMS-driven content, keyed by the enum value
 * stored in Hygraph's `IconName` enum.
 *
 * Icons are React components and cannot come from a CMS or cross the
 * server/client boundary as props, so content carries the enum string and
 * resolution happens here at render time.
 */
export const ICON_MAP = {
  ArrowUp: IconArrowUp,
  Bulb: IconBulb,
  CalendarCheck: IconCalendarCheck,
  Car4wd: IconCar4wd,
  Certificate: IconCertificate,
  CircleCheck: IconCircleCheck,
  Clock24: IconClock24,
  Disc: IconDisc,
  Droplet: IconDroplet,
  Engine: IconEngine,
  FileDescription: IconFileDescription,
  Hammer: IconHammer,
  Heart: IconHeart,
  MessageCircle: IconMessageCircle,
  ShieldCheck: IconShieldCheck,
  Star: IconStar,
  Tool: IconTool,
  Trophy: IconTrophy,
  Users: IconUsers,
  Wheel: IconWheel,
} as const;

export type IconName = keyof typeof ICON_MAP;

/**
 * All Tabler icons share one component type, so keying off the fallback icon
 * covers both mapped icons and the fallback. Deriving this from ICON_MAP's
 * values instead would exclude IconCircle, which is deliberately not a key.
 */
export type TablerIcon = typeof IconCircle;

/**
 * Resolve a CMS enum string to its component, falling back to a neutral icon.
 *
 * A typo or a newly added enum value in Hygraph must never crash a render, so
 * this never throws. `Object.hasOwn` guards against inherited properties like
 * `"toString"` resolving to a function.
 */
export function resolveIcon(name: string | null | undefined): TablerIcon {
  if (name && Object.hasOwn(ICON_MAP, name)) {
    return ICON_MAP[name as IconName];
  }
  return IconCircle;
}
