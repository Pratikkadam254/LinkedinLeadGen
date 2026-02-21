import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";

export const getStrategy = internalQuery({
    args: { strategyId: v.id("strategies") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.strategyId);
    },
});

export const create = mutation({
    args: {
        name: v.string(),
        rawInputs: v.object({
            businessDescription: v.string(),
            targetAudienceHints: v.string(),
            primaryOffer: v.string(),
        }),
        icpDocument: v.string(),
        offerDocument: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await ctx.auth.getUserIdentity();
        if (!userId) throw new Error("Unauthorized");

        // Find user by clerkId
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId.subject))
            .first();

        if (!user) throw new Error("User not found");

        const strategyId = await ctx.db.insert("strategies", {
            userId: user._id,
            name: args.name,
            rawInputs: args.rawInputs,
            icpDocument: args.icpDocument,
            offerDocument: args.offerDocument,
            isActive: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        // Deactivate other strategies (optional, if we want single active strategy)
        // await ctx.db.patch... 

        return strategyId;
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
            .query("strategies")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .order("desc")
            .collect();
    },
});

export const getActive = query({
    handler: async (ctx) => {
        const userId = await ctx.auth.getUserIdentity();
        if (!userId) return null;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId.subject))
            .first();

        if (!user) return null;

        return await ctx.db
            .query("strategies")
            .withIndex("by_user_active", (q) => q.eq("userId", user._id).eq("isActive", true))
            .first();
    },
});
