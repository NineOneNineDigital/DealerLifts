# Hygraph-Editable Page Content — Phase 2 (Home, About, Careers, Gallery, Contact) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the Phase 1 content layer to the five remaining marketing pages, so every page's copy is editable in Hygraph.

**Architecture:** Unchanged from Phase 1, which shipped and is in `main`-bound history. Each page gets a `defaults.ts` (dependency-free copy) and a `content.ts` (query + pure merge + `cache()`-wrapped fetcher). Section components take content as props. Icons travel as enum strings and resolve via `resolveIcon()` at render. Phase 2 adds four Hygraph components (`IconLabel`, `Stat`, `Testimonial`, `CtaBlock`), five page models, and the matching normalizers.

**Tech Stack:** Next.js 16 (App Router), React 19 (`cache`), TypeScript, Tailwind 4, Hygraph GraphQL Content API + `@hygraph/management-sdk`, Vitest, Biome.

**Spec:** `docs/superpowers/specs/2026-08-20-hygraph-page-content-design.md`

**Predecessor:** `docs/superpowers/plans/2026-08-20-hygraph-page-content-phase1.md` — shipped. Read `app/(site)/services/` as the reference implementation; every task here follows that exact shape.

## Global Constraints

- **Copy must be lifted verbatim.** Every default string must byte-match what the component renders today. A page rendering with defaults must be pixel-identical to the current site.
- **JSX entities become literal characters** in defaults: `&apos;` → `'`, `&ndash;` → `–`, `&nbsp;` → ` ` (a real non-breaking space, NOT a regular space). Em dashes are U+2014. Getting `&nbsp;` wrong is invisible in review and changes line wrapping — Home's hero and CTA banner both contain them.
- **JSX collapses whitespace.** Multi-line JSX text renders as single-spaced text. Defaults store the collapsed form. Verify programmatically, not by eye.
- **No optionals in merged output types.** Absent values are `""` or `[]`, never `undefined`.
- **`str()` for must-always-render fields; `optStr()` for clearable ones.** `optStr` returns the fallback only for null/undefined and `""` for a deliberate clear. Optional fields per the spec: `headlineAccent`, `href`, `CtaBlock.eyebrow`.
- **Arrays are all-or-nothing** via `list()`. Never interleave CMS items with defaults.
- **Icons are enum strings end-to-end**, resolved only at render. Never pass a React component as a prop into a `"use client"` component.
- **Single-entry models are queried plural with `first: 1`**, taking `[0] ?? null`.
- **Every `get*Content()` must warn (and throw under `HYGRAPH_STRICT=1`) when the query succeeds but returns an empty array.** This is the silent-defaults failure mode; Phase 1's `getServicesContent` is the reference.
- **`revalidate = 60`** on every page module touched.
- Lint with `npx biome check .` (not eslint). The repo carries ~646 pre-existing findings — add no new ones.
- Do not touch `BrandPartners.tsx`, nav, footer, or the contact sidebar (phone/email/address/hours/socials). Those are the deferred `SiteSettings` follow-up.

## Reference Implementation

Before starting any task, read these four files. They are the pattern every task repeats:

- `app/(site)/services/defaults.ts` — dependency-free copy module
- `app/(site)/services/content.ts` — query, merge, cached fetcher, empty-entry guard
- `app/(site)/services/page.tsx` — `generateMetadata` + prop threading
- `app/(site)/services/ProcessSection.tsx` — `resolveIcon` inside the map, index-prefixed keys

---

### Task 1: Phase 2 normalizers

**Files:**
- Modify: `lib/content/normalize.ts`
- Create: `lib/content/normalize.test.ts`

**Interfaces:**
- Consumes: `IconLabel`, `Stat`, `Testimonial`, `CtaBlock`, `RawIconLabel`, `RawStat`, `RawTestimonial`, `RawCtaBlock` from `lib/content/types.ts` (already defined in Phase 1, currently unused)
- Produces: `toIconLabel`, `toStat`, `toTestimonial`, `toCtaBlock`, alongside the existing `toIconCard`

**Context:** `toIconCard` already lives here. These four siblings normalize the remaining component shapes. Like `toIconCard`, they normalize absent values to `""` / `[]` / `0` rather than falling back to a per-field default — components arrive whole from the CMS or not at all, so there is no per-field default to fall back to.

- [ ] **Step 1: Write the failing tests**

Create `lib/content/normalize.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  toCtaBlock,
  toIconCard,
  toIconLabel,
  toStat,
  toTestimonial,
} from "@/lib/content/normalize";

describe("toIconCard", () => {
  it("normalizes missing tags and href to empty values", () => {
    const result = toIconCard({ icon: "Hammer", title: "T", description: "D" });
    expect(result.tags).toEqual([]);
    expect(result.href).toBe("");
  });
});

describe("toIconLabel", () => {
  it("maps a full CMS value", () => {
    expect(toIconLabel({ icon: "Star", label: "100+ Reviews" })).toEqual({
      icon: "Star",
      label: "100+ Reviews",
    });
  });

  it("normalizes a missing label to an empty string, never undefined", () => {
    expect(toIconLabel({ icon: "Star" }).label).toBe("");
  });

  it("normalizes a missing icon to an empty string for resolveIcon to handle", () => {
    expect(String(toIconLabel({ label: "L" }).icon)).toBe("");
  });

  it("trims surrounding whitespace", () => {
    expect(toIconLabel({ icon: "Star", label: "  L  " }).label).toBe("L");
  });
});

describe("toStat", () => {
  it("maps a full CMS value", () => {
    expect(toStat({ value: 100, suffix: "+", label: "Reviews" })).toEqual({
      value: 100,
      suffix: "+",
      label: "Reviews",
    });
  });

  it("preserves a legitimate zero", () => {
    expect(toStat({ value: 0, suffix: "", label: "L" }).value).toBe(0);
  });

  it("normalizes a missing value to zero rather than undefined", () => {
    expect(toStat({ label: "L" }).value).toBe(0);
  });

  it("normalizes a missing suffix to an empty string", () => {
    expect(toStat({ value: 5, label: "L" }).suffix).toBe("");
  });
});

describe("toTestimonial", () => {
  it("maps a full CMS value", () => {
    expect(
      toTestimonial({ name: "Mike J.", vehicle: "F-250", quote: "Great." })
    ).toEqual({ name: "Mike J.", vehicle: "F-250", quote: "Great." });
  });

  it("normalizes every missing field to an empty string", () => {
    expect(toTestimonial({})).toEqual({ name: "", vehicle: "", quote: "" });
  });
});

describe("toCtaBlock", () => {
  it("maps a full CMS value", () => {
    const result = toCtaBlock({
      eyebrow: "Ready?",
      headline: "H",
      headlineAccent: "A",
      subhead: "S",
      buttonLabel: "Go",
      buttonHref: "/contact",
      phoneLabel: "(919) 275-8095",
      phoneHref: "tel:919-275-8095",
    });
    expect(result.eyebrow).toBe("Ready?");
    expect(result.buttonHref).toBe("/contact");
  });

  it("normalizes every missing field to an empty string", () => {
    expect(toCtaBlock({})).toEqual({
      eyebrow: "",
      headline: "",
      headlineAccent: "",
      subhead: "",
      buttonLabel: "",
      buttonHref: "",
      phoneLabel: "",
      phoneHref: "",
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `toIconLabel` is not exported from `@/lib/content/normalize`

- [ ] **Step 3: Append the four normalizers to `lib/content/normalize.ts`**

Keep the existing `toIconCard` unchanged. Append:

```ts
/** Normalize one CMS icon+label pair. */
export function toIconLabel(raw: RawIconLabel): IconLabel {
  return {
    icon: (raw.icon?.trim() ?? "") as IconLabel["icon"],
    label: raw.label?.trim() ?? "",
  };
}

