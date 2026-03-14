import { v } from "convex/values";
import { mutation, query, internalQuery, internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const getPendingLeadsForCampaign = internalQuery({
    args: { campaignId: v.id("campaigns"), limit: v.number() },
    handler: async (ctx, args) => {
        // MVP: Just find leads with 'pending' status and no generated message
        return await ctx.db
            .query("leads")
            .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
            .filter((q) => q.eq(q.field("outreachStatus"), "pending"))
            .filter((q) => q.eq(q.field("messageStatus"), "empty"))
            .take(args.limit);
    },
});

export const updateGeneratedMessage = internalMutation({
    args: { leadId: v.id("leads"), message: v.string(), status: v.union(v.literal("draft"), v.literal("ready")) },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.leadId, {
            generatedMessage: args.message,
            messageStatus: args.status,
            updatedAt: Date.now(),
        });

        const lead = await ctx.db.get(args.leadId);
        if (lead) {
            await ctx.db.insert("activities", {
                userId: lead.userId,
                leadId: lead._id,
                type: "message_generated",
                createdAt: Date.now(),
            });
        }
    },
});

// Get all leads for a user
export const listByUser = query({
    args: {
        userId: v.id("users"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit || 100;
        return await ctx.db
            .query("leads")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .order("desc")
            .take(limit);
    },
});

// Get leads by status
export const listByStatus = query({
    args: {
        userId: v.id("users"),
        status: v.union(
            v.literal("pending"),
            v.literal("sent"),
            v.literal("accepted"),
            v.literal("replied")
        ),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("leads")
            .withIndex("by_user_and_status", (q) =>
                q.eq("userId", args.userId).eq("outreachStatus", args.status)
            )
            .collect();
    },
});

// Get single lead
export const get = query({
    args: { id: v.id("leads"), userId: v.optional(v.id("users")) },
    handler: async (ctx, args) => {
        const lead = await ctx.db.get(args.id);
        if (lead && args.userId && lead.userId !== args.userId) {
            return null;
        }
        return lead;
    },
});

// Get leads stats for dashboard
export const getStats = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const leads = await ctx.db
            .query("leads")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();

        const stats = {
            total: leads.length,
            pending: 0,
            sent: 0,
            accepted: 0,
            replied: 0,
            hot: 0,
            warm: 0,
            cold: 0,
            avgScore: 0,
        };

        let totalScore = 0;

        for (const lead of leads) {
            stats[lead.outreachStatus]++;
            stats[lead.scoreTier]++;
            totalScore += lead.score;
        }

        stats.avgScore = leads.length > 0 ? Math.round(totalScore / leads.length) : 0;

        // Count leads with generated messages (any status except "empty")
        const messagesGenerated = leads.filter(l => l.messageStatus !== "empty").length;

        return { ...stats, messagesGenerated };
    },
});

// Create a single lead
export const create = mutation({
    args: {
        userId: v.id("users"),
        firstName: v.string(),
        lastName: v.string(),
        company: v.string(),
        title: v.string(),
        linkedInUrl: v.string(),
        email: v.optional(v.string()),
        score: v.optional(v.number()),
        source: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const score = args.score || 50;

        // Determine tier
        let scoreTier: "hot" | "warm" | "cold" = "cold";
        if (score >= 80) scoreTier = "hot";
        else if (score >= 60) scoreTier = "warm";

        const leadId = await ctx.db.insert("leads", {
            userId: args.userId,
            firstName: args.firstName,
            lastName: args.lastName,
            company: args.company,
            title: args.title,
            linkedInUrl: args.linkedInUrl,
            email: args.email,
            score,
            scoreTier,
            bookingStatus: "not_booked",
            potentialValue: 0,
            postScraped: false,
            messageStatus: "empty",
            outreachStatus: "pending",
            source: args.source || "manual",
            importedAt: now,
            createdAt: now,
            updatedAt: now,
        });

        // Log activity
        await ctx.db.insert("activities", {
            userId: args.userId,
            leadId,
            type: "lead_imported",
            createdAt: now,
        });

        return leadId;
    },
});

// Get leads by message status
export const listByMessageStatus = query({
    args: {
        userId: v.id("users"),
        messageStatus: v.union(
            v.literal("empty"),
            v.literal("draft"),
            v.literal("approved"),
            v.literal("ready"),
            v.literal("sent")
        ),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("leads")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .filter((q) => q.eq(q.field("messageStatus"), args.messageStatus))
            .collect();
    },
});

// Bulk approve messages
export const bulkApprove = mutation({
    args: { ids: v.array(v.id("leads")) },
    handler: async (ctx, args) => {
        const now = Date.now();
        let count = 0;
        for (const id of args.ids) {
            const lead = await ctx.db.get(id);
            if (!lead || lead.messageStatus !== "draft") continue;
            await ctx.db.patch(id, {
                messageStatus: "approved",
                updatedAt: now,
            });
            await ctx.db.insert("activities", {
                userId: lead.userId,
                leadId: id,
                type: "message_approved",
                createdAt: now,
            });
            count++;
        }
        return count;
    },
});

