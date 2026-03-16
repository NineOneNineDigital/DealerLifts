import { internalQuery } from "../_generated/server";
import { v } from "convex/values";

export const getProductByTurn14Id = internalQuery({
  args: { turn14Id: v.number() },
  handler: async (ctx, { turn14Id }) => {
    return await ctx.db
      .query("products")
      .withIndex("by_turn14Id", (q) => q.eq("turn14Id", turn14Id))
      .first();
  },
});
