import { query } from "./_generated/server";
import { v } from "convex/values";

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

    const years = [...new Set(fitments.map((f) => f.year))].sort((a, b) => b - a);
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
        q.eq("year", year).eq("make", make).eq("model", model),
      )
      .collect();

    const productIds = [...new Set(fitments.map((f) => f.productId))];
    const products = await Promise.all(productIds.map((id) => ctx.db.get(id)));
    return products.filter((p) => p !== null && p.isActive);
  },
});
