"use node";

import { v } from "convex/values";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { internalAction } from "../_generated/server";
import { getApiBase } from "./config";
import { fetchWithRetry } from "./fetchWithRetry";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function fetchWithAuth(url: string, token: string): Promise<Response> {
  return fetchWithRetry(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

// Preferred media_content order — anything not in this list still gets included
// but sorts to the tail so it's only used as fallback.
const IMAGE_TYPE_PRIORITY: string[] = [
  "Photo - Primary",
  "Photo – Primary", // en-dash variant
  "Photo - Hi Res",
  "Photo – Hi Res",
  "Photo - Detail",
  "Photo – Detail",
  "Photo - Lifestyle",
  "Photo – Lifestyle",
];

function imageTypePriority(mediaContent: string): number {
  const idx = IMAGE_TYPE_PRIORITY.indexOf(mediaContent);
  return idx === -1 ? IMAGE_TYPE_PRIORITY.length : idx;
}

/** Pick the smallest variant >= targetWidth. Falls back to the widest available if all are smaller. */
function pickVariant(
  links: Array<{ url: string; width?: number }>,
  targetWidth: number
): string | undefined {
  if (links.length === 0) {
    return undefined;
  }
  // Prefer smallest variant >= targetWidth, else fall back to largest
  const atLeast = links
    .filter((l) => (l.width ?? 0) >= targetWidth)
    .sort((a, b) => (a.width ?? 0) - (b.width ?? 0));
  if (atLeast.length > 0) {
    return atLeast[0].url;
  }
  // All variants smaller than target — pick largest
  const sorted = [...links].sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
  return sorted[0].url;
}

/** Pick the link variant closest to targetWidth (nearest absolute distance). */
function pickClosest(
  links: Array<{ url: string; width?: number }>,
  targetWidth: number
): string | undefined {
  if (links.length === 0) {
    return undefined;
  }
  let best = links[0];
  let bestDist = Math.abs((links[0].width ?? 0) - targetWidth);
  for (const l of links) {
    const dist = Math.abs((l.width ?? 0) - targetWidth);
    if (dist < bestDist) {
      bestDist = dist;
      best = l;
    }
  }
  return best.url;
}

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

/**
 * Starts the product sync. Syncs items + data per brand,
 * then pricing per brand as a separate pass.
 */
export const startSync = internalAction({
  args: {},
  handler: async (ctx) => {
    // F8 — Reentrancy guard
    const existing = await ctx.runQuery(internal.syncAdmin.getByType, {
      syncType: "products",
    });
    if (existing?.status === "running") {
      const age = Date.now() - (existing.lastSyncedAt ?? 0);
      if (age < SIX_HOURS_MS) {
        console.warn(
          "[sync] Sync already in progress — aborting duplicate start"
        );
        throw new Error("Sync already in progress");
      }
      console.warn(
        "[sync] Sync status is 'running' but lastSyncedAt is >6h ago — treating as stuck, proceeding"
      );
    }

    const enabledBrands: Array<{ turn14BrandId: number; brandName: string }> =
      await ctx.runQuery(internal.syncBrands.listEnabled);

    if (enabledBrands.length === 0) {
      console.log("[sync] No brands enabled for sync — skipping");
      await ctx.runMutation(internal.turn14.syncHelpers.upsertSyncState, {
        syncType: "products",
        lastPage: 0,
        status: "complete",
        error: "No brands enabled",
      });
      return;
    }

    const brandIds = enabledBrands.map((b) => b.turn14BrandId);
    const brandNames = enabledBrands.map((b) => b.brandName);

    console.log(
      `[sync] Starting sync for ${enabledBrands.length} brands:`,
      brandNames.join(", ")
    );

    await ctx.runMutation(internal.turn14.syncHelpers.upsertSyncState, {
      syncType: "products",
      lastPage: 0,
      status: "running",
    });

    // Phase 1: sync items + media
    await ctx.scheduler.runAfter(
      0,
      internal.turn14.syncProducts.syncItemsPage,
      { brandIndex: 0, brandIds, brandNames, page: 1 }
    );
  },
});

/**
 * Phase 1: Sync items and media data per brand.
 * Fetches /v1/items/brand/{id} and /v1/items/data/brand/{id} per page.
 */
export const syncItemsPage = internalAction({
  args: {
    brandIndex: v.number(),
    brandIds: v.array(v.number()),
    brandNames: v.array(v.string()),
    page: v.number(),
  },
  handler: async (ctx, { brandIndex, brandIds, brandNames, page }) => {
    const syncState = await ctx.runQuery(internal.syncAdmin.getByType, {
      syncType: "products",
    });
    if (syncState?.status === "cancelled") {
      console.log("[sync] Cancelled — stopping");
      return;
    }

    const brandId = brandIds[brandIndex];
    const brandName = brandNames[brandIndex];

    let token: string;
    try {
      token = await ctx.runAction(internal.turn14.auth.ensureToken);
    } catch (e) {
      console.error("[sync] Auth failed:", e);
      await ctx.runMutation(internal.turn14.syncHelpers.upsertSyncState, {
        syncType: "products",
        lastPage: page,
        status: "error",
        error: `Auth failed: ${e}`,
      });
      return;
    }

    // 1. Fetch core items
    const itemsUrl = `${getApiBase()}/v1/items/brand/${brandId}?page=${page}`;
    console.log(
      `[sync:items] Brand ${brandIndex + 1}/${brandIds.length} "${brandName}" — page ${page}`
    );

    const itemsRes = await fetchWithAuth(itemsUrl, token);
    if (!itemsRes.ok) {
      const body = await itemsRes.text();
      console.error(`[sync:items] HTTP ${itemsRes.status}`, body.slice(0, 200));
      await ctx.runMutation(internal.turn14.syncHelpers.upsertSyncState, {
        syncType: "products",
        lastPage: page,
        status: "error",
        error: `"${brandName}" items HTTP ${itemsRes.status}`,
      });
      return;
    }

    const itemsJson = await itemsRes.json();
    const items = itemsJson.data || [];
    const totalPages = itemsJson.meta?.total_pages || 1;

    // 2. Fetch media/descriptions
    const dataUrl = `${getApiBase()}/v1/items/data/brand/${brandId}?page=${page}`;
    const dataMap = new Map<
      string,
      {
        images: string[];
        thumbnail: string | undefined;
        description: string | undefined;
      }
    >();

    const dataRes = await fetchWithAuth(dataUrl, token);
    if (dataRes.ok) {
      const dataJson = await dataRes.json();
      for (const d of dataJson.data || []) {
        const id = String(d.id);

        // Accumulate images with their media_content for sorting (I-2)
        const imageEntries: Array<{ url: string; mediaContent: string }> = [];
        let thumbnail: string | undefined;

        if (d.files && Array.isArray(d.files)) {
          for (const file of d.files) {
            if (file.type !== "Image") {
              continue;
            }
            const links: Array<{ url: string; width?: number }> =
              file.links || [];
            const mediaContent: string = file.media_content || "";

            // Accept any Image-typed file; priority sort keeps preferred types first.
            const url = pickVariant(links, 1200);
            if (url) {
              imageEntries.push({ url, mediaContent });
            }

            // Thumbnail: Primary only, closest to 400px (fallback to images[0] below)
            if (
              mediaContent === "Photo - Primary" ||
              mediaContent === "Photo – Primary"
            ) {
              thumbnail = pickClosest(links, 400);
            }
          }
        }

        // I-2: Sort images by media_content priority, preserving insertion order within each tier
        imageEntries.sort(
          (a, b) =>
            imageTypePriority(a.mediaContent) -
            imageTypePriority(b.mediaContent)
        );
        const images = imageEntries.map((e) => e.url);

        let description: string | undefined;
        if (d.descriptions && Array.isArray(d.descriptions)) {
          const market = d.descriptions.find(
            (desc: { type: string }) => desc.type === "Market Description"
          );
          const product = d.descriptions.find(
            (desc: { type: string }) =>
              desc.type === "Product Description - Long" ||
              desc.type === "Product Description – Long"
          );
          description = market?.description || product?.description;
        }

        dataMap.set(id, { images, thumbnail, description });
      }
    }

    console.log(
      `[sync:items] "${brandName}" page ${page}/${totalPages}: ${items.length} items, ${dataMap.size} with media`
    );

    // 3. Upsert items (without pricing — that comes in phase 2)
    for (const item of items) {
      const attrs = item.attributes || {};
      const turn14Id = String(item.id);
      const itemData = dataMap.get(turn14Id);

      if (attrs.active === false) {
        continue;
      }

      let convexBrandId: Id<"brands"> | undefined;
      if (attrs.brand_id) {
        convexBrandId = await ctx.runMutation(
          internal.turn14.syncHelpers.upsertBrand,
          {
            turn14Id: Number(attrs.brand_id),
            name: attrs.brand || brandName,
          }
        );
      }

      // F4: Disabled category upsert to prevent data corruption.
      // TODO: Categories sync needs separate Turn14 categories endpoint integration — disabled to prevent data corruption (see review).
      const categoryId = undefined;

      const images = itemData?.images || [];
      const thumbnail = itemData?.thumbnail || images[0] || undefined;

      const description =
        itemData?.description || attrs.part_description || undefined;

      let weight: number | undefined;
      if (attrs.dimensions?.length > 0) {
        weight = attrs.dimensions[0].weight || undefined;
      }

      const title =
        attrs.product_name || attrs.part_number || `Item ${turn14Id}`;
      const partNumber = attrs.part_number || String(turn14Id);
      // A: Slug is based on partNumber only (stable across title renames)
      const slug = slugify(partNumber);

      await ctx.runMutation(internal.turn14.syncHelpers.upsertProduct, {
        turn14Id: Number(turn14Id),
        partNumber,
        title,
        slug,
        description,
        brandId: convexBrandId,
        categoryId,
        images,
        thumbnail,
        mapPrice: undefined,
        retailPrice: undefined,
        costPrice: undefined,
        weight,
        isActive: true,
      });
    }

    await ctx.runMutation(internal.turn14.syncHelpers.upsertSyncState, {
      syncType: "products",
      lastPage: page,
      totalPages,
      status: "running",
    });

    // More pages for this brand?
    if (page < totalPages) {
      await ctx.scheduler.runAfter(
        200,
        internal.turn14.syncProducts.syncItemsPage,
        {
          brandIndex,
          brandIds,
          brandNames,
          page: page + 1,
        }
      );
      return;
    }

    // Next brand?
    const nextIndex = brandIndex + 1;
    if (nextIndex < brandIds.length) {
      console.log(
        `[sync:items] "${brandName}" done. Next: "${brandNames[nextIndex]}"`
      );
      await ctx.scheduler.runAfter(
        200,
        internal.turn14.syncProducts.syncItemsPage,
        {
          brandIndex: nextIndex,
          brandIds,
          brandNames,
          page: 1,
        }
      );
      return;
    }

    // All brands items done — start Phase 2: pricing
    console.log(
      "[sync] Phase 1 complete (items + media). Starting Phase 2 (pricing)..."
    );
    await ctx.scheduler.runAfter(
      200,
      internal.turn14.syncProducts.syncPricingPage,
      {
        brandIndex: 0,
        brandIds,
        brandNames,
        page: 1,
      }
    );
  },
});

/**
 * Phase 2: Sync pricing per brand.
 * Fetches /v1/pricing/brand/{id} and patches existing products.
 */
export const syncPricingPage = internalAction({
  args: {
    brandIndex: v.number(),
    brandIds: v.array(v.number()),
    brandNames: v.array(v.string()),
    page: v.number(),
  },
  handler: async (ctx, { brandIndex, brandIds, brandNames, page }) => {
    const syncState = await ctx.runQuery(internal.syncAdmin.getByType, {
      syncType: "products",
    });
    if (syncState?.status === "cancelled") {
      console.log("[sync] Cancelled — stopping");
      return;
    }

    const brandId = brandIds[brandIndex];
    const brandName = brandNames[brandIndex];

    let token: string;
    try {
      token = await ctx.runAction(internal.turn14.auth.ensureToken);
    } catch (e) {
      console.error("[sync:pricing] Auth failed:", e);
      await ctx.runMutation(internal.turn14.syncHelpers.upsertSyncState, {
        syncType: "products",
        lastPage: page,
        status: "error",
        error: `Pricing auth failed: ${e}`,
      });
      return;
    }

    const pricingUrl = `${getApiBase()}/v1/pricing/brand/${brandId}?page=${page}`;
    console.log(
      `[sync:pricing] Brand ${brandIndex + 1}/${brandIds.length} "${brandName}" — page ${page}`
    );

    const res = await fetchWithAuth(pricingUrl, token);
    if (res.ok) {
      const json = await res.json();
      const pricingItems = json.data || [];
      const totalPages = json.meta?.total_pages || 1;

      console.log(
        `[sync:pricing] "${brandName}" page ${page}/${totalPages}: ${pricingItems.length} items`
      );

      // Log pricelist names from first item for debugging
      if (pricingItems.length > 0) {
        const firstAttrs = pricingItems[0].attributes || {};
        const plNames = (firstAttrs.pricelists || []).map(
          (pl: { name: string }) => pl.name
        );
        console.log(
          `[sync:pricing] Pricelist names for "${brandName}":`,
          plNames.join(", ")
        );
      }

      for (const p of pricingItems) {
        const turn14Id = Number(p.id);
        const attrs = p.attributes || {};

        if (attrs.can_purchase === false) {
          continue;
        }

        let mapPrice: number | undefined;
        let retailPrice: number | undefined;
        const pricelists = attrs.pricelists || [];
        for (const pl of pricelists) {
          if (!pl.price) {
            continue;
          }
          const price = Math.round(Number(pl.price) * 100);
          // F9: Normalize pricelist names to lowercase for case-insensitive matching
          const name = pl.name.toLowerCase();
          if (name === "map") {
            mapPrice = price;
          }
          if (name === "msrp" || name === "retail") {
            retailPrice = price;
          }
          // jobber as retail fallback when msrp/retail are missing
          if (name === "jobber" && !retailPrice) {
            retailPrice = price;
          }
        }

        const costPrice = attrs.purchase_cost
          ? Math.round(Number(attrs.purchase_cost) * 100)
          : undefined;

        await ctx.runMutation(internal.turn14.syncHelpers.patchProductPricing, {
          turn14Id,
          mapPrice,
          retailPrice,
          costPrice,
        });
      }

      // More pricing pages?
      if (page < totalPages) {
        await ctx.scheduler.runAfter(
          200,
          internal.turn14.syncProducts.syncPricingPage,
          {
            brandIndex,
            brandIds,
            brandNames,
            page: page + 1,
          }
        );
        return;
      }
    } else {
      const body = await res.text();
      console.error(`[sync:pricing] HTTP ${res.status}`, body.slice(0, 200));
      // Don't fail the whole sync for pricing — just skip
      console.warn(`[sync:pricing] Skipping pricing for "${brandName}"`);
    }

    // Next brand pricing?
    const nextIndex = brandIndex + 1;
    if (nextIndex < brandIds.length) {
      console.log(
        `[sync:pricing] "${brandName}" done. Next: "${brandNames[nextIndex]}"`
      );
      await ctx.scheduler.runAfter(
        200,
        internal.turn14.syncProducts.syncPricingPage,
        {
          brandIndex: nextIndex,
          brandIds,
          brandNames,
          page: 1,
        }
      );
      return;
    }

    // All done
    console.log("[sync] Phase 2 complete (pricing). Sync finished!");
    await ctx.runMutation(internal.turn14.syncHelpers.upsertSyncState, {
      syncType: "products",
      lastPage: page,
      status: "complete",
    });
  },
});
