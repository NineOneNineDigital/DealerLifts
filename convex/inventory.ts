import { v } from "convex/values";
import { query } from "./_generated/server";

export const getByProductId = query({
  args: { productId: v.id("products") },
  handler: async (ctx, { productId }) => {
    return await ctx.db
      .query("inventory")
      .withIndex("by_productId", (q) => q.eq("productId", productId))
      .first();
  },
});

/**
 * Batch fetch inventory rows for a list of product IDs.
 * Returns a record keyed by productId string for O(1) lookups.
 * Missing rows (no inventory record) are omitted — callers treat absence as out of stock.
 */
export const getByProductIds = query({
  args: { productIds: v.array(v.id("products")) },
  handler: async (ctx, { productIds }) => {
    const rows = await Promise.all(
      productIds.map((productId) =>
        ctx.db
          .query("inventory")
          .withIndex("by_productId", (q) => q.eq("productId", productId))
          .first()
      )
    );

    const result: Record<string, { totalStock: number; isInStock: boolean }> =
      {};
    for (const row of rows) {
      if (row !== null) {
        result[row.productId] = {
          totalStock: row.totalStock,
          isInStock: row.isInStock,
        };
      }
    }
    return result;
  },
});
