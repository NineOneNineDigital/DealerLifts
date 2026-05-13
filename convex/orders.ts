import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Server-only: invoked from the Next.js checkout API after a successful
 * Authorize.net charge. Gated by a shared secret so a browser client
 * cannot forge "paid" orders by calling this mutation directly.
 */
export const createFromPayment = mutation({
  args: {
    internalToken: v.string(),
    sessionId: v.string(),
    orderNumber: v.string(),
    authnetTransactionId: v.string(),
    contactName: v.string(),
    contactEmail: v.string(),
    contactPhone: v.optional(v.string()),
    shippingAddress: v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zip: v.string(),
    }),
    expectedTotal: v.number(),
    flagged: v.optional(v.boolean()),
    flagReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const expectedToken = process.env.CHECKOUT_INTERNAL_TOKEN;
    if (!expectedToken || args.internalToken !== expectedToken) {
      throw new Error("Unauthorized");
    }

    const existing = await ctx.db
      .query("orders")
      .withIndex("by_authnetTransactionId", (q) =>
        q.eq("authnetTransactionId", args.authnetTransactionId)
      )
      .first();
    if (existing) {
      return { orderId: existing._id, orderNumber: existing.orderNumber };
    }

    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    if (cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    const items = await Promise.all(
      cartItems.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }
        const price = product.mapPrice || product.retailPrice || 0;
        const costPrice = product.costPrice || 0;
        return {
          productId: item.productId,
          title: product.title,
          partNumber: product.partNumber,
          price,
          costPrice,
          quantity: item.quantity,
          image: product.thumbnail || product.images[0],
        };
      })
    );

    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const costSubtotal = items.reduce(
      (sum, item) => sum + item.costPrice * item.quantity,
      0
    );

    if (subtotal !== args.expectedTotal) {
      throw new Error(
        `Total mismatch: expected ${args.expectedTotal}, computed ${subtotal}`
      );
    }

    const orderItems = items.map(({ costPrice: _, ...rest }) => rest);

    const orderId = await ctx.db.insert("orders", {
      orderNumber: args.orderNumber,
      sessionId: args.sessionId,
      status: "paid",
      items: orderItems,
      subtotal,
      total: subtotal,
      contactName: args.contactName,
      contactEmail: args.contactEmail,
      contactPhone: args.contactPhone,
      shippingAddress: args.shippingAddress,
      authnetTransactionId: args.authnetTransactionId,
      paymentStatus: "paid",
      fulfillmentStatus: "unfulfilled",
      costSubtotal,
      flagged: args.flagged,
      flagReason: args.flagReason,
    });

    for (const item of cartItems) {
      await ctx.db.delete(item._id);
    }

    return { orderId, orderNumber: args.orderNumber };
  },
});

export const listForUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) return [];

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_contactEmail", (q) => q.eq("contactEmail", identity.email!))
      .order("desc")
      .collect();

    return orders;
  },
});

export const getByOrderNumber = query({
  args: {
    orderNumber: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx, { orderNumber, sessionId }) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_orderNumber", (q) => q.eq("orderNumber", orderNumber))
      .first();
    if (!order || order.sessionId !== sessionId) {
      return null;
    }
    return order;
  },
});
