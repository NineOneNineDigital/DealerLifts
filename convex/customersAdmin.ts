import { v } from "convex/values";
import { query } from "./_generated/server";

export const list = query({
  args: {
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const allUsers = await ctx.db.query("users").collect();

    const filtered = args.search
      ? allUsers.filter((user) => {
          const term = args.search!.toLowerCase();
          return (
            user.email.toLowerCase().includes(term) ||
            (user.name?.toLowerCase().includes(term) ?? false)
          );
        })
      : allUsers;

    return await Promise.all(
      filtered.map(async (user) => {
        const orders = await ctx.db
          .query("orders")
          .filter((q) => q.eq(q.field("contactEmail"), user.email))
          .collect();

        const chats = await ctx.db
          .query("chatConversations")
          .withIndex("by_customerEmail", (q) =>
            q.eq("customerEmail", user.email),
          )
          .collect();

        return {
          ...user,
          orderCount: orders.length,
          chatCount: chats.length,
        };
      }),
    );
  },
});

export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) return null;

    const orders = await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("contactEmail"), user.email))
      .collect();

    const chats = await ctx.db
      .query("chatConversations")
      .withIndex("by_customerEmail", (q) =>
        q.eq("customerEmail", user.email),
      )
      .collect();

    return { ...user, orders, chats };
  },
});
