import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";

export const getActiveAutopilotCampaigns = internalQuery({
    handler: async (ctx) => {
        return await ctx.db
            .query("campaigns")
            .withIndex("by_status", (q) => q.eq("status", "active"))
            .filter((q) => q.eq(q.field("autoPilot"), true))
            .collect();
    },
});

export const list = query({
    handler: async (ctx) => {
        const userId = await ctx.auth.getUserIdentity();
        if (!userId) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId.subject))
            .first();

        if (!user) return [];

        return await ctx.db
            .query("campaigns")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .order("desc")
            .collect();
    },
});

export const create = mutation({
    args: {
        strategyId: v.id("strategies"),
        name: v.string(),
        autoPilot: v.boolean(),
        schedule: v.object({
            timezone: v.string(),
            days: v.array(v.string()),
            hours: v.object({
                start: v.string(),
                end: v.string(),
            }),
        }),
    },
    handler: async (ctx, args) => {
        const userId = await ctx.auth.getUserIdentity();
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId.subject))
            .first();

        if (!user) throw new Error("User not found");

        const campaignId = await ctx.db.insert("campaigns", {
            userId: user._id,
            strategyId: args.strategyId,
            name: args.name,
            autoPilot: args.autoPilot,
            status: "active",
            schedule: args.schedule,
            stats: {
                sent: 0,
                replied: 0,
                booked: 0,
                revenue: 0,
            },
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        // Log activity
        await ctx.db.insert("activities", {
            userId: user._id,
            campaignId,
            type: "campaign_created",
            createdAt: Date.now(),
        });

        return campaignId;
    },
});

export const updateStatus = mutation({
    args: {
        id: v.id("campaigns"),
        status: v.union(v.literal("active"), v.literal("paused"), v.literal("completed")),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            status: args.status,
            updatedAt: Date.now(),
        });
    },
});

export const toggleAutopilot = mutation({
    args: {
        id: v.id("campaigns"),
        autoPilot: v.boolean(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            autoPilot: args.autoPilot,
            updatedAt: Date.now(),
        });
    },
});
