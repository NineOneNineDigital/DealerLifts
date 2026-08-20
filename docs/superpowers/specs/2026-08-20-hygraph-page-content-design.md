# Hygraph-Editable Page Content — Design

**Date:** 2026-08-20
**Status:** Approved (design), pending implementation plan
**Scope:** Move marketing-page copy out of hardcoded JSX and into Hygraph, so the site owner can edit page text without a developer or a deploy.

## Goal

Let the site owner edit the copy on the six marketing pages — hero text, section headings, service descriptions, process steps, testimonials, stats, SEO metadata — directly in Hygraph, with edits appearing on the live site within a minute. Page layout, section order, and visual design stay owned by code.

## Context

- **App:** Next.js 16 (App Router), React 19, Tailwind 4, Biome for lint. Marketing routes live under `app/(site)/`.
- **Hygraph is already integrated.** `lib/hygraph.ts` (158 lines) exposes `hygraphFetch<T>()` plus three typed collection accessors: `getJobPositions()`, `getTeamMembers()`, `getCompletedProjects()`. Env vars `HYGRAPH_CONTENT_API_URL` and `HYGRAPH_CONTENT_API_READ_TOKEN` are already provisioned in `.env.example`.
- **Everything else is hardcoded JSX.** Hero copy sits inline in each `page.tsx` (e.g. `app/(site)/services/page.tsx:16-30`), and repeating content sits in module-level arrays: `components/home/Testimonials.tsx:6`, `components/home/BrandPartners.tsx:12`, `components/home/ServicesPreview.tsx:13`, `app/(site)/services/ServicesGrid.tsx:15`, `app/(site)/services/ProcessSection.tsx:12`, plus `strengths` in `AboutContent.tsx` and `perks` in `CareersContent.tsx`.
- **Five of six pages share one hero pattern:** blue uppercase eyebrow → `h1` → gray subhead. Only Services adds a gradient accent span. The home page hero is structurally different (dark, full-bleed image, two CTAs).
- **Several section components are `"use client"`** — `Hero`, `StatsBar`, `ServicesPreview`, `Testimonials`, `CTABanner`, `AboutContent`, `CareersContent`. Props crossing into them must be serializable.
- **Icons are Tabler React components** referenced directly inside those arrays. React components cannot come from a CMS or cross the server/client boundary as props.
- **No test runner exists.** `package.json` has `lint` (Biome) and no `test` script; there are zero test files in the repo.
- `/shop/*` routes are Shopify-driven and out of scope.

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Editor power | **Fixed layouts, editable fields** — per-page models with named fields | Owner edits copy; layout and section order stay in code. A page builder with reorderable blocks was rejected as more surface area than the owner needs, and easier to break. |
| Depth | **Hero copy + SEO + all repeating text sections** | Covers services grid, process steps, testimonials, stats, strengths, perks. Brand logo wall (image assets) and nav/footer stay in code. |
| Fallback | **Code defaults, applied field by field** | Today's copy moves into a typed `DEFAULTS` object per page; Hygraph overrides it field by field. The site can never render blank because of the CMS. |
| Failure mode | **Strict at build, forgiving at runtime** | `HYGRAPH_STRICT=1` in CI fails the build on a CMS error so a deploy never silently ships defaults; at runtime a blip falls back and warns rather than 500ing. |
| Code architecture | **Per-page content module** (`content.ts` beside each `page.tsx`) | Mirrors the existing `lib/hygraph.ts` pattern (typed interface + named query + typed accessor). Section components become pure and take content as props. |
| Freshness | **Keep `revalidate = 60`** (ISR) | Owner publishes, change appears within a minute. No webhook route, no secret to rotate. |
| Testing | **Add Vitest, scoped to the merge layer** | The merge is the only pure, correctness-critical logic introduced, and its edge cases cannot be caught by eye. |
| Icon handling | **Shared Hygraph enum → `ICON_MAP` in code** | Enum strings serialize across the server/client boundary; a fallback icon means an unmapped value cannot crash a render. |

### Rejected alternatives

