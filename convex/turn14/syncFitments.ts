"use node";

import { v } from "convex/values";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { internalAction } from "../_generated/server";
import { getApiBase } from "./config";
import { fetchWithRetry } from "./fetchWithRetry";

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

/**
 * One-shot debug probe: try a list of candidate paths and report which work.
 * Not called from cron — invoke manually from MCP/CLI.
 */
export const probeShape = internalAction({
  args: { path: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const token: string = await ctx.runAction(internal.turn14.auth.ensureToken);
    const candidates = args.path
      ? [args.path]
      : [
          "/v1/years",
          "/v1/makes",
          "/v1/models",
          "/v1/items/fitment/year/2023",
          "/v1/items/fitment/make",
          "/v1/items/fitment/year",
          "/v1/items/fitment/models",
          "/v1/items/fitment/lookup/17492",
          "/v1/items/fitment-vehicles",
          "/v1/ymm",
          "/v1/yearmakemodel",
        ];
    const results: Array<{ url: string; status: number; preview: string }> = [];
    for (const path of candidates) {
      const url = `${getApiBase()}${path}`;
      const res = await fetchWithAuth(url, token);
      const body = await res.text();
      results.push({ url, status: res.status, preview: body.slice(0, 3000) });
    }
    return results;
  },
});

