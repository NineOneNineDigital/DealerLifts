import { v } from "convex/values";
import { query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const records = await ctx.db.query("syncState").collect();
    return records.sort((a, b) => a.syncType.localeCompare(b.syncType));
  },
});

export const getByType = query({
  args: { syncType: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("syncState")
      .withIndex("by_syncType", (q) => q.eq("syncType", args.syncType))
      .unique();
  },
});
