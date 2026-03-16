import { internalMutation, internalQuery, mutation } from "../_generated/server";
import { v } from "convex/values";

export const getToken = internalQuery({
  args: {},
  handler: async (ctx) => {
    const tokens = await ctx.db.query("turn14Tokens").collect();
    return tokens[0] ?? null;
  },
});

export const saveToken = internalMutation({
  args: {
    accessToken: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("turn14Tokens").collect();
    for (const token of existing) {
      await ctx.db.delete(token._id);
    }
    await ctx.db.insert("turn14Tokens", {
      accessToken: args.accessToken,
      expiresAt: args.expiresAt,
    });
  },
});

export const clearTokens = mutation({
  args: {},
  handler: async (ctx) => {
    const tokens = await ctx.db.query("turn14Tokens").collect();
    for (const token of tokens) {
      await ctx.db.delete(token._id);
    }
  },
});
