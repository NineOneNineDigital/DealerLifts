import { query } from "./_generated/server";
import { v } from "convex/values";

export const getByProductId = query({
  args: { productId: v.id("products") },
  handler: async (ctx, { productId }) => {
    return await ctx.db
      .query("inventory")
      .withIndex("by_productId", (q) => q.eq("productId", productId))
      .first();
  },
});
