import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

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
      if (
        args.retailPrice === undefined &&
        existing.retailPrice !== undefined
      ) {
        delete patch.retailPrice;
      }
      if (args.costPrice === undefined && existing.costPrice !== undefined) {
        delete patch.costPrice;
      }
      // I-3: Don't overwrite non-empty images/thumbnail with empty values
      const keepExistingImages =
        args.images.length === 0 && existing.images.length > 0;
      if (keepExistingImages) {
        delete patch.images;
      }
      if (args.thumbnail === undefined && existing.thumbnail !== undefined) {
        delete patch.thumbnail;
      }
      // Only publish products that have at least one image.
      const finalImageCount = keepExistingImages
        ? existing.images.length
        : args.images.length;
      patch.isActive = args.isActive && finalImageCount > 0;
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }

    return await ctx.db.insert("products", {
      ...args,
      isActive: args.isActive && args.images.length > 0,
      isFeatured: false,
    });
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

    if (!existing) {
      return;
    }

    const patch: Record<string, number | undefined> = {};
    if (args.mapPrice !== undefined) {
      patch.mapPrice = args.mapPrice;
    }
    if (args.retailPrice !== undefined) {
      patch.retailPrice = args.retailPrice;
    }
    if (args.costPrice !== undefined) {
      patch.costPrice = args.costPrice;
    }

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

/**
 * Replace all fitments for a single product in one call.
 * Used by syncFitments so we don't accumulate stale rows when Turn14 drops a fitment.
 */
export const replaceProductFitments = internalMutation({
  args: {
    productId: v.id("products"),
    fitments: v.array(
      v.object({
        year: v.number(),
        make: v.string(),
        model: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("fitments")
      .withIndex("by_productId", (q) => q.eq("productId", args.productId))
      .collect();
    for (const row of existing) {
      await ctx.db.delete(row._id);
    }
    for (const f of args.fitments) {
      await ctx.db.insert("fitments", {
        productId: args.productId,
        year: f.year,
        make: f.make,
        model: f.model,
      });
    }
  },
});

/** Ensure a make exists in vehicleMakes (idempotent). */
export const ensureVehicleMake = internalMutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const existing = await ctx.db
      .query("vehicleMakes")
      .withIndex("by_name", (q) => q.eq("name", name))
      .first();
    if (existing) {
      return existing._id;
    }
    return await ctx.db.insert("vehicleMakes", { name });
  },
});

/** Ensure a make+model exists in vehicleModels (idempotent). */
export const ensureVehicleModel = internalMutation({
  args: { make: v.string(), name: v.string() },
  handler: async (ctx, { make, name }) => {
    const existing = await ctx.db
      .query("vehicleModels")
      .withIndex("by_make", (q) => q.eq("make", make))
      .filter((q) => q.eq(q.field("name"), name))
      .first();
    if (existing) {
      return existing._id;
    }
    return await ctx.db.insert("vehicleModels", { make, name });
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
      lastSyncedAt:
        args.status === "complete" ? Date.now() : existing?.lastSyncedAt,
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    }

    return await ctx.db.insert("syncState", data);
  },
});
