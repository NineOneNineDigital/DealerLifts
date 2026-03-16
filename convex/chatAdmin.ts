import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

async function getAdmin(ctx: { auth: { getUserIdentity: () => Promise<unknown> } }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return identity as { name?: string; email?: string; subject: string };
}

async function requireAdmin(ctx: { auth: { getUserIdentity: () => Promise<unknown> } }) {
  const identity = await getAdmin(ctx);
  if (!identity) {
    throw new Error("Not authenticated. Admin access required.");
  }
  return identity;
}

export const listConversations = query({
  args: {
    status: v.union(
      v.literal("pending"),
      v.literal("active"),
      v.literal("closed"),
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chatConversations")
      .withIndex("by_status_lastMessageAt", (q) =>
        q.eq("status", args.status),
      )
      .order("desc")
      .collect();
  },
});

export const getAllConversations = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("chatConversations").order("desc").collect();

    return {
      pending: all.filter((c) => c.status === "pending"),
      active: all.filter((c) => c.status === "active"),
      closed: all.filter((c) => c.status === "closed"),
    };
  },
});

export const getConversationWithMessages = query({
  args: { conversationId: v.id("chatConversations") },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return null;

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_conversationId_sentAt", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .collect();

    return { conversation, messages };
  },
});

export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const pending = await ctx.db
      .query("chatConversations")
      .withIndex("by_status_lastMessageAt", (q) => q.eq("status", "pending"))
      .collect();

    return pending.length;
  },
});

export const sendAdminMessage = mutation({
  args: {
    conversationId: v.id("chatConversations"),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await getAdmin(ctx);
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const now = Date.now();
    const senderName = identity?.name || identity?.email || "Admin";
    const preview =
      args.body.length > 80 ? `${args.body.slice(0, 80)}...` : args.body;

    await ctx.db.insert("chatMessages", {
      conversationId: args.conversationId,
      sender: "admin",
      senderName,
      body: args.body,
      sentAt: now,
    });

    await ctx.db.patch(args.conversationId, {
      lastMessageAt: now,
      lastMessagePreview: preview,
      status: "active",
      assignedAdmin: identity?.subject ?? "unknown",
    });
  },
});

export const assignConversation = mutation({
  args: {
    conversationId: v.id("chatConversations"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("active"),
        v.literal("closed"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await getAdmin(ctx);
    const patch: Record<string, unknown> = {
      assignedAdmin: identity?.subject ?? "unknown",
    };
    if (args.status) {
      patch.status = args.status;
    }
    await ctx.db.patch(args.conversationId, patch);
  },
});

export const closeConversation = mutation({
  args: { conversationId: v.id("chatConversations") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, { status: "closed" });
  },
});

export const updateChatSettings = mutation({
  args: {
    key: v.string(),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("chatSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { value: args.value });
    } else {
      await ctx.db.insert("chatSettings", {
        key: args.key,
        value: args.value,
      });
    }
  },
});

export const getChatSettings = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const setting = await ctx.db
      .query("chatSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    return setting ? setting.value : null;
  },
});