function fetchWithAuth(url: string, token: string): Promise<Response> {
  return fetchWithRetry(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

/**
 * Normalize a raw Turn14 fitment record into {turn14ItemId, year, make, model}.
 *
 * Turn14's fitment endpoint shape is not publicly documented; we accept either:
 *   - JSON:API per-fitment: { id, attributes: { item_id, year, make, model } }
 *   - Per-item embedded:    { id: itemId, attributes: { vehicles: [{year,make,model}, ...] } }
 *   - Top-level:            { item_id, year, make, model }
 *
 * Returns one or more fitment rows per record. Unknown shapes are skipped (logged).
 */
function normalizeFitmentRecord(
  record: Record<string, unknown>
): Array<{ turn14ItemId: number; year: number; make: string; model: string }> {
  const results: Array<{
    turn14ItemId: number;
    year: number;
    make: string;
    model: string;
  }> = [];

  const attrs = (record.attributes as Record<string, unknown>) || record;

  // Shape B: per-item with vehicles array
  const vehicles = attrs.vehicles as
    | Array<{ year?: number | string; make?: string; model?: string }>
    | undefined;
  if (Array.isArray(vehicles) && vehicles.length > 0) {
    const itemId = Number(record.id ?? attrs.item_id ?? attrs.product_id);
    if (!Number.isFinite(itemId)) {
      return results;
    }
    for (const v of vehicles) {
      const year = Number(v.year);
      const make = String(v.make ?? "").trim();
      const model = String(v.model ?? "").trim();
      if (Number.isFinite(year) && make && model) {
        results.push({ turn14ItemId: itemId, year, make, model });
      }
    }
    return results;
  }

  // Shape A / C: flat fitment row
  const itemId = Number(
    attrs.item_id ?? attrs.product_id ?? attrs.itemId ?? record.id
  );
  const year = Number(attrs.year);
  const make = String(attrs.make ?? "").trim();
  const model = String(attrs.model ?? "").trim();
  if (Number.isFinite(itemId) && Number.isFinite(year) && make && model) {
    results.push({ turn14ItemId: itemId, year, make, model });
  }
  return results;
}

/**
 * Start a full fitment sync across all enabled brands.
 * Walks /v1/items/fitment/brand/{id}?page={n} for each brand.
 */
export const startSync = internalAction({
  args: {},
  handler: async (ctx) => {
    // Reentrancy guard — mirrors syncProducts pattern
    const existing = await ctx.runQuery(internal.syncAdmin.getByType, {
      syncType: "fitments",
    });
    if (existing?.status === "running") {
      const age = Date.now() - (existing.lastSyncedAt ?? 0);
      if (age < SIX_HOURS_MS) {
        console.warn(
          "[fitments] Sync already in progress — aborting duplicate start"
        );
        throw new Error("Fitment sync already in progress");
      }
      console.warn(
        "[fitments] Sync status 'running' but stale (>6h) — treating as stuck, proceeding"
      );
    }

    const enabledBrands: Array<{ turn14BrandId: number; brandName: string }> =
      await ctx.runQuery(internal.syncBrands.listEnabled);

    if (enabledBrands.length === 0) {
      console.log("[fitments] No brands enabled — skipping");
      await ctx.runMutation(internal.turn14.syncHelpers.upsertSyncState, {
        syncType: "fitments",
        lastPage: 0,
        status: "complete",
        error: "No brands enabled",
      });
      return;
    }

    const brandIds = enabledBrands.map((b) => b.turn14BrandId);
    const brandNames = enabledBrands.map((b) => b.brandName);

    console.log(
      `[fitments] Starting sync for ${enabledBrands.length} brands:`,
      brandNames.join(", ")
    );

    await ctx.runMutation(internal.turn14.syncHelpers.upsertSyncState, {
      syncType: "fitments",
      lastPage: 0,
      status: "running",
    });

    await ctx.scheduler.runAfter(0, internal.turn14.syncFitments.syncPage, {
      brandIndex: 0,
      brandIds,
      brandNames,
      page: 1,
    });
  },
});

/**
 * Process one page of fitments for one brand, then chain to the next.
 * Buffers all fitments per turn14ItemId so we can replaceProductFitments
 * once per product per page (avoids many partial writes).
 */
export const syncPage = internalAction({
  args: {
    brandIndex: v.number(),
    brandIds: v.array(v.number()),
    brandNames: v.array(v.string()),
    page: v.number(),
  },
  handler: async (ctx, { brandIndex, brandIds, brandNames, page }) => {
    const syncState = await ctx.runQuery(internal.syncAdmin.getByType, {
      syncType: "fitments",
    });
    if (syncState?.status === "cancelled") {
      console.log("[fitments] Cancelled — stopping");
      return;
    }

    const brandId = brandIds[brandIndex];
    const brandName = brandNames[brandIndex];

    let token: string;
    try {
      token = await ctx.runAction(internal.turn14.auth.ensureToken);
    } catch (e) {
      console.error("[fitments] Auth failed:", e);
      await ctx.runMutation(internal.turn14.syncHelpers.upsertSyncState, {
        syncType: "fitments",
        lastPage: page,
        status: "error",
        error: `Auth failed: ${e}`,
      });
      return;
    }

    // Most likely Turn14 path — matches their /v1/items/data/brand/{id} pattern.
    // If this 404s, log the response body and try /v1/fitments/brand/{id}.
    const url = `${getApiBase()}/v1/items/fitment/brand/${brandId}?page=${page}`;
    console.log(
      `[fitments] Brand ${brandIndex + 1}/${brandIds.length} "${brandName}" — page ${page}`
    );

    const res = await fetchWithAuth(url, token);
    if (!res.ok) {
      const body = await res.text();
      console.error(
        `[fitments] HTTP ${res.status} for "${brandName}" page ${page}:`,
        body.slice(0, 400)
      );
      // If 404, the endpoint path is wrong — skip the brand rather than fail the whole sync,
      // so we can still try other brands and have logs to diagnose with.
      if (res.status === 404 || res.status === 405) {
        await advanceToNextBrand(ctx, brandIndex, brandIds, brandNames, page);
        return;
      }
      await ctx.runMutation(internal.turn14.syncHelpers.upsertSyncState, {
        syncType: "fitments",
        lastPage: page,
        status: "error",
        error: `"${brandName}" fitments HTTP ${res.status}`,
      });
      return;
    }

    const json = await res.json();
    const records: Record<string, unknown>[] = json.data || [];
    const totalPages: number = json.meta?.total_pages ?? 1;

    // On page 1 of the first brand, log one record so the user can verify the shape
    if (page === 1 && brandIndex === 0 && records.length > 0) {
      console.log(
        "[fitments] Sample record (verify shape):",
        JSON.stringify(records[0]).slice(0, 600)
      );
    }

    // Group rows by turn14ItemId for one-shot upsert per product
    const grouped = new Map<
      number,
      Array<{ year: number; make: string; model: string }>
    >();
    const makesSeen = new Set<string>();
    const makeModelsSeen = new Set<string>();

    for (const rec of records) {
      const rows = normalizeFitmentRecord(rec);
      for (const r of rows) {
        const arr = grouped.get(r.turn14ItemId) ?? [];
        arr.push({ year: r.year, make: r.make, model: r.model });
        grouped.set(r.turn14ItemId, arr);
        makesSeen.add(r.make);
        makeModelsSeen.add(`${r.make}::${r.model}`);
      }
    }

    console.log(
      `[fitments] "${brandName}" page ${page}/${totalPages}: ${records.length} records, ${grouped.size} products, ${makesSeen.size} makes`
    );

    // Persist makes/models first so the dropdowns can be populated even
    // before all fitments rows land.
    for (const make of makesSeen) {
      await ctx.runMutation(internal.turn14.syncHelpers.ensureVehicleMake, {
        name: make,
      });
    }
    for (const key of makeModelsSeen) {
      const [make, name] = key.split("::");
      await ctx.runMutation(internal.turn14.syncHelpers.ensureVehicleModel, {
        make,
        name,
      });
    }

    // Replace fitments per product
    let matched = 0;
    let missing = 0;
    for (const [turn14ItemId, fitments] of grouped) {
      const product: { _id: Id<"products"> } | null = await ctx.runQuery(
        internal.turn14.syncQueries.getProductByTurn14Id,
        { turn14Id: turn14ItemId }
      );
      if (!product) {
        missing++;
        continue;
      }
      matched++;
      await ctx.runMutation(
        internal.turn14.syncHelpers.replaceProductFitments,
        { productId: product._id, fitments }
      );
    }

    if (missing > 0) {
      console.log(
        `[fitments] "${brandName}" page ${page}: ${matched} matched, ${missing} skipped (no local product)`
      );
    }

    await ctx.runMutation(internal.turn14.syncHelpers.upsertSyncState, {
      syncType: "fitments",
      lastPage: page,
      totalPages,
      status: "running",
    });

    // More pages this brand?
    if (page < totalPages) {
      await ctx.scheduler.runAfter(200, internal.turn14.syncFitments.syncPage, {
        brandIndex,
        brandIds,
        brandNames,
        page: page + 1,
      });
      return;
    }

    await advanceToNextBrand(ctx, brandIndex, brandIds, brandNames, page);
  },
});

async function advanceToNextBrand(
  ctx: {
    scheduler: {
      runAfter: (
        ms: number,
        ref: typeof internal.turn14.syncFitments.syncPage,
        args: {
          brandIndex: number;
          brandIds: number[];
          brandNames: string[];
          page: number;
        }
      ) => Promise<unknown>;
    };
    runMutation: (
      ref: typeof internal.turn14.syncHelpers.upsertSyncState,
      args: { syncType: string; lastPage: number; status: string }
    ) => Promise<unknown>;
  },
  brandIndex: number,
  brandIds: number[],
  brandNames: string[],
  page: number
): Promise<void> {
  const nextIndex = brandIndex + 1;
  if (nextIndex < brandIds.length) {
    console.log(
      `[fitments] "${brandNames[brandIndex]}" done. Next: "${brandNames[nextIndex]}"`
    );
    await ctx.scheduler.runAfter(200, internal.turn14.syncFitments.syncPage, {
      brandIndex: nextIndex,
      brandIds,
      brandNames,
      page: 1,
    });
    return;
  }
  console.log("[fitments] All brands done — sync complete");
  await ctx.runMutation(internal.turn14.syncHelpers.upsertSyncState, {
    syncType: "fitments",
    lastPage: page,
    status: "complete",
  });
}
