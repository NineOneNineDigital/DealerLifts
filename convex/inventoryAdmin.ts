import { v } from "convex/values";
import { query } from "./_generated/server";

export const list = query({
  args: {
    filter: v.optional(
      v.union(
        v.literal("all"),
        v.literal("in_stock"),
        v.literal("out_of_stock"),
        v.literal("low_stock"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const filter = args.filter ?? "all";

    const allInventory = await ctx.db.query("inventory").collect();

    const withProducts = await Promise.all(
      allInventory.map(async (inv) => {
        const product = await ctx.db.get(inv.productId);
        if (!product) return null;
        return {
          _id: inv._id,
          _creationTime: inv._creationTime,
          productId: inv.productId,
          totalStock: inv.totalStock,
          isInStock: inv.isInStock,
          title: product.title,
          partNumber: product.partNumber,
          thumbnail: product.thumbnail,
          isActive: product.isActive,
        };
      }),
    );

    const valid = withProducts.filter(
      (item): item is NonNullable<typeof item> => item !== null,
    );

    let filtered = valid;
    if (filter === "in_stock") {
      filtered = valid.filter((item) => item.isInStock && item.totalStock > 5);
    } else if (filter === "out_of_stock") {
      filtered = valid.filter((item) => !item.isInStock || item.totalStock === 0);
    } else if (filter === "low_stock") {
      filtered = valid.filter(
        (item) => item.totalStock > 0 && item.totalStock <= 5,
      );
    }

    return filtered.sort((a, b) => a.totalStock - b.totalStock);
  },
});

export const summary = query({
  args: {},
  handler: async (ctx) => {
    const allInventory = await ctx.db.query("inventory").collect();

    let inStock = 0;
    let outOfStock = 0;
    let lowStock = 0;

    for (const inv of allInventory) {
      if (inv.totalStock === 0 || !inv.isInStock) {
        outOfStock++;
      } else if (inv.totalStock <= 5) {
        lowStock++;
      } else {
        inStock++;
      }
    }

    return {
      totalProducts: allInventory.length,
      inStock,
      outOfStock,
      lowStock,
    };
  },
});
