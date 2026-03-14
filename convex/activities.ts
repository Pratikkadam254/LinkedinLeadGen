import { v } from "convex/values";
import { query } from "./_generated/server";

// Get recent activities for a user
export const listRecent = query({
    args: {
        userId: v.id("users"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit || 50;
        return await ctx.db
            .query("activities")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .order("desc")
            .take(limit);
    },
});

// Get activities for a specific lead
export const listByLead = query({
    args: { leadId: v.id("leads") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("activities")
            .withIndex("by_lead", (q) => q.eq("leadId", args.leadId))
            .order("desc")
            .collect();
    },
});

// Get activity summary for dashboard
export const getSummary = query({
    args: {
        userId: v.id("users"),
        days: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const days = args.days || 7;
        const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);

        const activities = await ctx.db
            .query("activities")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .filter((q) => q.gte(q.field("createdAt"), cutoffTime))
            .collect();

        const summary = {
            leadsImported: 0,
            messagesGenerated: 0,
            connectionsSent: 0,
            connectionsAccepted: 0,
            repliesReceived: 0,
        };

        for (const activity of activities) {
            switch (activity.type) {
                case "lead_imported":
                    summary.leadsImported += (activity.metadata as any)?.count || 1;
                    break;
                case "message_generated":
                    summary.messagesGenerated++;
                    break;
                case "connection_sent":
                    summary.connectionsSent++;
                    break;
                case "connection_accepted":
                    summary.connectionsAccepted++;
                    break;
                case "message_replied":
                    summary.repliesReceived++;
                    break;
            }
        }

        return summary;
    },
});