// Bulk import leads
export const bulkCreate = mutation({
    args: {
        userId: v.id("users"),
        leads: v.array(v.object({
            firstName: v.string(),
            lastName: v.string(),
            company: v.string(),
            title: v.string(),
            linkedInUrl: v.string(),
            email: v.optional(v.string()),
            score: v.optional(v.number()),
        })),
        source: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const createdIds: Id<"leads">[] = [];

        for (const lead of args.leads) {
            // Check for duplicate by LinkedIn URL
            const existing = await ctx.db
                .query("leads")
                .withIndex("by_linkedin_url", (q) => q.eq("linkedInUrl", lead.linkedInUrl))
                .first();

            if (existing) continue; // Skip duplicates

            const score = lead.score || (50 + Math.floor(Math.random() * 40));
            let scoreTier: "hot" | "warm" | "cold" = "cold";
            if (score >= 80) scoreTier = "hot";
            else if (score >= 60) scoreTier = "warm";

            const leadId = await ctx.db.insert("leads", {
                userId: args.userId,
                ...lead,
                score,
                scoreTier,
                bookingStatus: "not_booked",
                potentialValue: 0,
                postScraped: false,
                messageStatus: "empty",
                outreachStatus: "pending",
                source: args.source || "csv",
                importedAt: now,
                createdAt: now,
                updatedAt: now,
            });

            createdIds.push(leadId);
        }

        // Log bulk import activity
        await ctx.db.insert("activities", {
            userId: args.userId,
            type: "lead_imported",
            metadata: { count: createdIds.length },
            createdAt: now,
        });

        return {
            imported: createdIds.length,
            skipped: args.leads.length - createdIds.length,
        };
    },
});

// Update lead score
export const updateScore = mutation({
    args: {
        id: v.id("leads"),
        score: v.number(),
        scoreBreakdown: v.optional(v.object({
            companySize: v.number(),
            followerInfluence: v.number(),
            recentActivity: v.number(),
            eventKeywords: v.number(),
            mutualConnections: v.number(),
            titleMatch: v.number(),
        })),
    },
    handler: async (ctx, args) => {
        let scoreTier: "hot" | "warm" | "cold" = "cold";
        if (args.score >= 80) scoreTier = "hot";
        else if (args.score >= 60) scoreTier = "warm";

        await ctx.db.patch(args.id, {
            score: args.score,
            scoreTier,
            scoreBreakdown: args.scoreBreakdown,
            updatedAt: Date.now(),
        });

        return args.id;
    },
});

// Update generated message
export const updateMessage = mutation({
    args: {
        id: v.id("leads"),
        message: v.string(),
        tone: v.optional(v.string()),
        status: v.optional(v.union(
            v.literal("empty"),
            v.literal("draft"),
            v.literal("approved"),
            v.literal("ready"),
            v.literal("sent")
        )),
    },
    handler: async (ctx, args) => {
        const lead = await ctx.db.get(args.id);
        if (!lead) throw new Error("Lead not found");

        await ctx.db.patch(args.id, {
            generatedMessage: args.message,
            messageTone: args.tone,
            messageStatus: args.status || "draft",
            updatedAt: Date.now(),
        });

        // Log activity
        await ctx.db.insert("activities", {
            userId: lead.userId,
            leadId: args.id,
            type: "message_generated",
            createdAt: Date.now(),
        });

        return args.id;
    },
});

// Approve message
export const approveMessage = mutation({
    args: { id: v.id("leads") },
    handler: async (ctx, args) => {
        const lead = await ctx.db.get(args.id);
        if (!lead) throw new Error("Lead not found");

        await ctx.db.patch(args.id, {
            messageStatus: "approved",
            updatedAt: Date.now(),
        });

        await ctx.db.insert("activities", {
            userId: lead.userId,
            leadId: args.id,
            type: "message_approved",
            createdAt: Date.now(),
        });

        return args.id;
    },
});

// Mark as sent
export const markAsSent = mutation({
    args: { id: v.id("leads") },
    handler: async (ctx, args) => {
        const lead = await ctx.db.get(args.id);
        if (!lead) throw new Error("Lead not found");

        const now = Date.now();

        await ctx.db.patch(args.id, {
            messageStatus: "sent",
            outreachStatus: "sent",
            outreachSentAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("activities", {
            userId: lead.userId,
            leadId: args.id,
            type: "connection_sent",
            createdAt: now,
        });

        return args.id;
    },
});

// Update outreach status (from webhook)
export const updateOutreachStatus = mutation({
    args: {
        id: v.id("leads"),
        status: v.union(
            v.literal("pending"),
            v.literal("sent"),
            v.literal("accepted"),
            v.literal("replied")
        ),
    },
    handler: async (ctx, args) => {
        const lead = await ctx.db.get(args.id);
        if (!lead) throw new Error("Lead not found");

        const now = Date.now();

        await ctx.db.patch(args.id, {
            outreachStatus: args.status,
            outreachRespondedAt: args.status !== "pending" && args.status !== "sent" ? now : undefined,
            updatedAt: now,
        });

        // Log appropriate activity
        const activityType = args.status === "accepted"
            ? "connection_accepted"
            : args.status === "replied"
                ? "message_replied"
                : "connection_sent";

        await ctx.db.insert("activities", {
            userId: lead.userId,
            leadId: args.id,
            type: activityType,
            createdAt: now,
        });

        return args.id;
    },
});

// Delete lead
export const remove = mutation({
    args: { id: v.id("leads") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
        return args.id;
    },
});

// Bulk delete leads
export const bulkRemove = mutation({
    args: { ids: v.array(v.id("leads")) },
    handler: async (ctx, args) => {
        for (const id of args.ids) {
            await ctx.db.delete(id);
        }
        return args.ids.length;
    },
});
