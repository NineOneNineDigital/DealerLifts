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

export const startSync = internalAction({
  args: {},
  handler: async (ctx) => {
    await ctx.runMutation(internal.turn14.syncHelpers.upsertSyncState, {
      syncType: "products",
      lastPage: 0,
      status: "running",
    });
    await ctx.scheduler.runAfter(0, internal.turn14.syncProducts.syncPage, { page: 1 });
  },
});

export const syncPage = internalAction({
  args: { page: v.number() },
  handler: async (ctx, { page }) => {
    console.log(`[sync] Starting page ${page}`);

    let token: string;
    try {
      token = await ctx.runAction(internal.turn14.auth.ensureToken);
      console.log("[sync] Got auth token:", token.slice(0, 10) + "..." + token.slice(-10));
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

    const url = `https://apitest.turn14.com/v1/items?page=${page}`;
    console.log("[sync] Fetching:", url);
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[sync] API error: HTTP ${res.status}`, body);
      await ctx.runMutation(internal.turn14.syncHelpers.upsertSyncState, {
        syncType: "products",
        lastPage: page,
        status: "error",
        error: `HTTP ${res.status}: ${body.slice(0, 200)}`,
      });
      return;
    }

    const json = await res.json();
    console.log("[sync] Response keys:", Object.keys(json));
    const items = json.data || [];
    const meta = json.meta || {};
    const totalPages = meta.total_pages || 1;
    console.log(`[sync] Page ${page}: ${items.length} items, ${totalPages} total pages`);

    if (items.length > 0) {
      console.log("[sync] Sample item keys:", Object.keys(items[0]));
      console.log("[sync] Sample item:", JSON.stringify(items[0]).slice(0, 500));
    }

    for (const item of items) {
      const attrs = item.attributes || {};
      const turn14Id = Number(item.id);

      let brandId = undefined;
      if (attrs.brand_id) {
        brandId = await ctx.runMutation(internal.turn14.syncHelpers.upsertBrand, {
          turn14Id: Number(attrs.brand_id),
          name: attrs.brand || `Brand ${attrs.brand_id}`,
        });
      }

      let categoryId = undefined;
      if (attrs.category_id) {
        categoryId = await ctx.runMutation(internal.turn14.syncHelpers.upsertCategory, {
          turn14Id: Number(attrs.category_id),
          name: attrs.category || `Category ${attrs.category_id}`,
        });
      }

      const images: string[] = [];
      let thumbnail: string | undefined;
      if (attrs.thumbnail) {
        thumbnail = attrs.thumbnail;
        images.push(attrs.thumbnail);
      }
      if (attrs.photos && Array.isArray(attrs.photos)) {
        for (const photo of attrs.photos) {
          if (typeof photo === "string") images.push(photo);
          else if (photo?.url) images.push(photo.url);
        }
      }

      const mapPrice = attrs.map_price ? Math.round(Number(attrs.map_price) * 100) : undefined;
      const retailPrice = attrs.retail_price ? Math.round(Number(attrs.retail_price) * 100) : undefined;
      const costPrice = attrs.jobber_price ? Math.round(Number(attrs.jobber_price) * 100) : undefined;

      const title = attrs.product_name || attrs.part_number || `Item ${turn14Id}`;
      const slug = slugify(`${title}-${attrs.part_number || turn14Id}`);

      await ctx.runMutation(internal.turn14.syncHelpers.upsertProduct, {
        turn14Id,
        partNumber: attrs.part_number || String(turn14Id),
        title,
        slug,
        description: attrs.description || undefined,
        brandId,
        categoryId,
        images,
        thumbnail,
        mapPrice,
        retailPrice,
        costPrice,
        weight: attrs.weight ? Number(attrs.weight) : undefined,
        isActive: true,
      });
    }

    await ctx.runMutation(internal.turn14.syncHelpers.upsertSyncState, {
      syncType: "products",
      lastPage: page,
      totalPages,
      status: page >= totalPages ? "complete" : "running",
    });

    if (page < totalPages) {
      await ctx.scheduler.runAfter(200, internal.turn14.syncProducts.syncPage, { page: page + 1 });
    }
  },
});
