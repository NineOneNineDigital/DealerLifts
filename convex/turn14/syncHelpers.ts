import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const upsertBrand = internalMutation({
  args: {
    turn14Id: v.number(),
    name: v.string(),
    logo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("brands")
      .withIndex("by_turn14Id", (q) => q.eq("turn14Id", args.turn14Id))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { name: args.name, logo: args.logo });
      return existing._id;
    }

    return await ctx.db.insert("brands", {
      turn14Id: args.turn14Id,
      name: args.name,
      slug: slugify(args.name),
      logo: args.logo,
    });
  },
});

export const upsertCategory = internalMutation({
  args: {
    turn14Id: v.number(),
    name: v.string(),
    parentId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_turn14Id", (q) => q.eq("turn14Id", args.turn14Id))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { name: args.name });
      return existing._id;
    }

    return await ctx.db.insert("categories", {
      turn14Id: args.turn14Id,
      name: args.name,
      slug: slugify(args.name),
      parentId: args.parentId,
    });
  },
});

export const upsertProduct = internalMutation({
  args: {
    turn14Id: v.number(),
    partNumber: v.string(),
    title: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    brandId: v.optional(v.id("brands")),
    categoryId: v.optional(v.id("categories")),
    images: v.array(v.string()),
    thumbnail: v.optional(v.string()),
    mapPrice: v.optional(v.number()),
    retailPrice: v.optional(v.number()),
    costPrice: v.optional(v.number()),
    weight: v.optional(v.number()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("products")
      .withIndex("by_turn14Id", (q) => q.eq("turn14Id", args.turn14Id))
      .first();

    if (existing) {
      // Don't overwrite prices with undefined
      const patch = { ...args } as Record<string, unknown>;
      if (args.mapPrice === undefined && existing.mapPrice !== undefined) {
        delete patch.mapPrice;
      }
      if (args.retailPrice === undefined && existing.retailPrice !== undefined) {
        delete patch.retailPrice;
      }
      if (args.costPrice === undefined && existing.costPrice !== undefined) {
        delete patch.costPrice;
      }
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }

    return await ctx.db.insert("products", { ...args, isFeatured: false });
  },
});

/** Patch only pricing fields on an existing product (won't create new products) */
export const patchProductPricing = internalMutation({
  args: {
    turn14Id: v.number(),
    mapPrice: v.optional(v.number()),
    retailPrice: v.optional(v.number()),
    costPrice: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("products")
      .withIndex("by_turn14Id", (q) => q.eq("turn14Id", args.turn14Id))
      .first();

    if (!existing) return;

    const patch: Record<string, number | undefined> = {};
    if (args.mapPrice !== undefined) patch.mapPrice = args.mapPrice;
    if (args.retailPrice !== undefined) patch.retailPrice = args.retailPrice;
    if (args.costPrice !== undefined) patch.costPrice = args.costPrice;

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(existing._id, patch);
    }
  },
});

export const upsertInventory = internalMutation({
  args: {
    productId: v.id("products"),
    totalStock: v.number(),
    isInStock: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("inventory")
      .withIndex("by_productId", (q) => q.eq("productId", args.productId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        totalStock: args.totalStock,
        isInStock: args.isInStock,
      });
      return existing._id;
    }

    return await ctx.db.insert("inventory", args);
  },
});

export const upsertSyncState = internalMutation({
  args: {
    syncType: v.string(),
    lastPage: v.number(),
    totalPages: v.optional(v.number()),
    status: v.string(),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("syncState")
      .withIndex("by_syncType", (q) => q.eq("syncType", args.syncType))
      .first();

    const data = {
      ...args,
      lastSyncedAt: args.status === "complete" ? Date.now() : existing?.lastSyncedAt,
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    }

    return await ctx.db.insert("syncState", data);
  },
});