- **Generic `Page` model with modular blocks (page builder).** Maximum flexibility, but the owner gains the ability to create broken layouts, and every block needs a renderer. Not warranted for six pages.
- **Single `getPageContent(slug)` in `lib/hygraph.ts`.** Fewer files, but the return type becomes a wide union with everything optional, forcing narrowing at every consumer, and `lib/hygraph.ts` would grow past 400 lines holding copy defaults for six pages.
- **Request-scoped context provider.** Eliminates prop drilling, but section components would only work inside `app/(site)/layout.tsx` and their props would no longer describe what content they need.
- **Generic deep-merge of CMS over defaults.** Untyped, and it silently does the wrong thing on empty arrays and cleared strings.

## Content Model

### Reusable Hygraph components

| Component | Fields | Used by |
|---|---|---|
| `PageHero` | `eyebrow`, `headline`, `headlineAccent?`, `subhead` | about, services, contact, careers, gallery |
| `IconCard` | `icon` (enum), `title`, `description`, `tags[]` (String list), `href?` | services grid (8), process steps (4), services preview (3) |
| `IconLabel` | `icon` (enum), `label` | about strengths (6), careers perks (4) |
| `Stat` | `value` (Int), `suffix`, `label` | home stats bar (4) |
| `Testimonial` | `name`, `vehicle`, `quote` | home testimonials (3) |
| `CtaBlock` | `eyebrow?`, `headline`, `headlineAccent?`, `subhead`, `buttonLabel`, `buttonHref`, `phoneLabel`, `phoneHref` | home hero, CTA banner |

`CtaBlock.eyebrow` is optional because the home hero has none — it opens directly on the `h1` — while the CTA banner renders "Ready to start?" above its heading. The renderer omits the element entirely when the field is blank.

`IconCard.tags[]` is one field serving two renderers: `ServicesGrid` calls them "brands" (`Carli`, `BDS`, `Fox`) and `ServicesPreview` calls them "tags" (`Oil Change`, `Tires`). Both render the same chip row and both already guard on a non-empty list, so process steps leave it empty. `href` is likewise optional — only `ServicesPreview` cards link.

`Stat.value` maps to the existing `AnimatedCounter` `target` prop; the field is named `value` in Hygraph because "target" is meaningless to an editor.

### Section headers

Every repeating section has its own header block above the items — an eyebrow, a heading, sometimes a subhead, sometimes a CTA link. These are modeled as **sibling scalar fields on the page model**, prefixed by section, rather than as another reusable component: the combinations differ per section (Process has eyebrow + heading + button and no subhead; Services Preview has eyebrow + heading + subhead + text link; Testimonials has eyebrow + heading + a rating label), and a component with six optional fields would be worse for the editor than named fields.

`icon` is one shared enum, `IconName`, covering every Tabler icon currently in use: `MessageCircle`, `FileDescription`, `Hammer`, `CircleCheck`, `Clock24`, `Star`, `Certificate`, `ShieldCheck`, `Tool`, `Users`, `Briefcase`, `Heart`, `Trophy`.

### Page models

One published entry each. No slug field — the owner edits existing pages and cannot create new ones.

| Model | Fields |
|---|---|
| `HomePage` | `seoTitle`, `seoDescription`, `hero` (CtaBlock), `stats[]`, `servicesEyebrow`, `servicesHeading`, `servicesSubhead`, `servicesLinkLabel`, `servicesLinkHref`, `servicesPreview[]`, `testimonialsEyebrow`, `testimonialsHeading`, `testimonialsRatingLabel`, `testimonials[]`, `ctaBanner` (CtaBlock) |
| `AboutPage` | `seoTitle`, `seoDescription`, `hero`, `storyHeading`, `storyBody` (RichText), `strengths[]` |
| `ServicesPage` | `seoTitle`, `seoDescription`, `hero`, `services[]`, `processEyebrow`, `processHeading`, `processCtaLabel`, `processCtaHref`, `processSteps[]` |
| `CareersPage` | `seoTitle`, `seoDescription`, `hero`, `perks[]`, `applyEmail` |
| `GalleryPage` | `seoTitle`, `seoDescription`, `hero` |
| `ContactPage` | `seoTitle`, `seoDescription`, `hero` |

