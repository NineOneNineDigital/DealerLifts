# Hygraph-Editable Page Content — Phase 1 (Foundation + Services) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the shared content layer (merge helpers, icon map, types, safe fetch) and prove it end-to-end by making the Services page fully editable in Hygraph.

**Architecture:** Each marketing page gets a `content.ts` module beside its `page.tsx`. That module owns a typed `DEFAULTS` object holding today's copy verbatim, a pure `merge*Content()` function that layers a nullable Hygraph response over those defaults field by field, and a `cache()`-wrapped `get*Content()` that fetches and merges. Section components stop owning module-level data arrays and take content as props. Icons never cross the CMS or the server/client boundary as components — they travel as enum strings and resolve through `ICON_MAP` at render.

**Tech Stack:** Next.js 16 (App Router), React 19 (`cache`), TypeScript, Tailwind 4, Hygraph GraphQL Content API, Vitest (new), Biome (existing lint).

**Spec:** `docs/superpowers/specs/2026-08-20-hygraph-page-content-design.md`

## Global Constraints

- **Copy must be lifted verbatim.** Every string in a `DEFAULTS` object must byte-match what the component renders today, including em dashes (`—`), non-breaking spaces (` `), escaped inch marks (`2"`, `12"`), and ampersands. A page rendering with `DEFAULTS` must be pixel-identical to the current site.
- **No optionals in merged output types.** Fields that may be absent use `""` (strings) or `[]` (lists), never `?`. Downstream components must never null-check.
- **Icons are enum strings end-to-end.** `DEFAULTS` store `icon: "Hammer"`, identical to what the CMS returns. Resolution happens only at render via `resolveIcon()`. Never pass a React component as a prop into a `"use client"` component.
- **Single-entry models are queried as plural lists with `first: 1`.** Hygraph's generated singular query (`servicesPage(where:)`) requires an ID we do not know. Always query `servicesPages(first: 1)` and take `[0] ?? null`.
- **Empty string means absent.** Hygraph returns `""` for a field an editor cleared. `??` is forbidden for string fields; use `str()`.
- **Arrays are all-or-nothing.** A non-empty CMS array replaces the default list entirely; an empty or null array falls back to the whole default list. Never interleave.
- **`revalidate = 60`** on every page module touched.
- Lint with `biome check .` (not eslint). Format with `biome check --write .`.
- Existing `hygraphFetch` and the three collection accessors in `lib/hygraph.ts` must keep working unchanged.

---

### Task 1: Vitest setup and merge helpers

**Files:**
- Create: `lib/content/merge.ts`
- Create: `lib/content/merge.test.ts`
- Create: `vitest.config.ts`
- Modify: `package.json` (add `vitest` devDependency, add `test` script)

**Interfaces:**
- Consumes: nothing (first task)
- Produces:
  - `str(value: string | null | undefined, fallback: string): string`
  - `num(value: number | null | undefined, fallback: number): number`
  - `list<T>(value: readonly T[] | null | undefined, fallback: T[]): T[]`

- [ ] **Step 1: Install Vitest**

```bash
npm install -D vitest@^3
```

- [ ] **Step 2: Create `vitest.config.ts`**

The `@/` path alias is used throughout this repo (see `tsconfig.json`). Vitest does not read `tsconfig` paths on its own, so alias it explicitly rather than adding a `vite-tsconfig-paths` dependency.

```ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "app/**/*.test.ts"],
  },
});
```

- [ ] **Step 3: Add the `test` script to `package.json`**

Add to the `scripts` object, after `"lint"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Write the failing tests**

Create `lib/content/merge.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { list, num, str } from "@/lib/content/merge";

describe("str", () => {
  it("returns the CMS value when present", () => {
    expect(str("From the CMS", "default")).toBe("From the CMS");
  });

  it("trims surrounding whitespace from the CMS value", () => {
    expect(str("  Padded  ", "default")).toBe("Padded");
  });

  it("falls back when the value is null", () => {
    expect(str(null, "default")).toBe("default");
  });

  it("falls back when the value is undefined", () => {
    expect(str(undefined, "default")).toBe("default");
  });

  it("falls back when an editor cleared the field to an empty string", () => {
    expect(str("", "default")).toBe("default");
  });

  it("falls back when the field contains only whitespace", () => {
    expect(str("   \n\t ", "default")).toBe("default");
  });

  it("preserves a value that is legitimately the string 0", () => {
    expect(str("0", "default")).toBe("0");
  });
});

describe("num", () => {
  it("returns the CMS value when present", () => {
    expect(num(42, 7)).toBe(42);
  });

  it("preserves a legitimate zero rather than falling back", () => {
    expect(num(0, 7)).toBe(0);
  });

  it("falls back when the value is null", () => {
    expect(num(null, 7)).toBe(7);
  });

  it("falls back when the value is undefined", () => {
    expect(num(undefined, 7)).toBe(7);
  });
});

