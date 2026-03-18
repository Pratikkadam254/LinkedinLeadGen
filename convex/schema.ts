import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    onboardingCompleted: v.boolean(),
    // Unipile (multi-tenant: one master API key, per-user account_id)
    unipileConnected: v.boolean(),
    unipileAccountId: v.optional(v.string()),
    unipileHealthy: v.optional(v.boolean()),
    unipileLastChecked: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  batches: defineTable({
    userId: v.id("users"),
    fileName: v.string(),
    totalLeads: v.number(),
    globalMessage: v.optional(v.string()),
    status: v.union(
      v.literal("draft"),
      v.literal("running"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("daily_limit_reached"),
      v.literal("weekly_limit_reached"),
      v.literal("error_disconnected")
    ),
    rateTier: v.union(
      v.literal("conservative"),
      v.literal("normal"),
      v.literal("aggressive")
    ),
    stats: v.object({
      sent: v.number(),
      accepted: v.number(),
      replied: v.number(),
      alreadyConnected: v.number(),
      errors: v.number(),
      pending: v.number(),
    }),
    dailySentCount: v.number(),
    weeklySentCount: v.number(),
    lastSentAt: v.optional(v.number()),
    nextSendAt: v.optional(v.number()),
    estimatedCompletion: v.optional(v.number()),
    pauseReason: v.optional(v.string()),
    autoResumeAt: v.optional(v.number()),
    createdAt: v.number(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_user_and_status", ["userId", "status"]),

  leads: defineTable({
    batchId: v.id("batches"),
    userId: v.id("users"),
    linkedinUrl: v.string(),
    linkedinIdentifier: v.optional(v.string()),
    providerId: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    company: v.optional(v.string()),
    title: v.optional(v.string()),
    message: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("sent"),
      v.literal("accepted"),
      v.literal("replied"),
      v.literal("already_connected"),
      v.literal("error"),
      v.literal("cancelled")
    ),
    errorType: v.optional(v.string()),
    errorDetail: v.optional(v.string()),
    sentAt: v.optional(v.number()),
    acceptedAt: v.optional(v.number()),
    repliedAt: v.optional(v.number()),
  })
    .index("by_batch", ["batchId"])
    .index("by_user", ["userId"])
    .index("by_user_and_status", ["userId", "status"])
    .index("by_linkedin_url", ["linkedinUrl"])
    .index("by_batch_and_status", ["batchId", "status"]),

  messages: defineTable({
    leadId: v.id("leads"),
    chatId: v.string(),
    messageText: v.string(),
    senderType: v.union(v.literal("us"), v.literal("them")),
    isReply: v.boolean(),
    receivedAt: v.number(),
    providerMessageId: v.string(),
  })
    .index("by_lead", ["leadId"])
    .index("by_provider_message", ["providerMessageId"]),

  activities: defineTable({
    userId: v.id("users"),
    batchId: v.optional(v.id("batches")),
    leadId: v.optional(v.id("leads")),
    type: v.union(
      v.literal("batch_created"),
      v.literal("outreach_started"),
      v.literal("connection_sent"),
      v.literal("connection_accepted"),
      v.literal("reply_received"),
      v.literal("error"),
      v.literal("batch_paused"),
      v.literal("batch_resumed"),
      v.literal("batch_cancelled"),
      v.literal("batch_completed"),
      v.literal("linkedin_disconnected"),
      v.literal("linkedin_reconnected"),
      v.literal("rate_limit_hit"),
      v.literal("weekly_limit_warning")
    ),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_recent", ["userId", "createdAt"])
    .index("by_batch", ["batchId"]),
});
