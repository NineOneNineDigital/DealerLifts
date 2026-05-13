import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getItems = query({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    if (!sessionId) {
      return [];
    }
    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
      .collect();

    const enriched = await Promise.all(
      items.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        return { ...item, product };
      })
    );

    return enriched.filter((item) => item.product !== null);
  },
});

export const getItemCount = query({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    if (!sessionId) {
      return 0;
    }
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
    const inv = await ctx.db
      .query("inventory")
      .withIndex("by_productId", (q) => q.eq("productId", productId))
      .first();

    if (!inv?.isInStock) {
      throw new Error("Out of stock");
    }

    const existing = await ctx.db
      .query("cartItems")
      .withIndex("by_sessionId_productId", (q) =>
        q.eq("sessionId", sessionId).eq("productId", productId)
      )
      .first();

    const currentQuantity = existing ? existing.quantity : 0;
    const requested = currentQuantity + quantity;
    if (requested > inv.totalStock) {
      throw new Error(`Only ${inv.totalStock} available`);
    }

    if (existing) {
      await ctx.db.patch(existing._id, { quantity: requested });
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
      return;
    }

    const item = await ctx.db.get(id);
    if (!item) {
      throw new Error("Cart item not found");
    }

    const inv = await ctx.db
      .query("inventory")
      .withIndex("by_productId", (q) => q.eq("productId", item.productId))
      .first();

    if (!inv?.isInStock) {
      throw new Error("Out of stock");
    }
    if (quantity > inv.totalStock) {
      throw new Error(`Only ${inv.totalStock} available`);
    }

    await ctx.db.patch(id, { quantity });
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
