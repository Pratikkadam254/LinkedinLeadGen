import { mutation, query, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

const emptyStats = {
  sent: 0,
  accepted: 0,
  replied: 0,
  alreadyConnected: 0,
  errors: 0,
  pending: 0,
};

const batchStatusValidator = v.union(
  v.literal("draft"),
  v.literal("running"),
  v.literal("paused"),
  v.literal("completed"),
  v.literal("cancelled"),
  v.literal("daily_limit_reached"),
  v.literal("weekly_limit_reached"),
  v.literal("error_disconnected")
);

export const create = mutation({
  args: {
    userId: v.id("users"),
    fileName: v.string(),
    totalLeads: v.number(),
    globalMessage: v.optional(v.string()),
    rateTier: v.union(
      v.literal("conservative"),
      v.literal("normal"),
      v.literal("aggressive")
    ),
  },
  handler: async (ctx, args) => {
    const running = await ctx.db
      .query("batches")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", args.userId).eq("status", "running")
      )
      .first();
    if (running) {
      throw new Error("You already have a running batch. Please wait for it to finish or cancel it.");
    }

    return await ctx.db.insert("batches", {
      userId: args.userId,
      fileName: args.fileName,
      totalLeads: args.totalLeads,
      globalMessage: args.globalMessage,
      status: "draft",
      rateTier: args.rateTier,
      stats: { ...emptyStats, pending: args.totalLeads },
      dailySentCount: 0,
      weeklySentCount: 0,
      createdAt: Date.now(),
    });
  },
});

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("batches")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { batchId: v.id("batches") },
  handler: async (ctx, { batchId }) => {
    return await ctx.db.get(batchId);
  },
});

// Active batch helper (shared logic)
async function findActiveBatch(ctx: any, userId: any) {
  const batches = await ctx.db
    .query("batches")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .order("desc")
    .collect();
  return batches.find((b: any) =>
    ["running", "paused", "daily_limit_reached", "weekly_limit_reached", "error_disconnected"].includes(b.status)
  ) ?? null;
}

export const getActiveBatch = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => findActiveBatch(ctx, userId),
});

export const getActiveBatchInternal = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => findActiveBatch(ctx, userId),
});

export const start = mutation({
  args: { batchId: v.id("batches") },
  handler: async (ctx, { batchId }) => {
    const batch = await ctx.db.get(batchId);
    if (!batch) throw new Error("Batch not found");
    if (batch.status !== "draft") throw new Error("Batch already started");
    await ctx.db.patch(batchId, {
      status: "running",
      startedAt: Date.now(),
    });
  },
});

export const pause = mutation({
  args: { batchId: v.id("batches"), reason: v.optional(v.string()) },
  handler: async (ctx, { batchId, reason }) => {
    const batch = await ctx.db.get(batchId);
    if (!batch) throw new Error("Batch not found");
    await ctx.db.patch(batchId, {
      status: "paused",
      pauseReason: reason ?? "user_paused",
    });
  },
});

export const resume = mutation({
  args: { batchId: v.id("batches") },
  handler: async (ctx, { batchId }) => {
    const batch = await ctx.db.get(batchId);
    if (!batch) throw new Error("Batch not found");
    await ctx.db.patch(batchId, {
      status: "running",
      pauseReason: undefined,
      autoResumeAt: undefined,
    });
  },
});

export const cancel = mutation({
  args: { batchId: v.id("batches") },
  handler: async (ctx, { batchId }) => {
    const batch = await ctx.db.get(batchId);
    if (!batch) throw new Error("Batch not found");

    const pendingLeads = await ctx.db
      .query("leads")
      .withIndex("by_batch_and_status", (q) =>
        q.eq("batchId", batchId).eq("status", "pending")
      )
      .collect();

    for (const lead of pendingLeads) {
      await ctx.db.patch(lead._id, { status: "cancelled" });
    }

    await ctx.db.patch(batchId, {
      status: "cancelled",
      completedAt: Date.now(),
      stats: { ...batch.stats, pending: 0 },
    });
  },
});

export const updateStats = mutation({
  args: { batchId: v.id("batches") },
  handler: async (ctx, { batchId }) => {
    const batch = await ctx.db.get(batchId);
    if (!batch) return;

    const leads = await ctx.db
      .query("leads")
      .withIndex("by_batch", (q) => q.eq("batchId", batchId))
      .collect();

    const stats = {
      sent: leads.filter((l) => l.status === "sent").length,
      accepted: leads.filter((l) => l.status === "accepted").length,
      replied: leads.filter((l) => l.status === "replied").length,
      alreadyConnected: leads.filter((l) => l.status === "already_connected").length,
      errors: leads.filter((l) => l.status === "error").length,
      pending: leads.filter((l) => l.status === "pending").length,
    };

    const ratePerDay = batch.rateTier === "conservative" ? 16
      : batch.rateTier === "normal" ? 36 : 72;
    const daysRemaining = stats.pending / ratePerDay;
    const estimatedCompletion = stats.pending > 0
      ? Date.now() + daysRemaining * 24 * 60 * 60 * 1000
      : undefined;

    const isComplete = stats.pending === 0 && batch.status === "running";

    await ctx.db.patch(batchId, {
      stats,
      estimatedCompletion,
      ...(isComplete ? { status: "completed" as const, completedAt: Date.now() } : {}),
    });
  },
});

