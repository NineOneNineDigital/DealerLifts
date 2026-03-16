import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getItems = query({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    if (!sessionId) return [];
    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
      .collect();

    const enriched = await Promise.all(
      items.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        return { ...item, product };
      }),
    );

    return enriched.filter((item) => item.product !== null);
  },
});

export const getItemCount = query({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    if (!sessionId) return 0;
    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
      .collect();
    return items.reduce((sum, item) => sum + item.quantity, 0);
  },
});

export const addItem = mutation({
  args: {
    sessionId: v.string(),
    productId: v.id("products"),
    quantity: v.number(),
  },
  handler: async (ctx, { sessionId, productId, quantity }) => {
    const existing = await ctx.db
      .query("cartItems")
      .withIndex("by_sessionId_productId", (q) =>
        q.eq("sessionId", sessionId).eq("productId", productId),
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { quantity: existing.quantity + quantity });
    } else {
      await ctx.db.insert("cartItems", { sessionId, productId, quantity });
    }
  },
});

export const updateQuantity = mutation({
  args: {
    id: v.id("cartItems"),
    quantity: v.number(),
  },
  handler: async (ctx, { id, quantity }) => {
    if (quantity <= 0) {
      await ctx.db.delete(id);
    } else {
      await ctx.db.patch(id, { quantity });
    }
  },
});

export const removeItem = mutation({
  args: { id: v.id("cartItems") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const clearCart = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
      .collect();
    for (const item of items) {
      await ctx.db.delete(item._id);
    }
  },
});
