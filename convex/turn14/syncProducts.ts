"use node";

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const API_BASE = "https://apitest.turn14.com";

async function fetchWithAuth(
  url: string,
  token: string,
): Promise<Response> {
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

/**
 * Starts the product sync. Syncs items + data per brand,
 * then pricing per brand as a separate pass.
 */
export const startSync = internalAction({
  args: {},
  handler: async (ctx) => {
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
      brandNames.join(", "),
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
      { brandIndex: 0, brandIds, brandNames, page: 1 },
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
    const itemsUrl = `${API_BASE}/v1/items/brand/${brandId}?page=${page}`;
    console.log(
      `[sync:items] Brand ${brandIndex + 1}/${brandIds.length} "${brandName}" — page ${page}`,
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
    const dataUrl = `${API_BASE}/v1/items/data/brand/${brandId}?page=${page}`;
    const dataMap = new Map<
      string,
      { images: string[]; thumbnail: string | undefined; description: string | undefined }
    >();

    const dataRes = await fetchWithAuth(dataUrl, token);
    if (dataRes.ok) {
      const dataJson = await dataRes.json();
      for (const d of (dataJson.data || [])) {
        const id = String(d.id);
        const images: string[] = [];
        let thumbnail: string | undefined;

        if (d.files && Array.isArray(d.files)) {
          for (const file of d.files) {
            if (file.type !== "Image") continue;
            const links = file.links || [];
            const sorted = [...links].sort(
              (a: { width?: number }, b: { width?: number }) =>
                (b.width || 0) - (a.width || 0),
            );
            if (sorted.length > 0) images.push(sorted[0].url);
            if (
              file.media_content === "Photo - Primary" ||
              file.media_content === "Photo – Primary"
            ) {
              const smallest = [...links].sort(
                (a: { width?: number }, b: { width?: number }) =>
                  (a.width || 0) - (b.width || 0),
              );
              if (smallest.length > 0) thumbnail = smallest[0].url;
            }
          }
        }

        let description: string | undefined;
        if (d.descriptions && Array.isArray(d.descriptions)) {
          const market = d.descriptions.find(
            (desc: { type: string }) => desc.type === "Market Description",
          );
          const product = d.descriptions.find(
            (desc: { type: string }) =>
              desc.type === "Product Description - Long" ||
              desc.type === "Product Description – Long",
          );
          description = market?.description || product?.description;
        }

        dataMap.set(id, { images, thumbnail, description });
      }
    }

    console.log(
      `[sync:items] "${brandName}" page ${page}/${totalPages}: ${items.length} items, ${dataMap.size} with media`,
    );

    // 3. Upsert items (without pricing — that comes in phase 2)
    for (const item of items) {
      const attrs = item.attributes || {};
      const turn14Id = String(item.id);
      const itemData = dataMap.get(turn14Id);

      if (attrs.active === false) continue;

      let convexBrandId = undefined;
      if (attrs.brand_id) {
        convexBrandId = await ctx.runMutation(
          internal.turn14.syncHelpers.upsertBrand,
          {
            turn14Id: Number(attrs.brand_id),
            name: attrs.brand || brandName,
          },
        );
      }

      let categoryId = undefined;
      if (attrs.category) {
        categoryId = await ctx.runMutation(
          internal.turn14.syncHelpers.upsertCategory,
          {
            turn14Id: Number(attrs.brand_id || 0),
            name: attrs.category,
          },
        );
      }

      const images = itemData?.images || [];
      const thumbnail =
        itemData?.thumbnail || attrs.thumbnail || images[0] || undefined;
      if (images.length === 0 && attrs.thumbnail) {
        images.push(attrs.thumbnail);
      }

      const description =
        itemData?.description || attrs.part_description || undefined;

      let weight: number | undefined;
      if (attrs.dimensions?.length > 0) {
        weight = attrs.dimensions[0].weight || undefined;
      }

      const title =
        attrs.product_name || attrs.part_number || `Item ${turn14Id}`;
      const partNumber = attrs.part_number || String(turn14Id);
      const slug = slugify(`${title}-${partNumber}`);

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
      await ctx.scheduler.runAfter(200, internal.turn14.syncProducts.syncItemsPage, {
        brandIndex, brandIds, brandNames, page: page + 1,
      });
      return;
    }

    // Next brand?
    const nextIndex = brandIndex + 1;
    if (nextIndex < brandIds.length) {
      console.log(`[sync:items] "${brandName}" done. Next: "${brandNames[nextIndex]}"`);
      await ctx.scheduler.runAfter(200, internal.turn14.syncProducts.syncItemsPage, {
        brandIndex: nextIndex, brandIds, brandNames, page: 1,
      });
      return;
    }

    // All brands items done — start Phase 2: pricing
    console.log("[sync] Phase 1 complete (items + media). Starting Phase 2 (pricing)...");
    await ctx.scheduler.runAfter(200, internal.turn14.syncProducts.syncPricingPage, {
      brandIndex: 0, brandIds, brandNames, page: 1,
    });
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

    const pricingUrl = `${API_BASE}/v1/pricing/brand/${brandId}?page=${page}`;
    console.log(
      `[sync:pricing] Brand ${brandIndex + 1}/${brandIds.length} "${brandName}" — page ${page}`,
    );

    const res = await fetchWithAuth(pricingUrl, token);
    if (!res.ok) {
      const body = await res.text();
      console.error(`[sync:pricing] HTTP ${res.status}`, body.slice(0, 200));
      // Don't fail the whole sync for pricing — just skip
      console.warn(`[sync:pricing] Skipping pricing for "${brandName}"`);
    } else {
      const json = await res.json();
      const pricingItems = json.data || [];
      const totalPages = json.meta?.total_pages || 1;

      console.log(
        `[sync:pricing] "${brandName}" page ${page}/${totalPages}: ${pricingItems.length} items`,
      );

      // Log pricelist names from first item for debugging
      if (pricingItems.length > 0) {
        const firstAttrs = pricingItems[0].attributes || {};
        const plNames = (firstAttrs.pricelists || []).map((pl: { name: string }) => pl.name);
        console.log(`[sync:pricing] Pricelist names for "${brandName}":`, plNames.join(", "));
      }

      for (const p of pricingItems) {
        const turn14Id = Number(p.id);
        const attrs = p.attributes || {};

        if (attrs.can_purchase === false) continue;

        let mapPrice: number | undefined;
        let retailPrice: number | undefined;
        const pricelists = attrs.pricelists || [];
        for (const pl of pricelists) {
          if (!pl.price) continue;
          const price = Math.round(Number(pl.price) * 100);
          if (pl.name === "map") mapPrice = price;
          if (pl.name === "retail" || pl.name === "msrp" || pl.name === "Retail") retailPrice = price;
          // If no map or retail yet, use jobber as retail fallback
          if (pl.name === "jobber" && !retailPrice) retailPrice = price;
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
        await ctx.scheduler.runAfter(200, internal.turn14.syncProducts.syncPricingPage, {
          brandIndex, brandIds, brandNames, page: page + 1,
        });
        return;
      }
    }

    // Next brand pricing?
    const nextIndex = brandIndex + 1;
    if (nextIndex < brandIds.length) {
      console.log(`[sync:pricing] "${brandName}" done. Next: "${brandNames[nextIndex]}"`);
      await ctx.scheduler.runAfter(200, internal.turn14.syncProducts.syncPricingPage, {
        brandIndex: nextIndex, brandIds, brandNames, page: 1,
      });
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
