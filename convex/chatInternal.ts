import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const clearExpiredTyping = internalMutation({
  args: { indicatorId: v.id("chatTypingIndicators") },
  handler: async (ctx, args) => {
    const indicator = await ctx.db.get(args.indicatorId);
    if (!indicator) return;

    if (indicator.expiresAt <= Date.now()) {
      await ctx.db.delete(args.indicatorId);
    }
  },
});