The home hero headline renders as two lines with the second in a gradient — `headline` + `headlineAccent` covers this without exposing markup to the editor.

### Unchanged

`jobPositions`, `teamMembers`, and `completedProjects` collections and their accessors in `lib/hygraph.ts` are untouched.

### Explicit exclusions

- **Contact sidebar details** (phone, email, address, hours, social links) stay hardcoded. They are global rather than page-scoped — the phone number is currently duplicated across at least `Hero.tsx`, `CTABanner.tsx`, `contact/page.tsx`, and the contact metadata — so doing them correctly requires a `SiteSettings` singleton. Deferred to a follow-up.
- **Brand logo wall** (`BrandPartners.tsx`) stays in code; it is image assets, not text.
- **Nav and footer** stay in code.

**Known inconsistency:** `CtaBlock` gives the owner editable phone fields on the home hero and CTA banner, but the contact sidebar and footer phone remain code-only. Accepted for this phase; resolved by the `SiteSettings` follow-up.

## Architecture

### File layout

```
lib/
~ hygraph.ts              + hygraphFetchSafe() alongside existing hygraphFetch
+ content/
  + types.ts              PageHero, IconCard, IconLabel, Stat, Testimonial, CtaBlock
  + icons.ts              IconName union + ICON_MAP + fallback icon
  + merge.ts              str() / num() / list() helpers

app/(site)/
+ content.ts              home
~ page.tsx
+ about/content.ts      ~ about/page.tsx      ~ about/AboutContent.tsx
+ services/content.ts   ~ services/page.tsx   ~ services/ServicesGrid.tsx  ~ services/ProcessSection.tsx
+ careers/content.ts    ~ careers/page.tsx    ~ careers/CareersContent.tsx
+ gallery/content.ts    ~ gallery/page.tsx
+ contact/content.ts    ~ contact/page.tsx

components/home/          ~ Hero, StatsBar, ServicesPreview, Testimonials, CTABanner
+ vitest.config.ts
~ package.json            + vitest devDependency, + "test" script
```

Approximately 11 new files and 15 modified. Nothing is deleted.

### Data flow

```
ServicesPage entry in Hygraph
        │  ONE GraphQL query (hero + services[] + processSteps[] together)
        ▼
hygraphFetchSafe()  ── error? ──► strict: throw │ runtime: console.warn + null
        ▼
getServicesContent()   wrapped in React cache()
        │  merge CMS over DEFAULTS, field by field
        ▼
   ServicesContent  (fully typed, no nulls, no optionals)
        │
        ├──► generateMetadata()  ← same cached call, zero extra requests
        └──► page.tsx ──► <ServicesGrid items={…} />  <ProcessSection … />
```

One network request per page, not one per section, because every section is a field on the same page model. `cache()` from React is what makes `generateMetadata` free — without it each page fetches twice per render.

### The merge

Each `content.ts` writes an explicit, typed merge using three helpers from `lib/content/merge.ts`:

```ts
str(v, fallback)   // null, undefined, or whitespace-only → fallback
num(v, fallback)   // null or undefined → fallback
list(v, fallback)  // null or empty array → fallback
```

Empty-string handling is the reason `str()` exists rather than `??`: Hygraph returns `""` for a field an editor has cleared, and `??` would render a blank headline.

Arrays are all-or-nothing. A partly-filled services list means the owner is mid-edit; interleaving CMS items with defaults would produce nonsense output.

Shape of each module:

```ts
const DEFAULTS: ServicesContent = { /* today's exact copy, lifted verbatim */ };

export const getServicesContent = cache(async (): Promise<ServicesContent> => {
  const data = await hygraphFetchSafe<{ servicesPage: ServicesPageQuery | null }>(QUERY);
  const cms = data?.servicesPage;
  if (!cms) return DEFAULTS;

  return {
    seoTitle: str(cms.seoTitle, DEFAULTS.seoTitle),
    hero: {
      eyebrow:  str(cms.hero?.eyebrow,  DEFAULTS.hero.eyebrow),
      headline: str(cms.hero?.headline, DEFAULTS.hero.headline),
      // …
    },
    services:     list(cms.services,     DEFAULTS.services),
    processSteps: list(cms.processSteps, DEFAULTS.processSteps),
  };
});
```