// Internal version of updateStats for use by actions
export const updateStatsInternal = internalMutation({
  args: { batchId: v.id("batches") },
  handler: async (ctx, { batchId }) => {
    const batch = await ctx.db.get(batchId);
    if (!batch) return;

    const leads = await ctx.db
      .query("leads")
      .withIndex("by_batch", (q) => q.eq("batchId", batchId))
      .collect();

    const stats = {
      sent: leads.filter((l) => l.status === "sent").length,
      accepted: leads.filter((l) => l.status === "accepted").length,
      replied: leads.filter((l) => l.status === "replied").length,
      alreadyConnected: leads.filter((l) => l.status === "already_connected").length,
      errors: leads.filter((l) => l.status === "error").length,
      pending: leads.filter((l) => l.status === "pending").length,
    };

    const ratePerDay = batch.rateTier === "conservative" ? 16
      : batch.rateTier === "normal" ? 36 : 72;
    const daysRemaining = stats.pending / ratePerDay;
    const estimatedCompletion = stats.pending > 0
      ? Date.now() + daysRemaining * 24 * 60 * 60 * 1000
      : undefined;

    const isComplete = stats.pending === 0 && batch.status === "running";

    await ctx.db.patch(batchId, {
      stats,
      estimatedCompletion,
      ...(isComplete ? { status: "completed" as const, completedAt: Date.now() } : {}),
    });
  },
});

// Internal functions for server-side actions
export const getRunningBatches = internalQuery({
  handler: async (ctx) => {
    return await ctx.db
      .query("batches")
      .withIndex("by_status", (q) => q.eq("status", "running"))
      .collect();
  },
});

export const setStatus = internalMutation({
  args: {
    batchId: v.id("batches"),
    status: batchStatusValidator,
    pauseReason: v.optional(v.string()),
    autoResumeAt: v.optional(v.number()),
  },
  handler: async (ctx, { batchId, status, pauseReason, autoResumeAt }) => {
    await ctx.db.patch(batchId, { status, pauseReason, autoResumeAt });
  },
});

export const incrementSentCount = internalMutation({
  args: {
    batchId: v.id("batches"),
    nextSendAt: v.number(),
  },
  handler: async (ctx, { batchId, nextSendAt }) => {
    const batch = await ctx.db.get(batchId);
    if (!batch) return;
    await ctx.db.patch(batchId, {
      dailySentCount: batch.dailySentCount + 1,
      weeklySentCount: batch.weeklySentCount + 1,
      lastSentAt: Date.now(),
      nextSendAt,
    });
  },
});

export const getPausedWithAutoResume = internalQuery({
  handler: async (ctx) => {
    const paused = await ctx.db
      .query("batches")
      .withIndex("by_status", (q) => q.eq("status", "paused"))
      .collect();
    return paused.filter((b) => b.autoResumeAt);
  },
});

export const resetAllDailyCounts = internalMutation({
  handler: async (ctx) => {
    const activeStatuses = ["running", "paused", "daily_limit_reached", "weekly_limit_reached", "error_disconnected"];
    const batches = await ctx.db.query("batches").collect();
    for (const batch of batches) {
      if (!activeStatuses.includes(batch.status)) continue;
      const updates: Record<string, unknown> = {};
      if (batch.dailySentCount > 0) updates.dailySentCount = 0;
      if (batch.status === "daily_limit_reached") {
        updates.status = "running";
        updates.pauseReason = undefined;
      }
      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(batch._id, updates);
      }
    }
  },
});

export const resetAllWeeklyCounts = internalMutation({
  handler: async (ctx) => {
    const activeStatuses = ["running", "paused", "daily_limit_reached", "weekly_limit_reached", "error_disconnected"];
    const batches = await ctx.db.query("batches").collect();
    for (const batch of batches) {
      if (!activeStatuses.includes(batch.status)) continue;
      const updates: Record<string, unknown> = {};
      if (batch.weeklySentCount > 0) updates.weeklySentCount = 0;
      if (batch.status === "weekly_limit_reached") {
        updates.status = "running";
        updates.pauseReason = undefined;
      }
      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(batch._id, updates);
      }
    }
  },
});