/** Normalize one CMS stat. `value` maps to AnimatedCounter's `target` prop. */
export function toStat(raw: RawStat): Stat {
  return {
    value: raw.value ?? 0,
    suffix: raw.suffix?.trim() ?? "",
    label: raw.label?.trim() ?? "",
  };
}

/** Normalize one CMS testimonial. */
export function toTestimonial(raw: RawTestimonial): Testimonial {
  return {
    name: raw.name?.trim() ?? "",
    vehicle: raw.vehicle?.trim() ?? "",
    quote: raw.quote?.trim() ?? "",
  };
}

/**
 * Normalize a CMS call-to-action block.
 *
 * Unlike the list normalizers this runs on a single nested component, so a
 * fully-absent block still yields a complete object of empty strings — the
 * page merge decides whether to keep it or fall back to its default.
 */
export function toCtaBlock(raw: RawCtaBlock): CtaBlock {
  return {
    eyebrow: raw.eyebrow?.trim() ?? "",
    headline: raw.headline?.trim() ?? "",
    headlineAccent: raw.headlineAccent?.trim() ?? "",
    subhead: raw.subhead?.trim() ?? "",
    buttonLabel: raw.buttonLabel?.trim() ?? "",
    buttonHref: raw.buttonHref?.trim() ?? "",
    phoneLabel: raw.phoneLabel?.trim() ?? "",
    phoneHref: raw.phoneHref?.trim() ?? "",
  };
}
```

Extend the existing type import at the top of the file to include `CtaBlock`, `IconLabel`, `RawCtaBlock`, `RawIconLabel`, `RawStat`, `RawTestimonial`, `Stat`, and `Testimonial`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS — all normalize tests green, the 53 existing tests still green

- [ ] **Step 5: Typecheck, lint, commit**

```bash
npx tsc --noEmit && npx biome check .
git add lib/content/normalize.ts lib/content/normalize.test.ts
git commit -m "Add Phase 2 CMS normalizers for labels, stats, testimonials and CTAs"
```

---

### Task 2: Phase 2 Hygraph schema migration and generalized seed

**Files:**
- Create: `scripts/hygraph-migrate-phase2.mjs`
- Modify: `scripts/hygraph-seed.mjs` (make it table-driven over pages)
- Modify: `package.json` (add `hygraph:migrate:phase2`)

**Interfaces:**
- Consumes: `@hygraph/management-sdk` `Client`, the `IconName` enum created in Phase 1
- Produces: Hygraph components `IconLabel`, `Stat`, `Testimonial`, `CtaBlock`; models `HomePage`, `AboutPage`, `CareersPage`, `GalleryPage`, `ContactPage`. A `hygraph:seed <page>` CLI.

**Context:** `scripts/hygraph-migrate.mjs` already ran successfully and cannot be re-run — Hygraph rejects creating an existing apiId. Phase 2 gets its own migration file. The `IconName` enum and the `PageHero` and `IconCard` components already exist and must be reused, not recreated.

**Important:** run this task's migration only after the task's code is committed, so the schema and the code that reads it land together.

- [ ] **Step 1: Create `scripts/hygraph-migrate-phase2.mjs`**

Copy the env-loading preamble verbatim from `scripts/hygraph-migrate.mjs` (lines 1-68 through `const client = new Client({ authToken, endpoint });`), changing only the header comment to say Phase 2. Then append:

```js
/*
 * Four component types Phase 1 did not need. PageHero, IconCard and the
 * IconName enum already exist from Phase 1 and are reused as-is.
 */
client.createComponent({
  apiId: "IconLabel",
  apiIdPlural: "IconLabels",
  displayName: "Icon Label",
  description: "An icon with a short label — strengths and perks strips.",
});

client.createEnumerableField({
  apiId: "icon",
  parentApiId: "IconLabel",
  enumerationApiId: "IconName",
  displayName: "Icon",
  isRequired: false,
});

client.createSimpleField({
  apiId: "label",
  parentApiId: "IconLabel",
  type: "STRING",
  displayName: "Label",
  isRequired: false,
});

client.createComponent({
  apiId: "Stat",
  apiIdPlural: "Stats",
  displayName: "Stat",
  description: "One animated counter in the home stats bar.",
});

client.createSimpleField({
  apiId: "value",
  parentApiId: "Stat",
  type: "INT",
  displayName: "Value",
  description: "The number counted up to. Digits only — no + or comma.",
  isRequired: false,
});

client.createSimpleField({
  apiId: "suffix",
  parentApiId: "Stat",
  type: "STRING",
  displayName: "Suffix",
  description: 'Rendered after the number, e.g. "+".',
  isRequired: false,
});

client.createSimpleField({
  apiId: "label",
  parentApiId: "Stat",
  type: "STRING",
  displayName: "Label",
  isRequired: false,
});

client.createComponent({
  apiId: "Testimonial",
  apiIdPlural: "Testimonials",
  displayName: "Testimonial",
  description: "A customer quote on the home page.",
});

const testimonialFields = [
  ["name", "Name", 'Display name, e.g. "Mike J."'],
  ["vehicle", "Vehicle", 'e.g. "2023 Ford F-250"'],
  ["quote", "Quote", "The review text. Quotation marks are added by the page."],
];

for (const [apiId, displayName, description] of testimonialFields) {
  client.createSimpleField({
    apiId,
    parentApiId: "Testimonial",
    type: "STRING",
    displayName,
    description,
    formRenderer: apiId === "quote" ? "GCMS_MULTI_LINE" : undefined,
    isRequired: false,
  });
}

client.createComponent({
  apiId: "CtaBlock",
  apiIdPlural: "CtaBlocks",
  displayName: "CTA Block",
  description:
    "A headline with a button and a phone link — the home hero and CTA banner.",
});

