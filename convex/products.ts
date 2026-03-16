import { query } from "./_generated/server";
import { v } from "convex/values";

export const listByCategory = query({
  args: {
    categoryId: v.id("categories"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { categoryId, limit }) => {
    const q = ctx.db
      .query("products")
      .withIndex("by_categoryId", (q) => q.eq("categoryId", categoryId))
      .filter((q) => q.eq(q.field("isActive"), true));

    const products = limit ? await q.take(limit) : await q.collect();
    return products;
  },
});

export const listByBrand = query({
  args: {
    brandId: v.id("brands"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { brandId, limit }) => {
    const q = ctx.db
      .query("products")
      .withIndex("by_brandId", (q) => q.eq("brandId", brandId))
      .filter((q) => q.eq(q.field("isActive"), true));

    const products = limit ? await q.take(limit) : await q.collect();
    return products;
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
  },
});

export const search = query({
  args: { query: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { query: searchQuery, limit }) => {
    const results = await ctx.db
      .query("products")
      .withSearchIndex("search_title", (q) => q.search("title", searchQuery))
      .take(limit ?? 20);

    return results.filter((p) => p.isActive);
  },
});

export const listFeatured = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    return await ctx.db
      .query("products")
      .withIndex("by_isFeatured_isActive", (q) =>
        q.eq("isFeatured", true).eq("isActive", true),
      )
      .take(limit ?? 8);
  },
});

export const getById = query({
  args: { id: v.id("products") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const listAll = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    return await ctx.db
      .query("products")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .take(limit ?? 50);
  },
});
