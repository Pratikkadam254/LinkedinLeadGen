import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

const activityTypeValidator = v.union(
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
);

export const log = internalMutation({
  args: {
    userId: v.id("users"),
    batchId: v.optional(v.id("batches")),
    leadId: v.optional(v.id("leads")),
    type: activityTypeValidator,
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("activities", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const logFromClient = mutation({
  args: {
    userId: v.id("users"),
    batchId: v.optional(v.id("batches")),
    type: v.union(
      v.literal("batch_created"),
      v.literal("outreach_started"),
      v.literal("batch_paused"),
      v.literal("batch_resumed"),
      v.literal("batch_cancelled")
    ),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("activities", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const listRecent = query({
  args: { userId: v.id("users"), limit: v.optional(v.number()) },
  handler: async (ctx, { userId, limit }) => {
    return await ctx.db
      .query("activities")
      .withIndex("by_user_recent", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit ?? 20);
  },
});

export const listByBatch = query({
  args: { batchId: v.id("batches") },
  handler: async (ctx, { batchId }) => {
    return await ctx.db
      .query("activities")
      .withIndex("by_batch", (q) => q.eq("batchId", batchId))
      .order("desc")
      .collect();
  },
});