const ctaFields = [
  ["eyebrow", "Eyebrow", "Optional label above the headline. The home hero leaves this empty."],
  ["headline", "Headline", "First line of the headline."],
  ["headlineAccent", "Headline accent", "Second line. On the home hero this renders in the blue gradient."],
  ["subhead", "Subhead", "Supporting paragraph."],
  ["buttonLabel", "Button label", "Text on the primary button."],
  ["buttonHref", "Button link", "Where the primary button points."],
  ["phoneLabel", "Phone label", "Phone number as displayed."],
  ["phoneHref", "Phone link", 'The tel: URL, e.g. "tel:919-275-8095".'],
];

for (const [apiId, displayName, description] of ctaFields) {
  client.createSimpleField({
    apiId,
    parentApiId: "CtaBlock",
    type: "STRING",
    displayName,
    description,
    isRequired: false,
  });
}

/* ---- Page models ---- */

/** Adds seoTitle + seoDescription to a model. */
function addSeo(modelApiId) {
  client.createSimpleField({
    apiId: "seoTitle",
    modelApiId,
    type: "STRING",
    displayName: "SEO title",
    isRequired: false,
    isTitle: true,
  });
  client.createSimpleField({
    apiId: "seoDescription",
    modelApiId,
    type: "STRING",
    displayName: "SEO description",
    formRenderer: "GCMS_MULTI_LINE",
    isRequired: false,
  });
}

/** Adds a PageHero component field to a model. */
function addHero(modelApiId) {
  client.createComponentField({
    apiId: "hero",
    parentApiId: modelApiId,
    componentApiId: "PageHero",
    displayName: "Hero",
    isList: false,
    isRequired: false,
  });
}

/** Adds a plain string field to a model. */
function addString(modelApiId, apiId, displayName, description) {
  client.createSimpleField({
    apiId,
    modelApiId,
    type: "STRING",
    displayName,
    description,
    isRequired: false,
  });
}

// --- HomePage ---
client.createModel({
  apiId: "HomePage",
  apiIdPlural: "HomePages",
  displayName: "Home Page",
  description: "Content for /. Create exactly ONE entry and publish it.",
});
addSeo("HomePage");
client.createComponentField({
  apiId: "hero",
  parentApiId: "HomePage",
  componentApiId: "CtaBlock",
  displayName: "Hero",
  description: "The full-bleed hero. Leave the eyebrow empty.",
  isList: false,
  isRequired: false,
});
client.createComponentField({
  apiId: "stats",
  parentApiId: "HomePage",
  componentApiId: "Stat",
  displayName: "Stats",
  isList: true,
  isRequired: false,
});
addString("HomePage", "servicesEyebrow", "Services eyebrow");
addString("HomePage", "servicesHeading", "Services heading");
addString("HomePage", "servicesSubhead", "Services subhead");
addString("HomePage", "servicesLinkLabel", "Services link label");
addString("HomePage", "servicesLinkHref", "Services link");
client.createComponentField({
  apiId: "servicesPreview",
  parentApiId: "HomePage",
  componentApiId: "IconCard",
  displayName: "Services preview",
  isList: true,
  isRequired: false,
});
addString("HomePage", "testimonialsEyebrow", "Testimonials eyebrow");
addString("HomePage", "testimonialsHeading", "Testimonials heading");
addString(
  "HomePage",
  "testimonialsRatingLabel",
  "Testimonials rating label",
  'Text beside the stars, e.g. "100+ five-star reviews".'
);
client.createComponentField({
  apiId: "testimonials",
  parentApiId: "HomePage",
  componentApiId: "Testimonial",
  displayName: "Testimonials",
  isList: true,
  isRequired: false,
});
client.createComponentField({
  apiId: "ctaBanner",
  parentApiId: "HomePage",
  componentApiId: "CtaBlock",
  displayName: "CTA banner",
  isList: false,
  isRequired: false,
});

// --- AboutPage ---
client.createModel({
  apiId: "AboutPage",
  apiIdPlural: "AboutPages",
  displayName: "About Page",
  description: "Content for /about. Create exactly ONE entry and publish it.",
});
addSeo("AboutPage");
addHero("AboutPage");
addString("AboutPage", "storyHeading", "Story heading");
client.createSimpleField({
  apiId: "storyBody",
  modelApiId: "AboutPage",
  type: "RICHTEXT",
  displayName: "Story body",
  description: "The multi-paragraph story. Rendered as rich text.",
  isRequired: false,
});
client.createComponentField({
  apiId: "strengths",
  parentApiId: "AboutPage",
  componentApiId: "IconLabel",
  displayName: "Strengths",
  isList: true,
  isRequired: false,
});
addString("AboutPage", "teamEyebrow", "Team eyebrow");
addString("AboutPage", "teamHeading", "Team heading");
addString("AboutPage", "teamSubhead", "Team subhead");

// --- CareersPage ---
client.createModel({
  apiId: "CareersPage",
  apiIdPlural: "CareersPages",
  displayName: "Careers Page",
  description: "Content for /careers. Create exactly ONE entry and publish it.",
});
addSeo("CareersPage");
addHero("CareersPage");
client.createComponentField({
  apiId: "perks",
  parentApiId: "CareersPage",
  componentApiId: "IconLabel",
  displayName: "Perks",
  isList: true,
  isRequired: false,
});
addString("CareersPage", "positionsHeading", "Open positions heading");
addString(
  "CareersPage",
  "applyEmail",
  "Application email",
  "Used for the mailto links and the no-positions fallback copy."
);

// --- GalleryPage ---
client.createModel({
  apiId: "GalleryPage",
  apiIdPlural: "GalleryPages",
  displayName: "Gallery Page",
  description: "Content for /gallery. Create exactly ONE entry and publish it.",
});
addSeo("GalleryPage");
addHero("GalleryPage");

// --- ContactPage ---
client.createModel({
  apiId: "ContactPage",
  apiIdPlural: "ContactPages",
  displayName: "Contact Page",
  description: "Content for /contact. Create exactly ONE entry and publish it.",
});
addSeo("ContactPage");
addHero("ContactPage");
```

Close with the same `run()` / `run().catch(...)` block as `scripts/hygraph-migrate.mjs`, changing the "Next:" message to name `npm run hygraph:seed <page>`.

- [ ] **Step 2: Generalize `scripts/hygraph-seed.mjs` to take a page argument**

Replace the hardcoded `SERVICES_DEFAULTS` import and `buildData` with a registry. Keep `gql`, `loadEnvLocal`, `mutationEndpoint`, `introspectInput`, the existing-entry guard, and the union-wrapping detection exactly as they are — all of that is proven and page-agnostic.

```js
/**
 * Each entry maps a CLI name to its model, its defaults module, and a builder
 * turning those defaults into the model's CreateInput. `wrap` is the
 * card-normalizing function resolved at runtime from introspection.
 */
