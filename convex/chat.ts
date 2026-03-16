import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";

export const isChatOpen = query({
  args: {},
  handler: async (ctx) => {
    const setting = await ctx.db
      .query("chatSettings")
      .withIndex("by_key", (q) => q.eq("key", "chat_hours"))
      .unique();

    if (!setting) {
      return { isOpen: true, schedule: null };
    }

    const config = JSON.parse(setting.value) as {
      timezone: string;
      days: Record<
        string,
        { enabled: boolean; open: string; close: string }
      >;
    };

    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: config.timezone,
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
    const hour = parts.find((p) => p.type === "hour")?.value ?? "00";
    const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
    const currentTime = `${hour}:${minute}`;

    const dayKey = weekday.toLowerCase();
    const dayConfig = config.days[dayKey];

    if (!dayConfig || !dayConfig.enabled) {
      return { isOpen: false, schedule: config };
    }

    const isOpen = currentTime >= dayConfig.open && currentTime < dayConfig.close;
    return { isOpen, schedule: config };
  },
});

export const startConversation = mutation({
  args: {
    sessionId: v.string(),
    customerName: v.string(),
    customerEmail: v.string(),
  },
  handler: async (ctx, args) => {
    // Try to resume by email first
    const existingByEmail = await ctx.db
      .query("chatConversations")
      .withIndex("by_customerEmail", (q) =>
        q.eq("customerEmail", args.customerEmail),
      )
      .order("desc")
      .first();

    if (existingByEmail && existingByEmail.status !== "closed") {
      return existingByEmail._id;
    }

    // Try to resume by sessionId
    const existingBySession = await ctx.db
      .query("chatConversations")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .first();

    if (existingBySession && existingBySession.status !== "closed") {
      return existingBySession._id;
    }

    // Create new conversation
    const id = await ctx.db.insert("chatConversations", {
      sessionId: args.sessionId,
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      status: "pending",
      lastMessageAt: Date.now(),
    });

    return id;
  },
});

export const getConversation = query({
  args: { conversationId: v.id("chatConversations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.conversationId);
  },
});

export const getMessages = query({
  args: { conversationId: v.id("chatConversations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chatMessages")
      .withIndex("by_conversationId_sentAt", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .collect();
  },
});

export const sendMessage = mutation({
  args: {
    conversationId: v.id("chatConversations"),
    body: v.string(),
    senderName: v.string(),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const now = Date.now();
    const preview =
      args.body.length > 80 ? `${args.body.slice(0, 80)}...` : args.body;

    await ctx.db.insert("chatMessages", {
      conversationId: args.conversationId,
      sender: "customer",
      senderName: args.senderName,
      body: args.body,
      sentAt: now,
    });

    await ctx.db.patch(args.conversationId, {
      lastMessageAt: now,
      lastMessagePreview: preview,
      status: conversation.status === "closed" ? "pending" : conversation.status,
    });
  },
});

export const setTyping = mutation({
  args: {
    conversationId: v.id("chatConversations"),
    sender: v.union(v.literal("customer"), v.literal("admin")),
    senderName: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("chatTypingIndicators")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .collect();

    const match = existing.find(
      (i) => i.sender === args.sender && i.senderName === args.senderName,
    );

    const expiresAt = Date.now() + 5000;

    if (match) {
      await ctx.db.patch(match._id, { expiresAt });
    } else {
      const id = await ctx.db.insert("chatTypingIndicators", {
        conversationId: args.conversationId,
        sender: args.sender,
        senderName: args.senderName,
        expiresAt,
      });
      // Schedule cleanup
      await ctx.scheduler.runAfter(
        5000,
        internal.chatInternal.clearExpiredTyping,
        { indicatorId: id },
      );
    }
  },
});

export const getTypingIndicators = query({
  args: { conversationId: v.id("chatConversations") },
  handler: async (ctx, args) => {
    const indicators = await ctx.db
      .query("chatTypingIndicators")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .collect();

    const now = Date.now();
    return indicators.filter((i) => i.expiresAt > now);
  },
});
