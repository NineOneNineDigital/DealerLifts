import { v } from "convex/values";
import { query } from "./_generated/server";

export const getMakes = query({
  args: {},
  handler: async (ctx) => {
    const makes = await ctx.db.query("vehicleMakes").collect();
    return makes.map((m) => m.name).sort();
  },
});

export const getModels = query({
  args: { make: v.string() },
  handler: async (ctx, { make }) => {
    const models = await ctx.db
      .query("vehicleModels")
      .withIndex("by_make", (q) => q.eq("make", make))
      .collect();
    return models.map((m) => m.name).sort();
  },
});

export const getYears = query({
  args: { make: v.string(), model: v.string() },
  handler: async (ctx, { make, model }) => {
    const fitments = await ctx.db
      .query("fitments")
      .withIndex("by_make_model", (q) => q.eq("make", make).eq("model", model))
      .collect();

    const years = [...new Set(fitments.map((f) => f.year))].sort(
      (a, b) => b - a
    );
    return years;
  },
});

export const getProductsByFitment = query({
  args: {
    year: v.number(),
    make: v.string(),
    model: v.string(),
  },
  handler: async (ctx, { year, make, model }) => {
    const fitments = await ctx.db
      .query("fitments")
      .withIndex("by_year_make_model", (q) =>
        q.eq("year", year).eq("make", make).eq("model", model)
      )
      .collect();

    const productIds = [...new Set(fitments.map((f) => f.productId))];
    const products = await Promise.all(productIds.map((id) => ctx.db.get(id)));
    return products.filter((p) => p?.isActive);
  },
});

/**
 * Given a list of productIds and a vehicle, return the subset that fits.
 * Used to badge product cards across the store without one query per card.
 */
export const filterMatchingProductIds = query({
  args: {
    productIds: v.array(v.id("products")),
    year: v.number(),
    make: v.string(),
    model: v.string(),
  },
  handler: async (ctx, { productIds, year, make, model }) => {
    if (productIds.length === 0) {
      return [];
    }
    const idSet = new Set(productIds.map((id) => id.toString()));
    const matches = await ctx.db
      .query("fitments")
      .withIndex("by_year_make_model", (q) =>
        q.eq("year", year).eq("make", make).eq("model", model)
      )
      .collect();
    const matched = new Set<string>();
    for (const f of matches) {
      const key = f.productId.toString();
      if (idSet.has(key)) {
        matched.add(key);
      }
    }
    return productIds.filter((id) => matched.has(id.toString()));
  },
});

/** Return all fitments for a product, grouped { make: { model: [years] } }. */
export const getForProduct = query({
  args: { productId: v.id("products") },
  handler: async (ctx, { productId }) => {
    const rows = await ctx.db
      .query("fitments")
      .withIndex("by_productId", (q) => q.eq("productId", productId))
      .collect();

    const grouped: Record<string, Record<string, number[]>> = {};
    for (const r of rows) {
      grouped[r.make] ??= {};
      grouped[r.make][r.model] ??= [];
      grouped[r.make][r.model].push(r.year);
    }
    // Sort years desc within each model
    for (const make of Object.keys(grouped)) {
      for (const model of Object.keys(grouped[make])) {
        grouped[make][model].sort((a, b) => b - a);
      }
    }
    return grouped;
  },
});