describe("list", () => {
  it("returns the CMS list when it has items", () => {
    expect(list(["a", "b"], ["fallback"])).toEqual(["a", "b"]);
  });

  it("falls back to the whole default list when the CMS list is empty", () => {
    expect(list([], ["fallback"])).toEqual(["fallback"]);
  });

  it("falls back when the CMS list is null", () => {
    expect(list(null, ["fallback"])).toEqual(["fallback"]);
  });

  it("falls back when the CMS list is undefined", () => {
    expect(list(undefined, ["fallback"])).toEqual(["fallback"]);
  });

  it("never interleaves CMS items with default items", () => {
    expect(list(["only"], ["a", "b", "c"])).toEqual(["only"]);
  });

  it("returns a copy so callers cannot mutate the CMS response", () => {
    const cms = ["a"];
    const result = list(cms, ["fallback"]);
    result.push("b");
    expect(cms).toEqual(["a"]);
  });
});
```

- [ ] **Step 5: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "@/lib/content/merge"`

- [ ] **Step 6: Write the implementation**

Create `lib/content/merge.ts`:

```ts
/**
 * Field-level fallback helpers for merging a Hygraph response over a typed
 * DEFAULTS object.
 *
 * Hygraph returns `null` for a field that was never set and `""` for one an
 * editor cleared, so `??` is not sufficient — it would happily render a blank
 * headline. These helpers treat "absent" as null, undefined, or blank.
 */

/** CMS string, or the fallback when null, undefined, or whitespace-only. */
export function str(
  value: string | null | undefined,
  fallback: string
): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

/** CMS number, or the fallback when null or undefined. Zero is preserved. */
export function num(
  value: number | null | undefined,
  fallback: number
): number {
  return value ?? fallback;
}

/**
 * CMS list, or the entire fallback list when null/undefined/empty.
 *
 * All-or-nothing by design: a partly-filled list means the owner is mid-edit,
 * and interleaving CMS items with defaults would produce nonsense output.
 */
export function list<T>(
  value: readonly T[] | null | undefined,
  fallback: T[]
): T[] {
  return value && value.length > 0 ? [...value] : fallback;
}
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `npm test`
Expected: PASS — 17 tests passing

- [ ] **Step 8: Lint**

Run: `npx biome check .`
Expected: no errors. If Biome reports formatting differences, run `npx biome check --write .` and re-run.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json vitest.config.ts lib/content/merge.ts lib/content/merge.test.ts
git commit -m "Add Vitest and typed merge helpers for CMS content fallbacks"
```

---

### Task 2: Icon map and shared content types

**Files:**
- Create: `lib/content/icons.ts`
- Create: `lib/content/icons.test.ts`
- Create: `lib/content/types.ts`

**Interfaces:**
- Consumes: nothing from Task 1
- Produces:
  - `ICON_MAP` — `Record<IconName, TablerIcon>`
  - `type IconName` — union of the 20 supported enum strings
  - `resolveIcon(name: string | null | undefined): TablerIcon`
  - Types `PageHero`, `IconCard`, `IconLabel`, `Stat`, `Testimonial`, `CtaBlock`
  - Raw (nullable) CMS types `RawPageHero`, `RawIconCard`, `RawIconLabel`, `RawStat`, `RawTestimonial`, `RawCtaBlock`

**Context:** the 20 icon names below are the union of every Tabler icon currently referenced across all six pages — `ServicesGrid.tsx`, `ProcessSection.tsx`, `ServicesPreview.tsx`, `AboutContent.tsx` (`strengths`), and `CareersContent.tsx` (`perks`). Defining all 20 now means later phases never revisit this file.

- [ ] **Step 1: Write the failing test**

Create `lib/content/icons.test.ts`:

```ts
import {
  IconCircle,
  IconHammer,
  IconMessageCircle,
} from "@tabler/icons-react";
import { describe, expect, it } from "vitest";
import { ICON_MAP, resolveIcon } from "@/lib/content/icons";

describe("resolveIcon", () => {
  it("resolves a known enum name to its Tabler component", () => {
    expect(resolveIcon("Hammer")).toBe(IconHammer);
  });

  it("resolves every key declared in ICON_MAP", () => {
    for (const name of Object.keys(ICON_MAP)) {
      expect(resolveIcon(name)).toBe(
        ICON_MAP[name as keyof typeof ICON_MAP]
      );
    }
  });

  it("falls back to a neutral icon for an unmapped CMS value", () => {
    expect(resolveIcon("NotARealIcon")).toBe(IconCircle);
  });

  it("falls back when the CMS returns null", () => {
    expect(resolveIcon(null)).toBe(IconCircle);
  });

  it("falls back when the CMS returns undefined", () => {
    expect(resolveIcon(undefined)).toBe(IconCircle);
  });

  it("falls back on an empty string", () => {
    expect(resolveIcon("")).toBe(IconCircle);
  });

  it("does not resolve inherited Object properties", () => {
    expect(resolveIcon("toString")).toBe(IconCircle);
    expect(resolveIcon("constructor")).toBe(IconCircle);
  });
});

describe("ICON_MAP", () => {
  it("covers every icon used across the marketing pages", () => {
    expect(ICON_MAP.MessageCircle).toBe(IconMessageCircle);
    expect(Object.keys(ICON_MAP)).toHaveLength(20);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "@/lib/content/icons"`