Verbose by design: every fallback is visible at the point it applies, and the returned type has no optionals, so downstream components never null-check.

### Icons

Defaults store icons as enum strings (`icon: "Hammer"`), identical to what the CMS returns, so the merged type is uniform. Resolution happens at render inside the component:

```tsx
const Icon = ICON_MAP[step.icon] ?? IconCircle;
```

This is also what makes `"use client"` section components work — enum strings serialize across the server/client boundary; React components do not.

### Failure behavior

`hygraphFetchSafe` branches on `process.env.HYGRAPH_STRICT`:

| Context | Setting | Behavior | Rationale |
|---|---|---|---|
| CI build | `HYGRAPH_STRICT=1` | Throw — build fails, previous deploy keeps serving | A misconfigured CMS surfaces at deploy time instead of silently shipping defaults |
| Runtime revalidation | unset | Catch, `console.warn`, return `null` → defaults render | A CMS blip must never 500 the live site |

This split exists because ISR caches whatever a revalidation produces. Without the strict build flag, a deploy during a Hygraph outage would bake defaults into the cache and silently revert the owner's published copy.

The existing throwing `hygraphFetch` is retained for the three collection queries, where a hard failure is preferable to an empty list.

### Changes to existing behavior

- `services/page.tsx` and `contact/page.tsx` are currently synchronous with static `metadata` exports. Both become `async` with `generateMetadata`, and gain `export const revalidate = 60` to match the other four pages.
- `about/page.tsx:15` and `careers/page.tsx:16` already hand-roll try/catch around their collection fetches. Those blocks collapse into `hygraphFetchSafe`, removing duplicated error handling.
- Section components stop owning their data. `ServicesGrid`, `ProcessSection`, `Testimonials`, `StatsBar`, `ServicesPreview`, `Hero`, and `CTABanner` take content as props instead of reading module-level arrays.

## Testing

Vitest is added as a dev dependency with a `test` script, scoped to the merge layer — the only pure, logic-bearing code this change introduces.

Cases covered per page module:

- CMS returns `null` (unpublished entry or fetch failure) → full `DEFAULTS` returned
- CMS returns a complete entry → every CMS value wins
- CMS returns a cleared string (`""`, `"   "`) → that field falls back, siblings keep CMS values
- CMS returns an empty array → the whole default list is used, not a partial render
- CMS returns an unmapped icon enum value → fallback icon, no throw
- `HYGRAPH_STRICT=1` + fetch error → throws
- `HYGRAPH_STRICT` unset + fetch error → returns defaults, warns

Per-page manual verification, in addition:

1. `npx tsc --noEmit`
2. `biome check .`
3. `next build`
4. In Hygraph: unpublish the page entry, confirm the page renders identically to today
5. Republish with an edited headline, confirm it appears within 60 seconds

## Rollout

Services first, end to end. It is self-contained, and its hero plus `services[]` plus `processSteps[]` exercise `PageHero`, `IconCard`, the icon enum, and both merge helpers — so every mechanism the other five pages need is proven once before it is repeated.

Then, in order: **Home** (largest — two `CtaBlock`s, stats, testimonials, services preview), **About**, **Careers**, **Gallery**, **Contact**.

Each page is an independent, shippable commit. Stopping after any page leaves the site in a consistent state: some pages CMS-driven, the rest hardcoded, all rendering correctly.

## Follow-ups (not in scope)

- `SiteSettings` singleton for phone, email, address, hours, and social links — resolves the phone-number duplication across four files and the noted `CtaBlock` inconsistency.
- Hygraph webhook → `app/api/revalidate/route.ts` for instant publishing, if 60-second ISR proves too slow.
- Brand logo wall moved to Hygraph assets.
