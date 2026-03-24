import { v } from "convex/values";
import { action, internalQuery, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

/** Trigger a manual product sync */
export const triggerProductSync = action({
  args: {},
  handler: async (ctx) => {
    await ctx.runAction(internal.turn14.syncProducts.startSync);
  },
});

/** Trigger a manual inventory sync */
export const triggerInventorySync = action({
  args: {},
  handler: async (ctx) => {
    await ctx.runAction(internal.turn14.syncInventory.syncDelta);
  },
});

/** Trigger just the pricing sync phase */
export const triggerPricingSync = action({
  args: {},
  handler: async (ctx) => {
    const enabledBrands: Array<{ turn14BrandId: number; brandName: string }> =
      await ctx.runQuery(internal.syncBrands.listEnabled);

    if (enabledBrands.length === 0) return;

    const brandIds = enabledBrands.map((b: { turn14BrandId: number }) => b.turn14BrandId);
    const brandNames = enabledBrands.map((b: { brandName: string }) => b.brandName);

    await ctx.runMutation(internal.turn14.syncHelpers.upsertSyncState, {
      syncType: "products",
      lastPage: 0,
      status: "running",
    });

    await ctx.scheduler.runAfter(0, internal.turn14.syncProducts.syncPricingPage, {
      brandIndex: 0,
      brandIds,
      brandNames,
      page: 1,
    });
  },
});

/** Cancel a running sync by setting its status to "cancelled" */
export const cancelSync = mutation({
  args: { syncType: v.string() },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("syncState")
      .withIndex("by_syncType", (q) => q.eq("syncType", args.syncType))
      .first();
    if (record && record.status === "running") {
      await ctx.db.patch(record._id, { status: "cancelled" });
    }
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const records = await ctx.db.query("syncState").collect();
    return records.sort((a, b) => a.syncType.localeCompare(b.syncType));
  },
});

export const getByType = internalQuery({
  args: { syncType: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("syncState")
      .withIndex("by_syncType", (q) => q.eq("syncType", args.syncType))
      .first();
  },
});