- [ ] **Step 3: Write `lib/content/icons.ts`**

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS — all `icons.test.ts` tests green, `merge.test.ts` still green

- [ ] **Step 5: Write `lib/content/types.ts`**

No test for this step — it is types only, verified by `tsc`.

```ts
import type { IconName } from "@/lib/content/icons";

/*
 * Merged content types. Fields that may be absent use "" or [] rather than
 * optionals, so components never null-check.
 */

export interface PageHero {
  eyebrow: string;
  headline: string;
  /** Rendered as a gradient span after the headline. "" when unused. */
  headlineAccent: string;
  subhead: string;
}

export interface IconCard {
  icon: IconName;
  title: string;
  description: string;
  /** Chip row under the description. Rendered as "brands" on the services
   *  grid and "tags" on the services preview. Empty for process steps. */
  tags: string[];
  /** "" when the card is not a link. */
  href: string;
}

export interface IconLabel {
  icon: IconName;
  label: string;
}

export interface Stat {
  /** Maps to AnimatedCounter's `target` prop. */
  value: number;
  suffix: string;
  label: string;
}

export interface Testimonial {
  name: string;
  vehicle: string;
  quote: string;
}

export interface CtaBlock {
  /** "" on the home hero, which opens directly on the h1. */
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  subhead: string;
  buttonLabel: string;
  buttonHref: string;
  phoneLabel: string;
  phoneHref: string;
}

/*
 * Raw Hygraph response shapes. Every field is nullable — an unpublished entry,
 * a cleared field, and a never-set field all arrive as null or "".
 */

export interface RawPageHero {
  eyebrow?: string | null;
  headline?: string | null;
  headlineAccent?: string | null;
  subhead?: string | null;
}

export interface RawIconCard {
  icon?: string | null;
  title?: string | null;
  description?: string | null;
  tags?: string[] | null;
  href?: string | null;
}

export interface RawIconLabel {
  icon?: string | null;
  label?: string | null;
}

export interface RawStat {
  value?: number | null;
  suffix?: string | null;
  label?: string | null;
}

export interface RawTestimonial {
  name?: string | null;
  vehicle?: string | null;
  quote?: string | null;
}

export interface RawCtaBlock {
  eyebrow?: string | null;
  headline?: string | null;
  headlineAccent?: string | null;
  subhead?: string | null;
  buttonLabel?: string | null;
  buttonHref?: string | null;
  phoneLabel?: string | null;
  phoneHref?: string | null;
}
```

- [ ] **Step 6: Typecheck and lint**

Run: `npx tsc --noEmit && npx biome check .`
Expected: no errors

- [ ] **Step 7: Commit**

```bash
git add lib/content/icons.ts lib/content/icons.test.ts lib/content/types.ts
git commit -m "Add CMS icon enum map and shared content types"
```

---

### Task 3: Safe Hygraph fetch with strict-at-build behavior

**Files:**
- Modify: `lib/hygraph.ts` (append after `hygraphFetch`, around line 45)
- Create: `lib/hygraph-safe.test.ts`

**Interfaces:**
- Consumes: existing `hygraphFetch<T>()` from `lib/hygraph.ts:4`
- Produces: `hygraphFetchSafe<T>(query, variables?, options?): Promise<T | null>`

**Context:** `hygraphFetch` throws on any failure — missing endpoint, non-2xx, GraphQL errors, or no data. That behavior is correct for the three collection accessors and must not change. `hygraphFetchSafe` wraps it so page content can fall back to defaults instead of 500ing, except during CI builds where a hard failure is preferable to silently shipping defaults.

`HYGRAPH_STRICT` must be read **inside** the function, not at module scope, so tests can vary it without module cache games.

- [ ] **Step 1: Write the failing test**

Create `lib/hygraph-safe.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { hygraphFetchSafe } from "@/lib/hygraph";

const QUERY = /* GraphQL */ `
  query Ping {
    __typename
  }
