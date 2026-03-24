import { mutation, query } from "./_generated/server";
import { internalQuery } from "./_generated/server";
import { v } from "convex/values";

/** List all sync brands (admin UI) */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("syncBrands").collect();
  },
});

/** List only enabled brand IDs (used by sync) */
export const listEnabled = internalQuery({
  args: {},
  handler: async (ctx) => {
    const brands = await ctx.db
      .query("syncBrands")
      .withIndex("by_isEnabled", (q) => q.eq("isEnabled", true))
      .collect();
    return brands.map((b) => ({
      turn14BrandId: b.turn14BrandId,
      brandName: b.brandName,
    }));
  },
});

/** Add a brand to the sync list */
export const add = mutation({
  args: {
    turn14BrandId: v.number(),
    brandName: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("syncBrands")
      .withIndex("by_turn14BrandId", (q) =>
        q.eq("turn14BrandId", args.turn14BrandId),
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        brandName: args.brandName,
        isEnabled: true,
      });
      return existing._id;
    }

    return await ctx.db.insert("syncBrands", {
      turn14BrandId: args.turn14BrandId,
      brandName: args.brandName,
      isEnabled: true,
    });
  },
});

/** Toggle a brand on/off */
export const toggle = mutation({
  args: {
    id: v.id("syncBrands"),
    isEnabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isEnabled: args.isEnabled });
  },
});

/** Remove a brand from the sync list */
export const remove = mutation({
  args: { id: v.id("syncBrands") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
