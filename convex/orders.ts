import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DL-${timestamp}-${random}`;
}

/**
 * Called by the Stripe webhook after successful payment.
 * Creates the order from cart items and clears the cart.
 */
export const createFromPayment = mutation({
  args: {
    sessionId: v.string(),
    stripeSessionId: v.string(),
    stripePaymentIntentId: v.string(),
    contactName: v.string(),
    contactEmail: v.string(),
    contactPhone: v.optional(v.string()),
    shippingAddress: v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zip: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    // Idempotency: check if order already exists for this Stripe session
    const existing = await ctx.db
      .query("orders")
      .withIndex("by_stripeSessionId", (q) =>
        q.eq("stripeSessionId", args.stripeSessionId),
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
        if (!product) throw new Error(`Product not found: ${item.productId}`);
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
      }),
    );

    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const costSubtotal = items.reduce(
      (sum, item) => sum + item.costPrice * item.quantity,
      0,
    );
    const orderNumber = generateOrderNumber();

    // Strip costPrice from stored items (internal field)
    const orderItems = items.map(({ costPrice: _, ...rest }) => rest);

    const orderId = await ctx.db.insert("orders", {
      orderNumber,
      sessionId: args.sessionId,
      status: "paid",
      items: orderItems,
      subtotal,
      total: subtotal,
      contactName: args.contactName,
      contactEmail: args.contactEmail,
      contactPhone: args.contactPhone,
      shippingAddress: args.shippingAddress,
      stripeSessionId: args.stripeSessionId,
      stripePaymentIntentId: args.stripePaymentIntentId,
      paymentStatus: "paid",
      fulfillmentStatus: "unfulfilled",
      costSubtotal,
      turn14PO: orderNumber,
    });

    // Clear cart
    for (const item of cartItems) {
      await ctx.db.delete(item._id);
    }

    return { orderId, orderNumber };
  },
});

/**
 * Legacy create — kept for backwards compat but should not be used
 * in the Stripe flow. Can be removed once migration is complete.
 */
export const create = mutation({
  args: {
    sessionId: v.string(),
    contactName: v.string(),
    contactEmail: v.string(),
    contactPhone: v.optional(v.string()),
    shippingAddress: v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zip: v.string(),
    }),
  },
  handler: async (ctx, args) => {
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
        if (!product) throw new Error(`Product not found: ${item.productId}`);
        const price = product.mapPrice || product.retailPrice || 0;
        return {
          productId: item.productId,
          title: product.title,
          partNumber: product.partNumber,
          price,
          quantity: item.quantity,
          image: product.thumbnail || product.images[0],
        };
      }),
    );

    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const orderNumber = generateOrderNumber();

    const orderId = await ctx.db.insert("orders", {
      orderNumber,
      sessionId: args.sessionId,
      status: "pending",
      items,
      subtotal,
      total: subtotal,
      contactName: args.contactName,
      contactEmail: args.contactEmail,
      contactPhone: args.contactPhone,
      shippingAddress: args.shippingAddress,
    });

    for (const item of cartItems) {
      await ctx.db.delete(item._id);
    }

    return { orderId, orderNumber };
  },
});

export const getByOrderNumber = query({
  args: { orderNumber: v.string() },
  handler: async (ctx, { orderNumber }) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_orderNumber", (q) => q.eq("orderNumber", orderNumber))
      .first();
  },
});

export const getByStripeSessionId = query({
  args: { stripeSessionId: v.string() },
  handler: async (ctx, { stripeSessionId }) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_stripeSessionId", (q) =>
        q.eq("stripeSessionId", stripeSessionId),
      )
      .first();
  },
});
