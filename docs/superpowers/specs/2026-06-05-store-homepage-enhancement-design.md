# Store Homepage Enhancement — Design

**Date:** 2026-06-05
**Route:** `/store` (`app/(site)/store/page.tsx`)
**Approach:** Augment in place — keep section order, add real-data sections, fix the dead gap, light polish.

## Goals (from the user)

1. **Fill the thin middle** — the page jumps Build → 4 New Arrivals → Brand → CTA, and has a large empty white gap above the footer.
2. **Visual polish / premium feel.**
3. **Vehicle-aware shopping** — react to the selected vehicle.

Explicitly **not** pursuing reviews/social-proof (no review data source exists).

## Data realities (verified)

- `listProductsByVehicle({year,make,model,submodel})` exists (`lib/store/fitments-source`) → real fitment results. No client-callable action yet → one must be added.
- Collections exist and are all category-style, but have **no images** → category tiles use the gradient+icon fallback (same as Shop by Build).
- `listNewProducts(n)` returns first N products → can bump 4 → 8.
- Brands = 6 vendors, **no logo assets** → keep wordmarks.
- `compareAtPrice` is wired, but **no product is on sale today** → a Deals row would be empty.
- Featured (`tag:featured`) and `is_top_level` category metafields are still unset → those original sections stay empty; the new category grid sources from real collection handles instead.

## Section lineup (top → bottom)

1. **Hero** — light contrast/spacing polish.
2. **Value strip** — keep.
3. **Vehicle card (+Reset)** — keep.
4. **🆕 Vehicle-aware rail** — client component reading `useSelectedVehicle`. When a vehicle is selected, shows parts that fit it (`fitsVehicle` badge) + "View all" → `/store/vehicle?...`. **Hidden when no vehicle selected.** Driven by a new `listProductsByVehicleAction` server action.
5. **Shop by Build** — keep.
6. **🆕 Shop by Category** — real grid of ~8 curated, existing collection handles → `/store/categories/{handle}`, gradient+icon tiles.
7. **New Arrivals** — bump 4 → 8 products.
8. **Shop by Brand** — restyle wordmark tiles to look intentional/uniform.
9. **CTA banner** — keep.
10. **🛠 Empty gap** — investigate and remove the dead white space above the footer.

## Confirmed choices

- Vehicle rail when no vehicle selected → **hide**.
- Deals / On Sale row → **skip** (would be empty today).
- Brand logos → **polished wordmarks** (no logo files).

## New/changed units

- `lib/store/fitment-actions.ts` — add `listProductsByVehicleAction(vehicle)` (thin wrapper over `listProductsByVehicle`).
- `components/store/VehicleFitRail.tsx` (new, client) — reads selected vehicle, fetches via the action, renders a `ProductGrid`; renders nothing when no vehicle or no results.
- `components/store/CategoryGrid.tsx` (new) — curated real collection handles → category tiles. (Or inline in page if small.)
- `app/(site)/store/page.tsx` — insert rail + category grid, bump New Arrivals to 8, remove the gap.
- `components/store/BrandGrid.tsx` — wordmark tile polish.

## Out of scope

Featured/Best-Seller section, reviews, on-sale row, brand logos, full restructure.