const PAGES = {
  services: {
    model: "ServicesPage",
    plural: "servicesPages",
    load: () => import("../app/(site)/services/defaults.ts"),
    key: "SERVICES_DEFAULTS",
    build: (d, wrap) => ({
      seoTitle: d.seoTitle,
      seoDescription: d.seoDescription,
      hero: { create: { ...d.hero } },
      services: { create: d.services.map(wrap) },
      processEyebrow: d.processEyebrow,
      processHeading: d.processHeading,
      processCtaLabel: d.processCtaLabel,
      processCtaHref: d.processCtaHref,
      processSteps: { create: d.processSteps.map(wrap) },
    }),
  },
  // home / about / careers / gallery / contact entries are added by the
  // tasks that create each page's defaults module.
};
```

Resolve the page from `process.argv`, defaulting to an error listing valid names. Every query and mutation that named `ServicesPage`/`servicesPages` must now use `page.model` / `page.plural`.

Add to `package.json` scripts:

```json
"hygraph:migrate:phase2": "node scripts/hygraph-migrate-phase2.mjs"
```

- [ ] **Step 3: Verify the seed still works for the already-seeded page**

Run: `npm run hygraph:seed -- services`
Expected: it refuses, reporting that a ServicesPage entry already exists. That proves the registry refactor preserved both the page lookup and the duplicate guard.

- [ ] **Step 4: Dry-run and apply the Phase 2 migration**

```bash
node scripts/hygraph-migrate-phase2.mjs --dry-run
node scripts/hygraph-migrate-phase2.mjs
```

Expected: `Migration SUCCESS`.

If it fails partway, Hygraph applies batch changes atomically — read the error, fix the script, and re-run. Do not hand-patch the schema in the Studio; the script must remain the source of truth.

- [ ] **Step 5: Verify the new models are queryable and publicly readable**

```bash
curl -s "$HYGRAPH_CONTENT_API_URL" -H 'Content-Type: application/json' \
  -d '{"query":"{ homePages(first:1){id} aboutPages(first:1){id} careersPages(first:1){id} galleryPages(first:1){id} contactPages(first:1){id} }"}'
```

Expected: no `errors` key, and five empty arrays (no entries seeded yet). An `errors` key naming a field means an apiId mismatch — fix the migration script before continuing.

- [ ] **Step 6: Typecheck, lint, commit**

```bash
npx tsc --noEmit && npx biome check . && npm test
git add scripts/ package.json
git commit -m "Add Phase 2 Hygraph schema migration and generalize the seed script"
```

---

### Task 3: Home page

**Files:**
- Create: `app/(site)/home-defaults.ts`
- Create: `app/(site)/content.ts`
- Create: `app/(site)/content.test.ts`
- Modify: `app/(site)/page.tsx`
- Modify: `components/home/Hero.tsx`, `StatsBar.tsx`, `ServicesPreview.tsx`, `Testimonials.tsx`, `CTABanner.tsx`
- Modify: `scripts/hygraph-seed.mjs` (add the `home` registry entry)

**Interfaces:**
- Consumes: `str`, `optStr`, `list` (`lib/content/merge`); `toIconCard`, `toStat`, `toTestimonial`, `toCtaBlock` (Task 1); `resolveIcon` (`lib/content/icons`); `hygraphFetchSafe`
- Produces: `HomeContent`, `HOME_DEFAULTS`, `mergeHomeContent`, `getHomeContent`

**Naming note:** the home route file is `app/(site)/page.tsx`, so its modules sit at `app/(site)/content.ts` and `app/(site)/home-defaults.ts` rather than in a subdirectory. The `-defaults` suffix keeps it distinguishable from the per-page `defaults.ts` files.

**This is the largest task.** Home has five section components, two `CtaBlock`s, and three list types. Everything the other four pages need is proven here.

- [ ] **Step 1: Create `app/(site)/home-defaults.ts`**

Follow `app/(site)/services/defaults.ts` exactly: `import type` only, so Node's type stripping can load it. Copy lifted verbatim from `components/home/Hero.tsx:52-92`, `StatsBar.tsx:13-16`, `ServicesPreview.tsx:13-38` and `:57-64`, `Testimonials.tsx:6-25` and `:36-49`, `CTABanner.tsx:17-24`.

**Watch the non-breaking spaces.** `Hero.tsx:66` has `30&nbsp;years`; `CTABanner.tsx:21` has `running&nbsp;its&nbsp;best.`; `Testimonials.tsx:41` has `for&nbsp;it.`. Each must be a literal ` ` in the default string.

```ts
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
```

**The home title MUST bypass the layout's template.** `app/layout.tsx:27-30` declares:

```ts
title: {
  default: "Dealer Lifts | Premium Automotive Performance & Off-Road Shop",
  template: "%s | Dealer Lifts",
},
```

Every other page's `title` string is fed through that template — which is why Services renders `Services | Dealer Lifts`. The home page currently has no `metadata` export of its own and inherits `default` verbatim. So a naive `title: content.seoTitle` on Home would render **"Dealer Lifts | Premium Automotive Performance & Off-Road Shop | Dealer Lifts"** — the template applied to an already-complete title.

Home's `generateMetadata` must therefore use the absolute form:

```tsx
return {
  title: { absolute: content.seoTitle },
  description: content.seoDescription,
};
```

The defaults above are the layout's `default` title and `description` copied verbatim, so the rendered head is unchanged until an editor changes it. Do **not** apply `absolute` on the other four pages — they rely on the template.

- [ ] **Step 2: Write the failing tests**

Create `app/(site)/content.test.ts`, mirroring `app/(site)/services/content.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { mergeHomeContent } from "@/app/(site)/content";
import { HOME_DEFAULTS } from "@/app/(site)/home-defaults";

