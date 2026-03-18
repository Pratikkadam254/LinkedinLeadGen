import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const listByBatch = query({
  args: { batchId: v.id("batches") },
  handler: async (ctx, { batchId }) => {
    return await ctx.db
      .query("leads")
      .withIndex("by_batch", (q) => q.eq("batchId", batchId))
      .collect();
  },
});

export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("leads")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const bulkCreate = mutation({
  args: {
    batchId: v.id("batches"),
    userId: v.id("users"),
    leads: v.array(
      v.object({
        linkedinUrl: v.string(),
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
        company: v.optional(v.string()),
        title: v.optional(v.string()),
        message: v.string(),
      })
    ),
  },
  handler: async (ctx, { batchId, userId, leads }) => {
    // Deduplicate within this batch by LinkedIn URL
    const seen = new Set<string>();
    const unique = leads.filter((l) => {
      const url = l.linkedinUrl.toLowerCase().trim();
      if (seen.has(url)) return false;
      seen.add(url);
      return true;
    });

    // Check for duplicates across previous batches
    const duplicates: string[] = [];
    for (const lead of unique) {
      const existing = await ctx.db
        .query("leads")
        .withIndex("by_linkedin_url", (q) =>
          q.eq("linkedinUrl", lead.linkedinUrl.toLowerCase().trim())
        )
        .first();
      if (existing) {
        duplicates.push(lead.linkedinUrl);
      }
    }

    // Extract identifier from LinkedIn URL
    function extractIdentifier(url: string): string | undefined {
      try {
        const parts = url.split("/").filter(Boolean);
        const idx = parts.indexOf("in");
        if (idx === -1) return undefined;
        return parts[idx + 1]?.replace(/\?.*/, "")?.toLowerCase() || undefined;
      } catch {
        return undefined;
      }
    }

    let created = 0;
    for (const lead of unique) {
      const normalizedUrl = lead.linkedinUrl.toLowerCase().trim();
      await ctx.db.insert("leads", {
        batchId,
        userId,
        linkedinUrl: normalizedUrl,
        linkedinIdentifier: extractIdentifier(normalizedUrl),
        firstName: lead.firstName,
        lastName: lead.lastName,
        company: lead.company,
        title: lead.title,
        message: lead.message,
        status: "pending",
      });
      created++;
    }

    return {
      created,
      duplicatesInBatch: leads.length - unique.length,
      duplicatesAcrossBatches: duplicates.length,
      duplicateUrls: duplicates,
    };
  },
});

// Internal mutation used by outreach engine
export const updateStatus = internalMutation({
  args: {
    leadId: v.id("leads"),
    status: v.union(
      v.literal("pending"),
      v.literal("sent"),
      v.literal("accepted"),
      v.literal("replied"),
      v.literal("already_connected"),
      v.literal("error"),
      v.literal("cancelled")
    ),
    providerId: v.optional(v.string()),
    errorType: v.optional(v.string()),
    errorDetail: v.optional(v.string()),
  },
  handler: async (ctx, { leadId, status, providerId, errorType, errorDetail }) => {
    const updates: Record<string, unknown> = { status };
    if (providerId) updates.providerId = providerId;
    if (errorType) updates.errorType = errorType;
    if (errorDetail) updates.errorDetail = errorDetail;
    if (status === "sent") updates.sentAt = Date.now();
    if (status === "accepted") updates.acceptedAt = Date.now();
    if (status === "replied") updates.repliedAt = Date.now();
    await ctx.db.patch(leadId, updates);
  },
});

// Get next pending lead for outreach processing (internalQuery - read only)
export const getNextPending = internalQuery({
  args: { batchId: v.id("batches") },
  handler: async (ctx, { batchId }) => {
    return await ctx.db
      .query("leads")
      .withIndex("by_batch_and_status", (q) =>
        q.eq("batchId", batchId).eq("status", "pending")
      )
      .first();
  },
});

// Get all sent leads for connection checking (internal - called from actions)
export const getSentLeads = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("leads")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", userId).eq("status", "sent")
      )
      .collect();
  },
});

export const getAcceptedLeads = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("leads")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", userId).eq("status", "accepted")
      )
      .collect();
  },
});
