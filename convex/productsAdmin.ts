import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

export const list = query({
  args: {
    search: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let products: Doc<"products">[];

    if (args.search && args.search.trim().length > 0) {
      products = await ctx.db
        .query("products")
        .withSearchIndex("search_title", (q) =>
          q.search("title", args.search as string),
        )
        .take(50);
    } else if (args.isFeatured !== undefined) {
      products = await ctx.db
        .query("products")
        .withIndex("by_isFeatured_isActive", (q) => {
          const base = q.eq("isFeatured", args.isFeatured as boolean);
          return args.isActive !== undefined
            ? base.eq("isActive", args.isActive as boolean)
            : base;
        })
        .take(50);
    } else if (args.isActive !== undefined) {
      products = await ctx.db
        .query("products")
        .withIndex("by_isActive", (q) =>
          q.eq("isActive", args.isActive as boolean),
        )
        .take(50);
    } else {
      products = await ctx.db.query("products").take(50);
    }

    return Promise.all(
      products.map(async (product) => {
        const brand = product.brandId
          ? await ctx.db.get(product.brandId)
          : null;
        return { ...product, brandName: brand?.name ?? null };
      }),
    );
  },
});

export const getById = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) return null;

    const brand = product.brandId ? await ctx.db.get(product.brandId) : null;
    const category = product.categoryId
      ? await ctx.db.get(product.categoryId)
      : null;

    return {
      ...product,
      brandName: brand?.name ?? null,
      categoryName: category?.name ?? null,
    };
  },
});

export const toggleActive = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) throw new Error("Product not found");
    await ctx.db.patch(args.id, { isActive: !product.isActive });
  },
});

export const toggleFeatured = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) throw new Error("Product not found");
    await ctx.db.patch(args.id, { isFeatured: !product.isFeatured });
  },
});

export const updatePricing = mutation({
  args: {
    id: v.id("products"),
    mapPrice: v.optional(v.number()),
    retailPrice: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) throw new Error("Product not found");

    const patch: Partial<Pick<Doc<"products">, "mapPrice" | "retailPrice">> = {};
    if (args.mapPrice !== undefined) patch.mapPrice = args.mapPrice;
    if (args.retailPrice !== undefined) patch.retailPrice = args.retailPrice;

    await ctx.db.patch(args.id, patch);
  },
});