describe("mergeHomeContent", () => {
  it("returns the full defaults when the entry is unpublished or the fetch failed", () => {
    expect(mergeHomeContent(null)).toEqual(HOME_DEFAULTS);
  });

  it("returns the full defaults for an entry with every field empty", () => {
    expect(mergeHomeContent({})).toEqual(HOME_DEFAULTS);
  });

  it("does not return the shared defaults arrays by reference", () => {
    const result = mergeHomeContent(null);
    expect(result.stats).not.toBe(HOME_DEFAULTS.stats);
    expect(result.testimonials).not.toBe(HOME_DEFAULTS.testimonials);
  });

  it("lets CMS values win over defaults", () => {
    const result = mergeHomeContent({ seoTitle: "Dealer Lifts Inc" });
    expect(result.seoTitle).toBe("Dealer Lifts Inc");
  });

  it("falls back per field when one hero field is cleared", () => {
    const result = mergeHomeContent({
      hero: { headline: "New", buttonLabel: "" },
    });
    expect(result.hero.headline).toBe("New");
    expect(result.hero.buttonLabel).toBe(HOME_DEFAULTS.hero.buttonLabel);
  });

  it("lets an editor clear the optional hero eyebrow", () => {
    const result = mergeHomeContent({ hero: { eyebrow: "" } });
    expect(result.hero.eyebrow).toBe("");
  });

  it("replaces the whole stats list rather than interleaving", () => {
    const result = mergeHomeContent({
      stats: [{ value: 1, suffix: "x", label: "Only" }],
    });
    expect(result.stats).toHaveLength(1);
  });

  it("falls back to default stats when the CMS list is empty", () => {
    expect(mergeHomeContent({ stats: [] }).stats).toEqual(HOME_DEFAULTS.stats);
  });

  it("preserves a stat value of zero", () => {
    const result = mergeHomeContent({
      stats: [{ value: 0, suffix: "", label: "Zero" }],
    });
    expect(result.stats[0].value).toBe(0);
  });

  it("merges testimonials independently of stats", () => {
    const result = mergeHomeContent({
      testimonials: [{ name: "N", vehicle: "V", quote: "Q" }],
    });
    expect(result.testimonials).toHaveLength(1);
    expect(result.stats).toEqual(HOME_DEFAULTS.stats);
  });

  it("falls back to the default CTA banner when the block is absent", () => {
    expect(mergeHomeContent({}).ctaBanner).toEqual(HOME_DEFAULTS.ctaBanner);
  });
});