`;

beforeEach(() => {
  vi.stubEnv("HYGRAPH_CONTENT_API_URL", "https://example.test/graphql");
  vi.stubEnv("HYGRAPH_STRICT", "");
  vi.spyOn(console, "warn").mockImplementation(() => {
    // silence expected fallback warnings
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function stubFetch(impl: () => Promise<unknown>) {
  vi.stubGlobal("fetch", vi.fn(impl));
}

describe("hygraphFetchSafe", () => {
  it("returns data on success", async () => {
    stubFetch(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { __typename: "Query" } }),
      })
    );

    await expect(hygraphFetchSafe(QUERY)).resolves.toEqual({
      __typename: "Query",
    });
  });

  it("returns null when the network request rejects", async () => {
    stubFetch(() => Promise.reject(new Error("ECONNREFUSED")));

    await expect(hygraphFetchSafe(QUERY)).resolves.toBeNull();
  });

  it("returns null on a non-2xx response", async () => {
    stubFetch(() =>
      Promise.resolve({ ok: false, status: 503, statusText: "Unavailable" })
    );

    await expect(hygraphFetchSafe(QUERY)).resolves.toBeNull();
  });

  it("returns null when Hygraph reports GraphQL errors", async () => {
    stubFetch(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({ errors: [{ message: "Unknown field" }] }),
      })
    );

    await expect(hygraphFetchSafe(QUERY)).resolves.toBeNull();
  });

  it("warns when falling back so the failure is visible in logs", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {
      // captured below
    });
    stubFetch(() => Promise.reject(new Error("ECONNREFUSED")));

    await hygraphFetchSafe(QUERY);

    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0][0]).toContain("ECONNREFUSED");
  });

  it("throws instead of falling back when HYGRAPH_STRICT is set", async () => {
    vi.stubEnv("HYGRAPH_STRICT", "1");
    stubFetch(() => Promise.reject(new Error("ECONNREFUSED")));

    await expect(hygraphFetchSafe(QUERY)).rejects.toThrow("ECONNREFUSED");
  });

  it("throws in strict mode when the endpoint is not configured", async () => {
    vi.stubEnv("HYGRAPH_CONTENT_API_URL", "");
    vi.stubEnv("HYGRAPH_STRICT", "1");

    await expect(hygraphFetchSafe(QUERY)).rejects.toThrow(
      "HYGRAPH_CONTENT_API_URL"
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `hygraphFetchSafe` is not exported from `@/lib/hygraph`

- [ ] **Step 3: Make the endpoint read lazily**

`lib/hygraph.ts:1-2` currently captures env at module scope:

```ts
const ENDPOINT = process.env.HYGRAPH_CONTENT_API_URL;
const READ_TOKEN = process.env.HYGRAPH_CONTENT_API_READ_TOKEN;
```

Module-scope capture makes the endpoint untestable and, more importantly, freezes the value at import time. Replace those two lines with nothing, and inside `hygraphFetch` replace the two usages. Change the opening of `hygraphFetch` from:

```ts
  if (!ENDPOINT) {
```

to:

```ts
  const ENDPOINT = process.env.HYGRAPH_CONTENT_API_URL;
  const READ_TOKEN = process.env.HYGRAPH_CONTENT_API_READ_TOKEN;

  if (!ENDPOINT) {
```

The rest of `hygraphFetch` is unchanged — it already references `ENDPOINT` and `READ_TOKEN` by those names.

- [ ] **Step 4: Append `hygraphFetchSafe` to `lib/hygraph.ts`**

Insert immediately after the closing brace of `hygraphFetch` (before the `JobPosition` interface):

```ts
/**
 * Non-throwing wrapper around {@link hygraphFetch} for page content.
 *
 * Page content merges over typed code defaults, so a CMS failure should
 * degrade rather than 500 — except during CI builds, where shipping defaults
 * in place of published copy silently reverts the site. `HYGRAPH_STRICT=1`
 * makes the build fail loudly instead.
 *
 * Collection accessors (jobs, team, projects) keep using the throwing
 * `hygraphFetch`, where an empty list is worse than a visible error.
 */
export async function hygraphFetchSafe<T>(
  query: string,
  variables?: Record<string, unknown>,
  options?: { revalidate?: number }
): Promise<T | null> {
  try {
    return await hygraphFetch<T>(query, variables, options);
  } catch (error) {
    if (process.env.HYGRAPH_STRICT === "1") {
      throw error;
    }

    const message = error instanceof Error ? error.message : String(error);
    console.warn(
      `[hygraph] content fetch failed, falling back to defaults: ${message}`
    );
    return null;
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test`
Expected: PASS — all `hygraph-safe.test.ts` tests green, earlier suites still green

- [ ] **Step 6: Verify the existing collection accessors still work**

Run: `npx tsc --noEmit && npx biome check . && npm run build`
Expected: build succeeds. The About, Careers, and Gallery pages still fetch through the unchanged `hygraphFetch`.

- [ ] **Step 7: Commit**

```bash
git add lib/hygraph.ts lib/hygraph-safe.test.ts
git commit -m "Add hygraphFetchSafe with strict-at-build, forgiving-at-runtime behavior"
```

---

### Task 4: Create the Services schema in Hygraph

**Files:** none — this task is performed in the Hygraph Studio UI.

**Interfaces:**
- Consumes: the `IconName` values from `lib/content/icons.ts` (Task 2)
- Produces: a `ServicesPage` model queryable as `servicesPages(first: 1)`, with exactly the field names Task 5's GraphQL query expects

**Why manual:** Hygraph schema is managed in its Studio, not in this repo. Field API IDs must match the query in Task 5 exactly or the query returns GraphQL errors (which `hygraphFetchSafe` will swallow into a silent defaults fallback — so verify with Step 7 below rather than trusting the page to look right).

- [ ] **Step 1: Create the `IconName` enumeration**

In Hygraph → **Schema** → **Enumerations** → **Add Enumeration**. Name: `IconName`. Add these 20 values, exactly as spelled (they are the keys of `ICON_MAP`):

```
ArrowUp, Bulb, CalendarCheck, Car4wd, Certificate, CircleCheck, Clock24,
Disc, Droplet, Engine, FileDescription, Hammer, Heart, MessageCircle,
ShieldCheck, Star, Tool, Trophy, Users, Wheel
```

- [ ] **Step 2: Create the `PageHero` component**

Schema → **Components** → **Add Component**. Name: `PageHero`. Fields (all Single line text):

| Display name | API ID | Required |
|---|---|---|
| Eyebrow | `eyebrow` | no |
| Headline | `headline` | no |
| Headline accent | `headlineAccent` | no |
| Subhead | `subhead` | no |

Leave every field optional — the code supplies defaults, and required fields would block the editor from clearing one.

- [ ] **Step 3: Create the `IconCard` component**

Schema → Components → Add Component. Name: `IconCard`. Fields:

| Display name | API ID | Type | Notes |
|---|---|---|---|
| Icon | `icon` | Enumeration → `IconName` | |
| Title | `title` | Single line text | |
| Description | `description` | Multi line text | |
| Tags | `tags` | Single line text | **enable "Allow multiple values"** |
| Link | `href` | Single line text | |

- [ ] **Step 4: Create the `ServicesPage` model**

Schema → **Models** → **Add Model**. Name: `Services Page`, API ID `ServicesPage`, plural API ID `servicesPages`. Fields:

| Display name | API ID | Type |
|---|---|---|
| SEO title | `seoTitle` | Single line text |
| SEO description | `seoDescription` | Multi line text |
| Hero | `hero` | Component → `PageHero` (single) |
| Services | `services` | Component → `IconCard`, **multiple** |
| Process eyebrow | `processEyebrow` | Single line text |
| Process heading | `processHeading` | Single line text |
| Process CTA label | `processCtaLabel` | Single line text |
| Process CTA link | `processCtaHref` | Single line text |
| Process steps | `processSteps` | Component → `IconCard`, **multiple** |

- [ ] **Step 5: Create and publish the single entry**

Content → Services Page → **Add entry**. Fill every field with the current site copy — it is reproduced verbatim in Task 5's `SERVICES_DEFAULTS`; copy from there so the two match. Then **Publish**.

Create exactly one entry. The query takes `[0]`, so a second entry would be silently ignored.

- [ ] **Step 6: Grant read access to the published content**

Project Settings → **API Access** → **Public Content API**. Ensure `ServicesPage` has **Read** permission on the **Published** stage. Without this the query returns no data and the page silently renders defaults.

- [ ] **Step 7: Verify the query works before writing any code**

Run this against your endpoint, substituting `$HYGRAPH_CONTENT_API_URL` from `.env.local`:

```bash
curl -s "$HYGRAPH_CONTENT_API_URL" \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ servicesPages(first: 1) { seoTitle hero { eyebrow headline headlineAccent subhead } services { icon title description tags href } processEyebrow processHeading processCtaLabel processCtaHref processSteps { icon title description tags href } } }"}' \
  | head -c 2000
```

Expected: JSON containing `"servicesPages":[{...}]` with your copy, and **no** `"errors"` key.

If you see `"errors"`, the field API IDs do not match — fix them in Studio before continuing. Do not proceed to Task 5 until this returns clean data.

- [ ] **Step 8: Record the schema in the repo**

There is no code change to commit, so leave a note for the next developer. Append to `docs/deploy/environments.md` under the Hygraph section (or create a short `docs/hygraph-schema.md` if no such section exists):

```markdown
### Page content models

`ServicesPage` (single entry, queried as `servicesPages(first: 1)`) drives
`app/(site)/services/`. Components: `PageHero`, `IconCard`. Enumeration:
`IconName` — values must stay in sync with `ICON_MAP` in `lib/content/icons.ts`.
Public Content API needs Read on the Published stage for each page model.
```

```bash
git add docs/
git commit -m "Document Hygraph ServicesPage schema"
```

---

### Task 5: Services content module

**Files:**
- Create: `app/(site)/services/content.ts`
- Create: `app/(site)/services/content.test.ts`

**Interfaces:**
- Consumes: `str`, `list` (Task 1); `IconName`, `IconCard`, `PageHero`, `RawIconCard`, `RawPageHero` (Task 2); `hygraphFetchSafe` (Task 3); the `ServicesPage` schema (Task 4)
- Produces:
  - `interface ServicesContent { seoTitle, seoDescription, hero: PageHero, services: IconCard[], processEyebrow, processHeading, processCtaLabel, processCtaHref, processSteps: IconCard[] }`
  - `SERVICES_DEFAULTS: ServicesContent`
  - `mergeServicesContent(cms: RawServicesPage | null): ServicesContent` — pure, exported for tests
  - `getServicesContent(): Promise<ServicesContent>` — `cache()`-wrapped

**Why the merge is exported separately:** `getServicesContent` is wrapped in React's `cache()`, which is only meaningful inside a request render. Keeping the merge pure and separately exported means the tests never touch `cache()` or `fetch`.

- [ ] **Step 1: Write the failing test**

Create `app/(site)/services/content.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  mergeServicesContent,
  SERVICES_DEFAULTS,
} from "@/app/(site)/services/content";

describe("mergeServicesContent", () => {
  it("returns the full defaults when the entry is unpublished or the fetch failed", () => {
    expect(mergeServicesContent(null)).toEqual(SERVICES_DEFAULTS);
  });

  it("returns the full defaults for an entry with every field empty", () => {
    expect(mergeServicesContent({})).toEqual(SERVICES_DEFAULTS);
  });

  it("lets CMS values win over defaults", () => {
    const result = mergeServicesContent({
      seoTitle: "Our Services",
      hero: { headline: "New headline" },
    });

    expect(result.seoTitle).toBe("Our Services");
    expect(result.hero.headline).toBe("New headline");
  });

  it("falls back per field, not per object, when a hero field is cleared", () => {
    const result = mergeServicesContent({
      hero: { headline: "New headline", eyebrow: "" },
    });

    expect(result.hero.headline).toBe("New headline");
    expect(result.hero.eyebrow).toBe(SERVICES_DEFAULTS.hero.eyebrow);
    expect(result.hero.subhead).toBe(SERVICES_DEFAULTS.hero.subhead);
  });

  it("replaces the whole services list rather than interleaving", () => {
    const result = mergeServicesContent({
      services: [
        {
          icon: "Hammer",
          title: "Only service",
          description: "Just the one.",
          tags: ["A"],
        },
      ],
    });

    expect(result.services).toHaveLength(1);
    expect(result.services[0].title).toBe("Only service");
  });

  it("falls back to the default services list when the CMS list is empty", () => {
    const result = mergeServicesContent({ services: [] });

    expect(result.services).toEqual(SERVICES_DEFAULTS.services);
  });

  it("normalizes a card missing tags and href to empty values, never undefined", () => {
    const result = mergeServicesContent({
      services: [{ icon: "Hammer", title: "T", description: "D" }],
    });

    expect(result.services[0].tags).toEqual([]);
    expect(result.services[0].href).toBe("");
  });

  it("keeps an unmapped icon as a string for resolveIcon to handle at render", () => {
    const result = mergeServicesContent({
      services: [{ icon: "TotallyMadeUp", title: "T", description: "D" }],
    });

    // String() keeps the assertion honest without fighting the IconName union,
    // which deliberately does not describe unvalidated CMS values.
    expect(String(result.services[0].icon)).toBe("TotallyMadeUp");
  });

  it("merges process steps independently of the services list", () => {
    const result = mergeServicesContent({
      processSteps: [
        { icon: "CircleCheck", title: "Only step", description: "One." },
      ],
    });

    expect(result.processSteps).toHaveLength(1);
    expect(result.services).toEqual(SERVICES_DEFAULTS.services);
  });
});

describe("SERVICES_DEFAULTS", () => {
  it("holds the eight services currently rendered on the site", () => {
    expect(SERVICES_DEFAULTS.services).toHaveLength(8);
  });

  it("holds the four process steps currently rendered on the site", () => {
    expect(SERVICES_DEFAULTS.processSteps).toHaveLength(4);
  });

  it("preserves the escaped inch marks in the lift kit description", () => {
    const lift = SERVICES_DEFAULTS.services.find(
      (s) => s.title === "Lift Kits & Suspension"
    );

    expect(lift?.description).toContain('2" leveling kits');
    expect(lift?.description).toContain('12" full suspension lifts');
  });

  it("preserves the em dash in the hero subhead", () => {
    expect(SERVICES_DEFAULTS.hero.subhead).toContain("—");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `@/app/(site)/services/content`

- [ ] **Step 3: Write `app/(site)/services/content.ts`**

Every string below is lifted verbatim from `app/(site)/services/page.tsx:16-30`, `ServicesGrid.tsx:15-73`, and `ProcessSection.tsx:12-17`.

```ts
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
  seoTitle: string;
  seoDescription: string;
  hero: PageHero;
  services: IconCard[];
  processEyebrow: string;
  processHeading: string;
  processCtaLabel: string;
  processCtaHref: string;
  processSteps: IconCard[];
}

interface RawServicesPage {
  seoTitle?: string | null;
  seoDescription?: string | null;
  hero?: RawPageHero | null;
  services?: RawIconCard[] | null;
  processEyebrow?: string | null;
  processHeading?: string | null;
  processCtaLabel?: string | null;
  processCtaHref?: string | null;
  processSteps?: RawIconCard[] | null;
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS — all 13 `content.test.ts` tests green, earlier suites still green

- [ ] **Step 5: Typecheck and lint**

Run: `npx tsc --noEmit && npx biome check .`
Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add "app/(site)/services/content.ts" "app/(site)/services/content.test.ts"
git commit -m "Add Services page content module with typed defaults and merge"
```

---

### Task 6: Wire the Services page to CMS content

**Files:**
- Modify: `app/(site)/services/page.tsx` (full rewrite, 37 lines)
- Modify: `app/(site)/services/ServicesGrid.tsx:1-73` (remove the `services` array and the direct icon imports; accept props)
- Modify: `app/(site)/services/ProcessSection.tsx:1-17` (remove the `steps` array and the direct icon imports; accept props)

**Interfaces:**
- Consumes: `getServicesContent()`, `ServicesContent` (Task 5); `resolveIcon` (Task 2)
- Produces: `ServicesGrid({ items }: { items: IconCard[] })`, `ProcessSection({ eyebrow, heading, ctaLabel, ctaHref, steps })`

**Critical:** the rendered output must be byte-identical to today when Hygraph returns nothing. The only intended change is where the strings come from.

- [ ] **Step 1: Rewrite `app/(site)/services/page.tsx`**

`metadata` becomes `generateMetadata`, the component becomes `async`, and `revalidate` is added (the file currently has none).

```tsx
import type { Metadata } from "next";
import { getServicesContent } from "./content";
import { ProcessSection } from "./ProcessSection";
import { ServicesGrid } from "./ServicesGrid";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const content = await getServicesContent();

  return {
    title: content.seoTitle,
    description: content.seoDescription,
  };
}

export default async function ServicesPage() {
  const content = await getServicesContent();
  const { hero } = content;

  return (
    <>
      <section className="pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#077BFF] text-sm font-semibold tracking-wide uppercase mb-3">
            {hero.eyebrow}
          </p>
          <h1 className="font-heading text-4xl md:text-5xl font-bold leading-tight">
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
          <p className="mt-4 text-gray-500 text-lg max-w-2xl mx-auto">
            {hero.subhead}
          </p>
        </div>
      </section>

      <ServicesGrid items={content.services} />
      <ProcessSection
        ctaHref={content.processCtaHref}
        ctaLabel={content.processCtaLabel}
        eyebrow={content.processEyebrow}
        heading={content.processHeading}
        steps={content.processSteps}
      />
    </>
  );
}
```

- [ ] **Step 2: Rewrite the head of `ServicesGrid.tsx`**

Replace lines 1-73 (the `"use client"` directive, the eight icon imports, and the entire `services` array) with:

```tsx
"use client";

import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { resolveIcon } from "@/lib/content/icons";
import type { IconCard } from "@/lib/content/types";

interface Props {
  items: IconCard[];
}
```

Then change the function signature from `export function ServicesGrid() {` to:

```tsx
export function ServicesGrid({ items }: Props) {
```

- [ ] **Step 3: Update the `ServicesGrid` render body**

Three edits inside the JSX. Change `services.map((service, i) =>` to:

```tsx
          {items.map((service, i) => {
            const Icon = resolveIcon(service.icon);
            return (
```

Change `<service.icon size={20} className="text-[#077BFF]" />` to:

```tsx
                  <Icon size={20} className="text-[#077BFF]" />
```

Change `service.brands` to `service.tags` in both places (the `.length > 0` guard and the `.map((brand) =>` call). Close the new arrow-function body: the `))}` that ends the map becomes:

```tsx
            );
          })}
```

- [ ] **Step 4: Rewrite the head of `ProcessSection.tsx`**

Replace lines 1-17 (the directive, the four icon imports, and the `steps` array) with:

```tsx
"use client";

import Link from "next/link";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { resolveIcon } from "@/lib/content/icons";
import type { IconCard } from "@/lib/content/types";

interface Props {
  ctaHref: string;
  ctaLabel: string;
  eyebrow: string;
  heading: string;
  steps: IconCard[];
}
```

Then change `export function ProcessSection() {` to:

```tsx
export function ProcessSection({
  ctaHref,
  ctaLabel,
  eyebrow,
  heading,
  steps,
}: Props) {
```

- [ ] **Step 5: Update the `ProcessSection` render body**

Replace the hardcoded `How It Works` text with `{eyebrow}`, `From drop-off to drive-off in four steps.` with `{heading}`, `href="/contact"` with `href={ctaHref}`, and `Request a Quote` with `{ctaLabel}`.

Change `steps.map((step, i) =>` to:

```tsx
          {steps.map((step, i) => {
            const Icon = resolveIcon(step.icon);
            return (
```

Change `<step.icon size={20} className="text-[#077BFF] mb-2" />` to:

```tsx
                  <Icon size={20} className="text-[#077BFF] mb-2" />
```

Close the arrow-function body — the `))}` ending the map becomes:

```tsx
            );
          })}
```

- [ ] **Step 6: Typecheck, lint, and test**

Run: `npx tsc --noEmit && npx biome check . && npm test`
Expected: no errors, all tests pass

- [ ] **Step 7: Verify the defaults path renders identically**

Temporarily point the app at nothing so the fallback engages:

```bash
HYGRAPH_CONTENT_API_URL= npm run dev
```

Visit `http://localhost:3000/services`. Expected: the page looks **exactly** as it does on production today — same eight cards, same brand chips, same four numbered steps. The terminal shows `[hygraph] content fetch failed, falling back to defaults: HYGRAPH_CONTENT_API_URL is not set...`.

Stop the server.

- [ ] **Step 8: Verify the CMS path**

```bash
npm run dev
```

Visit `http://localhost:3000/services` — it should look identical again, this time sourced from Hygraph. Confirm by editing the hero headline in Hygraph, publishing, waiting 60 seconds, and reloading. The new headline appears.

Also confirm `<title>` reflects `seoTitle` (view source or check the browser tab).

- [ ] **Step 9: Verify strict mode fails the build**

```bash
HYGRAPH_STRICT=1 HYGRAPH_CONTENT_API_URL= npm run build
```

Expected: the build **fails** with `HYGRAPH_CONTENT_API_URL is not set`. This confirms CI will not silently ship defaults.

Then confirm a normal build still succeeds:

```bash
npm run build
```

Expected: success.

- [ ] **Step 10: Commit**

```bash
git add "app/(site)/services/page.tsx" "app/(site)/services/ServicesGrid.tsx" "app/(site)/services/ProcessSection.tsx"
git commit -m "Drive Services page content from Hygraph"
```

- [ ] **Step 11: Set `HYGRAPH_STRICT` in CI**

In the Vercel dashboard → Project → Settings → Environment Variables, add `HYGRAPH_STRICT=1` scoped to **Production** and **Preview** builds only. Do not set it in Development.

Note this in `.env.example` under the existing Hygraph section:

```bash
# Set to 1 in CI/build environments so a CMS failure fails the build
# instead of silently shipping code defaults. Leave unset locally.
HYGRAPH_STRICT=
```

```bash
git add .env.example
git commit -m "Document HYGRAPH_STRICT build flag"
```

---

## Phase 2 (separate plan)

Once Services is verified in production, the remaining five pages repeat this exact pattern. Each needs a Hygraph model, a `content.ts` with verbatim defaults, and prop-threading through its section components:

| Page | Model | Components to convert |
|---|---|---|
| Home | `HomePage` | `Hero`, `StatsBar`, `ServicesPreview`, `Testimonials`, `CTABanner` |
| About | `AboutPage` | `AboutContent` (hero, story, strengths) |
| Careers | `CareersPage` | `CareersContent` (hero, perks, apply email) |
| Gallery | `GalleryPage` | hero markup inline in `page.tsx` |
| Contact | `ContactPage` | hero markup inline in `page.tsx` |

Home is the largest and should go first — it needs `CtaBlock`, `Stat`, and `Testimonial` components that Phase 1 does not create, plus the section-header fields for the services preview and testimonials blocks.

That plan gets written after Phase 1 ships, so it can incorporate anything Services teaches us about the pattern.
