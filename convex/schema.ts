import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  turn14Tokens: defineTable({
    accessToken: v.string(),
    expiresAt: v.number(),
  }),

  brands: defineTable({
    turn14Id: v.number(),
    name: v.string(),
    slug: v.string(),
    logo: v.optional(v.string()),
  }).index("by_slug", ["slug"]).index("by_turn14Id", ["turn14Id"]),

  categories: defineTable({
    turn14Id: v.number(),
    name: v.string(),
    slug: v.string(),
    parentId: v.optional(v.id("categories")),
  }).index("by_slug", ["slug"]).index("by_turn14Id", ["turn14Id"]).index("by_parentId", ["parentId"]),

  products: defineTable({
    turn14Id: v.number(),
    partNumber: v.string(),
    title: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    brandId: v.optional(v.id("brands")),
    categoryId: v.optional(v.id("categories")),
    images: v.array(v.string()),
    thumbnail: v.optional(v.string()),
    mapPrice: v.optional(v.number()),
    retailPrice: v.optional(v.number()),
    costPrice: v.optional(v.number()),
    weight: v.optional(v.number()),
    isFeatured: v.optional(v.boolean()),
    isActive: v.boolean(),
  })
    .index("by_slug", ["slug"])
    .index("by_brandId", ["brandId"])
    .index("by_categoryId", ["categoryId"])
    .index("by_turn14Id", ["turn14Id"])
    .index("by_isActive", ["isActive"])
    .index("by_isFeatured_isActive", ["isFeatured", "isActive"])
    .searchIndex("search_title", { searchField: "title" }),

  inventory: defineTable({
    productId: v.id("products"),
    totalStock: v.number(),
    isInStock: v.boolean(),
  }).index("by_productId", ["productId"]),

  fitments: defineTable({
    productId: v.id("products"),
    year: v.number(),
    make: v.string(),
    model: v.string(),
  })
    .index("by_productId", ["productId"])
    .index("by_year_make_model", ["year", "make", "model"])
    .index("by_make", ["make"])
    .index("by_make_model", ["make", "model"]),

  vehicleMakes: defineTable({
    name: v.string(),
  }).index("by_name", ["name"]),

  vehicleModels: defineTable({
    make: v.string(),
    name: v.string(),
  }).index("by_make", ["make"]),

  cartItems: defineTable({
    sessionId: v.string(),
    productId: v.id("products"),
    quantity: v.number(),
  })
    .index("by_sessionId", ["sessionId"])
    .index("by_sessionId_productId", ["sessionId", "productId"]),

  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
  }).index("by_email", ["email"]),

  orders: defineTable({
    orderNumber: v.string(),
    sessionId: v.string(),
    status: v.string(),
    items: v.array(
      v.object({
        productId: v.id("products"),
        title: v.string(),
        partNumber: v.string(),
        price: v.number(),
        quantity: v.number(),
        image: v.optional(v.string()),
      }),
    ),
    subtotal: v.number(),
    total: v.number(),
    contactName: v.string(),
    contactEmail: v.string(),
    contactPhone: v.optional(v.string()),
    shippingAddress: v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zip: v.string(),
    }),
    // Stripe payment fields
    stripeSessionId: v.optional(v.string()),
    stripePaymentIntentId: v.optional(v.string()),
    paymentStatus: v.optional(v.string()),
    // Turn14 fulfillment fields
    turn14OrderId: v.optional(v.string()),
    turn14PO: v.optional(v.string()),
    fulfillmentStatus: v.optional(v.string()),
    trackingNumbers: v.optional(
      v.array(
        v.object({
          carrier: v.string(),
          trackingNumber: v.string(),
          trackingUrl: v.optional(v.string()),
        }),
      ),
    ),
    shippingMethod: v.optional(v.string()),
    // Cost tracking
    costSubtotal: v.optional(v.number()),
    dropshipFee: v.optional(v.number()),
    shippingCost: v.optional(v.number()),
  })
    .index("by_orderNumber", ["orderNumber"])
    .index("by_sessionId", ["sessionId"])
    .index("by_stripeSessionId", ["stripeSessionId"]),

  syncBrands: defineTable({
    turn14BrandId: v.number(),
    brandName: v.string(),
    isEnabled: v.boolean(),
  }).index("by_turn14BrandId", ["turn14BrandId"]).index("by_isEnabled", ["isEnabled"]),

  syncState: defineTable({
    syncType: v.string(),
    lastPage: v.number(),
    totalPages: v.optional(v.number()),
    status: v.string(),
    lastSyncedAt: v.optional(v.number()),
    error: v.optional(v.string()),
  }).index("by_syncType", ["syncType"]),

  chatConversations: defineTable({
    sessionId: v.string(),
    customerName: v.string(),
    customerEmail: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("active"),
      v.literal("closed"),
    ),
    assignedAdmin: v.optional(v.string()),
    lastMessageAt: v.number(),
    lastMessagePreview: v.optional(v.string()),
  })
    .index("by_sessionId", ["sessionId"])
    .index("by_customerEmail", ["customerEmail"])
    .index("by_status_lastMessageAt", ["status", "lastMessageAt"]),

  chatMessages: defineTable({
    conversationId: v.id("chatConversations"),
    sender: v.union(v.literal("customer"), v.literal("admin")),
    senderName: v.string(),
    body: v.string(),
    sentAt: v.number(),
  }).index("by_conversationId_sentAt", ["conversationId", "sentAt"]),

  chatTypingIndicators: defineTable({
    conversationId: v.id("chatConversations"),
    sender: v.union(v.literal("customer"), v.literal("admin")),
    senderName: v.string(),
    expiresAt: v.number(),
  }).index("by_conversationId", ["conversationId"]),

  chatSettings: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),
});