describe("HOME_DEFAULTS", () => {
  it("holds the four stats currently rendered", () => {
    expect(HOME_DEFAULTS.stats).toHaveLength(4);
  });

  it("holds the three testimonials currently rendered", () => {
    expect(HOME_DEFAULTS.testimonials).toHaveLength(3);
  });

  it("preserves the non-breaking space in the hero subhead", () => {
    expect(HOME_DEFAULTS.hero.subhead).toContain("30 years");
  });

  it("preserves the non-breaking spaces in the CTA banner accent", () => {
    expect(HOME_DEFAULTS.ctaBanner.headlineAccent).toBe(
      "running its best."
    );
  });

  it("leaves the home hero eyebrow empty — it opens on the h1", () => {
    expect(HOME_DEFAULTS.hero.eyebrow).toBe("");
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — cannot resolve `@/app/(site)/content`

- [ ] **Step 4: Create `app/(site)/content.ts`**

Mirror `app/(site)/services/content.ts` structure exactly: `RawHomePage` interface, `QUERY`, `mergeHomeContent`, and `getHomeContent` **including the empty-entry guard**.

Merge rules specific to Home:
- `hero.eyebrow` and `ctaBanner.headlineAccent` use `optStr` (clearable); every other scalar uses `str`.
- `stats`, `servicesPreview`, `testimonials` use `list` with the matching normalizer.
- `hero` and `ctaBanner` are single components: merge field by field against their defaults, using `toCtaBlock` to normalize first.

The empty-entry guard, copied in shape from `getServicesContent`:

```ts
const entry = data?.homePages?.[0] ?? null;
if (data && !entry) {
  const msg = "[hygraph] homePages returned no entry — rendering defaults";
  if (process.env.HYGRAPH_STRICT === "1") {
    throw new Error(msg);
  }
  console.warn(msg);
}
return mergeHomeContent(entry);
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test`
Expected: PASS

- [ ] **Step 6: Thread content through `app/(site)/page.tsx`**

Add `generateMetadata` using `getHomeContent()`, keep `revalidate = 60`, keep the existing `getCompletedProjects` featured-builds logic untouched, and pass content into each section component.

```tsx
export default async function Home() {
  const [content, allProjects] = await Promise.all([
    getHomeContent(),
    getCompletedProjects(),
  ]);

  const featured = allProjects
    .filter((p) => p.featuredProject && (p.mainImage || p.images?.[0]))
    .slice(0, 3);

  return (
    <>
      <Hero content={content.hero} />
      <StatsBar stats={content.stats} />
      <ServicesPreview
        eyebrow={content.servicesEyebrow}
        heading={content.servicesHeading}
        items={content.servicesPreview}
        linkHref={content.servicesLinkHref}
        linkLabel={content.servicesLinkLabel}
        subhead={content.servicesSubhead}
      />
      <FeaturedBuilds projects={featured} />
      <BrandPartners />
      <Testimonials
        eyebrow={content.testimonialsEyebrow}
        heading={content.testimonialsHeading}
        items={content.testimonials}
        ratingLabel={content.testimonialsRatingLabel}
      />
      <CTABanner content={content.ctaBanner} />
    </>
  );
}
```

- [ ] **Step 7: Convert the five section components to take props**

For each: delete the module-level data array and any icon imports it needed, add a `Props` interface, and replace hardcoded strings with prop references. **Change nothing else** — no className, wrapper, `motion` prop, `ScrollReveal` delay, or `String(i + 1).padStart(2, "0")` expression.

Specific per-component notes:
- **`Hero.tsx`** — `content: CtaBlock`. The headline is `{content.headline}<br />{accent span}`; keep the `<br />` and the gradient span classes. Guard the accent with `{content.headlineAccent && ...}`.
- **`StatsBar.tsx`** — `stats: Stat[]`. Map to `<AnimatedCounter target={s.value} suffix={s.suffix} label={s.label} />`. Note the prop is `target`, not `value`. Key on `` `${i}-${s.label}` `` with a `biome-ignore lint/suspicious/noArrayIndexKey` comment, matching `ServicesGrid.tsx`.
- **`ServicesPreview.tsx`** — `items: IconCard[]` plus the four header props. `const Icon = resolveIcon(service.icon)` inside the map; `service.tags` replaces `service.tags` (already named `tags` here). Keep `whileHover={{ x: 4 }}` and `delay={i * 0.12}`.
- **`Testimonials.tsx`** — `items: Testimonial[]` plus three header props. The five `IconStar` elements are decorative and stay hardcoded.
- **`CTABanner.tsx`** — `content: CtaBlock`. Keep `<br className="hidden sm:block" />` between headline and accent, and the `{" "}` after it.

- [ ] **Step 8: Add the `home` entry to the seed registry**

In `scripts/hygraph-seed.mjs`:

```js
home: {
  model: "HomePage",
  plural: "homePages",
  load: () => import("../app/(site)/home-defaults.ts"),
  key: "HOME_DEFAULTS",
  build: (d, wrap) => ({
    seoTitle: d.seoTitle,
    seoDescription: d.seoDescription,
    hero: { create: { ...d.hero } },
    stats: { create: d.stats.map((s) => ({ ...s })) },
    servicesEyebrow: d.servicesEyebrow,
    servicesHeading: d.servicesHeading,
    servicesSubhead: d.servicesSubhead,
    servicesLinkLabel: d.servicesLinkLabel,
    servicesLinkHref: d.servicesLinkHref,
    servicesPreview: { create: d.servicesPreview.map(wrap) },
    testimonialsEyebrow: d.testimonialsEyebrow,
    testimonialsHeading: d.testimonialsHeading,
    testimonialsRatingLabel: d.testimonialsRatingLabel,
    testimonials: { create: d.testimonials.map((t) => ({ ...t })) },
    ctaBanner: { create: { ...d.ctaBanner } },
  }),
},
```

- [ ] **Step 9: Verify the defaults path renders identically**

Point the endpoint at an unreachable but non-empty host so the fallback engages (a blank value fails `assertServerEnv` in `lib/env.ts:28` before the fallback can run):

```bash
HYGRAPH_CONTENT_API_URL=https://unreachable.invalid/content/x/master npm run dev
```

Then `curl -s http://localhost:3000/ ` and confirm the HTML contains: `Built for performance.`, `Trusted for everything else.`, `Five-Star Reviews`, `Everything your vehicle needs, under one roof.`, `Scheduled Maintenance`, `Mike J.`, `Don't take our word for`, and `Ready to start?`. Kill the server.

- [ ] **Step 10: Seed, then verify the CMS path**

```bash
npm run hygraph:seed -- home --dry-run
npm run hygraph:seed -- home
rm -rf .next/cache
HYGRAPH_STRICT=1 npm run build
```

Expected: build succeeds with **zero** `falling back to defaults` warnings. A warning means the query or a field name is wrong.

Then confirm the rendered output still matches by grepping `.next/server/app/index.html` (or the home route's prerendered file) for the same strings as Step 9.

**Note:** clearing `.next/cache` is required — Next's Data Cache holds the previous response for the 60-second `revalidate` window and will otherwise serve a stale result during a rebuild.

- [ ] **Step 11: Typecheck, lint, test, revert build artifacts, commit**

```bash
npx tsc --noEmit && npx biome check . && npm test
git checkout -- lib/store/ymm-data.json
git add "app/(site)/home-defaults.ts" "app/(site)/content.ts" "app/(site)/content.test.ts" "app/(site)/page.tsx" components/home/ scripts/hygraph-seed.mjs
git commit -m "Drive home page content from Hygraph"
```

---

### Task 4: About page

**Files:**
- Create: `app/(site)/about/defaults.ts`, `app/(site)/about/content.ts`, `app/(site)/about/content.test.ts`
- Modify: `app/(site)/about/page.tsx`, `app/(site)/about/AboutContent.tsx`, `scripts/hygraph-seed.mjs`

**Interfaces:**
- Consumes: `str`, `optStr`, `list`, `toIconLabel`, `resolveIcon`, `hygraphFetchSafe`
- Produces: `AboutContentData`, `ABOUT_DEFAULTS`, `mergeAboutContent`, `getAboutContent`

**Naming note:** the merged-content type is `AboutContentData`, not `AboutContent` — that name is already taken by the component in the same directory.

**The rich-text field is the new thing here.** `storyBody` is `RICHTEXT`, so Hygraph returns `{ html, text }`. The default is an HTML string, and the renderer switches from three hardcoded `<p>` elements to a `dangerouslySetInnerHTML` div. There is precedent in this file already — `AboutContent.tsx` renders `openMember.bio.html` that way with a `biome-ignore lint/security/noDangerouslySetInnerHtml` comment and a prose class list. Reuse that same class list so the three paragraphs keep their `space-y-4 text-gray-500 leading-relaxed` appearance.

- [ ] **Step 1: Create `app/(site)/about/defaults.ts`**

`import type` only. Copy lifted from `app/(site)/about/page.tsx:5-10` (metadata), `AboutContent.tsx:41-52` (hero), `:61-85` (story), `:20-27` (strengths), `:219-230` (team header).

```ts
import type { IconLabel, PageHero } from "@/lib/content/types";

export interface AboutContentData {
  hero: PageHero;
  seoDescription: string;
  seoTitle: string;
  storyBody: string;
  storyHeading: string;
  strengths: IconLabel[];
  teamEyebrow: string;
  teamHeading: string;
  teamSubhead: string;
}

export const ABOUT_DEFAULTS: AboutContentData = {
  seoTitle: "About",
  seoDescription:
    "Learn about Dealer Lifts — North Carolina's trusted automotive performance shop with 30+ years of experience. Our story, our team, and our commitment to excellence.",
  hero: {
    eyebrow: "About Us",
    headline: "More than a shop — we're builders.",
    headlineAccent: "",
    subhead:
      "30+ years of turning stock trucks into something worth talking about. Based in Eastern NC.",
  },
  storyHeading: "Built on passion, driven by results.",
  storyBody:
    "<p>Dealer Lifts started over 30 years ago with a simple mission: build the best trucks and off-road vehicles in North Carolina. What began as a small garage operation has grown into a full-service performance shop trusted by hundreds of satisfied customers.</p><p>We've built our reputation on quality workmanship, honest pricing, and a genuine love for what we do. Every vehicle that rolls out of our shop is a testament to our commitment to excellence — from a simple oil change to a complete custom build.</p><p>With partnerships with over 40 premium brands including Carli Suspension, BDS, Method Race Wheels, Morimoto, and Borla, we have access to the best parts in the industry. And our team of certified technicians knows how to install them right.</p>",
  strengths: [
    { icon: "Clock24", label: "30+ Years Experience" },
    { icon: "Star", label: "100+ Five Star Reviews" },
    { icon: "Certificate", label: "Certified Technicians" },
    { icon: "ShieldCheck", label: "Warranty Backed" },
    { icon: "Tool", label: "40+ Brand Partners" },
    { icon: "Users", label: "Customer First" },
  ],
  teamEyebrow: "The Crew",
  teamHeading: "Meet the team behind the builds.",
  teamSubhead:
    "Every member of our crew brings real-world experience and a passion for getting it right the first time.",
};
```

- [ ] **Step 2: Write the failing tests**

Create `app/(site)/about/content.test.ts` covering: null → full defaults; `{}` → full defaults; arrays not returned by reference; CMS value wins; cleared `storyHeading` falls back; empty `strengths` falls back to all six; a one-item `strengths` list replaces rather than interleaves; `storyBody` reads `cms.storyBody.html` and falls back when that is blank; and that `ABOUT_DEFAULTS.strengths` has six entries and `storyBody` contains three `<p>` tags.

Mirror the assertion style of `app/(site)/services/content.test.ts`.

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — cannot resolve `@/app/(site)/about/content`

- [ ] **Step 4: Create `app/(site)/about/content.ts`**

Same structure as the Services module, including the empty-entry guard against `aboutPages`. The rich-text field needs its own raw shape and merge:

```ts
interface RawAboutPage {
  // …scalars…
  storyBody?: { html?: string | null } | null;
  strengths?: RawIconLabel[] | null;
}

// in the merge:
storyBody: str(cms.storyBody?.html, d.storyBody),
```

`headlineAccent` uses `optStr`; About's default is `""`, so a CMS value can add one and clearing it removes it.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test`
Expected: PASS

- [ ] **Step 6: Wire `app/(site)/about/page.tsx`**

Replace the static `metadata` with `generateMetadata` sourced from `getAboutContent()`. Fetch content and team in parallel. Keep the existing try/catch behaviour for `getTeamMembers` — that collection still uses the throwing `hygraphFetch` by design.

```tsx
export default async function AboutPage() {
  const content = await getAboutContent();

  let team: Awaited<ReturnType<typeof getTeamMembers>> = [];
  try {
    team = await getTeamMembers();
  } catch {
    team = [];
  }

  return <AboutContent content={content} team={team} />;
}
```

- [ ] **Step 7: Convert `AboutContent.tsx` to take content as props**

Delete the `strengths` array and the six icons used only by it: `IconCertificate`, `IconClock24`, `IconShieldCheck`, `IconStar`, `IconTool`, `IconUsers`. I verified each has exactly two references — one import, one use inside `strengths`.

**Keep `IconUser` (5 refs) and `IconX` (2 refs)** — the team grid placeholder and both dialog close buttons use them. Note `IconUser` and `IconUsers` differ by one character; deleting the wrong one breaks the team grid.

Add `content: AboutContentData` to `Props`.

Replace: hero strings with `content.hero.*`; the story `h2` with `{content.storyHeading}`; the three hardcoded `<p>` elements with a `dangerouslySetInnerHTML` div carrying `content.storyBody`; the `strengths.map` source with `content.strengths` and `<item.icon />` with `resolveIcon`; and the three team-header strings with `content.team*`.

Leave the story image, the `30+ Years` badge, the team grid, and both dialogs untouched.

- [ ] **Step 8: Add the `about` seed registry entry, seed, and verify**

Registry `build`: scalars directly, `hero: { create: { ...d.hero } }`, `strengths: { create: d.strengths.map((s) => ({ ...s })) }`, and `storyBody` passed as the raw HTML string — Hygraph accepts an HTML string for a RichText field on create.

```bash
npm run hygraph:seed -- about --dry-run
npm run hygraph:seed -- about
rm -rf .next/cache && HYGRAPH_STRICT=1 npm run build
```

Expected: zero fallback warnings. Confirm the prerendered About HTML still contains `More than a shop`, `Built on passion, driven by results.`, all three story paragraphs, all six strength labels, and `Meet the team behind the builds.`

- [ ] **Step 9: Typecheck, lint, test, commit**

```bash
npx tsc --noEmit && npx biome check . && npm test
git checkout -- lib/store/ymm-data.json
git add "app/(site)/about/" scripts/hygraph-seed.mjs
git commit -m "Drive about page content from Hygraph"
```

---

### Task 5: Careers page

**Files:**
- Create: `app/(site)/careers/defaults.ts`, `app/(site)/careers/content.ts`, `app/(site)/careers/content.test.ts`
- Modify: `app/(site)/careers/page.tsx`, `app/(site)/careers/CareersContent.tsx`, `scripts/hygraph-seed.mjs`

**Interfaces:**
- Consumes: `str`, `optStr`, `list`, `toIconLabel`, `resolveIcon`, `hygraphFetchSafe`
- Produces: `CareersContentData`, `CAREERS_DEFAULTS`, `mergeCareersContent`, `getCareersContent`

**Note on `applyEmail`:** `CareersContent.tsx:20` defines `const APPLY_EMAIL` and uses it in five places — the header mailto link, `buildMailto()`, the load-error message, and twice in the no-positions message. All five must read from content, so `buildMailto` gains an email parameter.

- [ ] **Step 1: Create `app/(site)/careers/defaults.ts`**

```ts
import type { IconLabel, PageHero } from "@/lib/content/types";

export interface CareersContentData {
  applyEmail: string;
  hero: PageHero;
  perks: IconLabel[];
  positionsHeading: string;
  seoDescription: string;
  seoTitle: string;
}

export const CAREERS_DEFAULTS: CareersContentData = {
  seoTitle: "Careers",
  seoDescription:
    "Join the Dealer Lifts team. We're looking for passionate automotive technicians, fabricators, and service professionals in Eastern NC.",
  hero: {
    eyebrow: "Careers",
    headline: "Build trucks. Build a career.",
    headlineAccent: "",
    subhead:
      "We're always looking for talented, passionate people to join the Dealer Lifts crew.",
  },
  perks: [
    { icon: "Tool", label: "Top-tier brands & parts" },
    { icon: "Users", label: "Team-first culture" },
    { icon: "Heart", label: "Competitive pay & benefits" },
    { icon: "Trophy", label: "Growth opportunities" },
  ],
  positionsHeading: "Open Positions",
  applyEmail: "info@dealerliftsinc.com",
};
```

- [ ] **Step 2: Write the failing tests**

Create `app/(site)/careers/content.test.ts` covering: null → defaults; `{}` → defaults; `perks` not returned by reference; CMS wins; empty `perks` falls back to all four; a one-item list replaces; a cleared `applyEmail` falls back to the default (it must always render — an empty mailto would be a broken link); and that `CAREERS_DEFAULTS.perks` has four entries.

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — cannot resolve `@/app/(site)/careers/content`

- [ ] **Step 4: Create `app/(site)/careers/content.ts`**

Same structure, empty-entry guard against `careersPages`. All scalars use `str` except `hero.headlineAccent`, which uses `optStr`.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test`
Expected: PASS

- [ ] **Step 6: Wire `app/(site)/careers/page.tsx`**

`generateMetadata` from `getCareersContent()`; keep the existing `loadError` handling for `getJobPositions()` unchanged; pass `content` alongside `positions` and `loadError`.

- [ ] **Step 7: Convert `CareersContent.tsx`**

Delete the `perks` array and `APPLY_EMAIL`, and the four icons used **only** by perks: `IconHeart`, `IconTool`, `IconTrophy`, `IconUsers`. I verified each has exactly two references in this file — one import, one use inside the `perks` array — so all four become unused once the array is gone.

Keep `IconBriefcase` (3 refs), `IconClock` (2), `IconMail` (3), `IconMapPin` (2), and `IconX` (2) — the job cards, meta row, and modal still use them.

Thread `applyEmail` into `PositionsList` and `buildMailto(jobTitle, email)`. Replace the hero strings, `Open Positions` heading, and the perks map source. Use `resolveIcon` for perk icons and index-prefixed keys.

- [ ] **Step 8: Add the `careers` seed registry entry, seed, and verify**

```bash
npm run hygraph:seed -- careers --dry-run
npm run hygraph:seed -- careers
rm -rf .next/cache && HYGRAPH_STRICT=1 npm run build
```

Expected: zero fallback warnings; prerendered HTML contains `Build trucks. Build a career.`, all four perk labels, `Open Positions`, and `info@dealerliftsinc.com`.

- [ ] **Step 9: Typecheck, lint, test, commit**

```bash
npx tsc --noEmit && npx biome check . && npm test
git checkout -- lib/store/ymm-data.json
git add "app/(site)/careers/" scripts/hygraph-seed.mjs
git commit -m "Drive careers page content from Hygraph"
```

---

### Task 6: Gallery and Contact pages

**Files:**
- Create: `app/(site)/gallery/defaults.ts`, `content.ts`, `content.test.ts`
- Create: `app/(site)/contact/defaults.ts`, `content.ts`, `content.test.ts`
- Modify: `app/(site)/gallery/page.tsx`, `app/(site)/contact/page.tsx`, `scripts/hygraph-seed.mjs`

**Interfaces:**
- Consumes: `str`, `optStr`, `hygraphFetchSafe`
- Produces: `GalleryContentData` / `GALLERY_DEFAULTS` / `mergeGalleryContent` / `getGalleryContent`, and the Contact equivalents

**Batched deliberately:** both pages are hero + SEO only, with no lists, no icons, and no component conversion — their hero markup is inline in `page.tsx`. Splitting them would be two nearly identical review surfaces.

- [ ] **Step 1: Create both defaults modules**

`app/(site)/gallery/defaults.ts` — copy from `app/(site)/gallery/page.tsx:5-10` and `:22-33`:

```ts
import type { PageHero } from "@/lib/content/types";

export interface GalleryContentData {
  hero: PageHero;
  seoDescription: string;
  seoTitle: string;
}

export const GALLERY_DEFAULTS: GalleryContentData = {
  seoTitle: "Gallery",
  seoDescription:
    "Browse our portfolio of custom truck builds, Jeep modifications, and off-road builds. Photos of lift kits, wheels, lighting, and more.",
  hero: {
    eyebrow: "Our Work",
    headline: "Builds that speak for themselves.",
    headlineAccent: "",
    subhead:
      "Browse recent projects — from full suspension overhauls to lighting upgrades and custom off-road packages.",
  },
};
```

`app/(site)/contact/defaults.ts` — copy from `app/(site)/contact/page.tsx:13-18` and `:23-33`:

```ts
import type { PageHero } from "@/lib/content/types";

export interface ContactContentData {
  hero: PageHero;
  seoDescription: string;
  seoTitle: string;
}

export const CONTACT_DEFAULTS: ContactContentData = {
  seoTitle: "Contact",
  seoDescription:
    "Get a free quote for your next build or schedule service at Dealer Lifts. Call (919) 275-8095 or fill out our online form.",
  hero: {
    eyebrow: "Get In Touch",
    headline: "Let's talk about your build.",
    headlineAccent: "",
    subhead:
      "Request a quote, ask a question, or schedule a consultation. We typically respond within 24 hours.",
  },
};
```

- [ ] **Step 2: Write the failing tests**

Create both `content.test.ts` files. Each covers: null → defaults; `{}` → defaults; CMS value wins; a cleared `headline` falls back while a sibling CMS value is kept; and a cleared `headlineAccent` stays `""`.

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL for both new modules

- [ ] **Step 4: Create both content modules**

Same structure as Services, with empty-entry guards against `galleryPages` and `contactPages` respectively.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test`
Expected: PASS

- [ ] **Step 6: Wire both pages**

For `gallery/page.tsx`: `generateMetadata` from `getGalleryContent()`, fetch content and projects in parallel, replace the three inline hero strings with content, and guard the accent with `{hero.headlineAccent && ...}` wrapped in the same gradient span used on Services. Keep `<GalleryContent projects={projects} />` untouched.

For `contact/page.tsx`: make it `async`, add `export const revalidate = 60` (it currently has none), replace `metadata` with `generateMetadata`, and replace the three inline hero strings. **Leave the entire sidebar untouched** — phone, email, address, hours, socials, and the map iframe are the deferred `SiteSettings` work.

- [ ] **Step 7: Add both seed registry entries, seed, and verify**

```bash
npm run hygraph:seed -- gallery && npm run hygraph:seed -- contact
rm -rf .next/cache && HYGRAPH_STRICT=1 npm run build
```

Expected: zero fallback warnings; prerendered HTML contains `Builds that speak for themselves.` and `Let's talk about your build.`

- [ ] **Step 8: Full verification across all six pages**

```bash
npx tsc --noEmit && npx biome check . && npm test
rm -rf .next/cache && HYGRAPH_STRICT=1 npm run build 2>&1 | grep -c "falling back"
```

Expected: `0`. Every marketing page now reads from Hygraph in strict mode without a single fallback.

Then confirm the public API returns exactly one entry per model:

```bash
curl -s "$HYGRAPH_CONTENT_API_URL" -H 'Content-Type: application/json' \
  -d '{"query":"{ homePages{id} aboutPages{id} servicesPages{id} careersPages{id} galleryPages{id} contactPages{id} }"}'
```

Expected: no `errors`, and each array has exactly one element. More than one means a double-seed — delete the extra in Studio, because the code takes `[0]` and would silently ignore it.

- [ ] **Step 9: Commit**

```bash
git checkout -- lib/store/ymm-data.json
git add "app/(site)/gallery/" "app/(site)/contact/" scripts/hygraph-seed.mjs
git commit -m "Drive gallery and contact page content from Hygraph"
```

---

## Follow-ups (not in scope)

- **`SiteSettings` singleton** for phone, email, address, hours, and social links. This is now the largest remaining duplication: the phone number appears in `Hero.tsx`, `CTABanner.tsx`, `contact/page.tsx`, and the contact metadata, and after Phase 2 an owner can edit it in the first two but not the last two. Worth doing next.
- **Brand logo wall** to Hygraph assets — the last hardcoded list, deferred because it is images rather than text.
- **Webhook-driven revalidation** if 60-second ISR proves too slow.
- **Deferred minors carried from Phase 1:** the `as IconName` cast in the normalizers, the magic `20` in `icons.test.ts`, and `console.warn` vs `console.error` for the fallback signal.
