import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get current user by Clerk ID
export const getByClerkId = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();
    },
});

// Get current user (for authenticated requests)
export const current = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();
    },
});

// Create or update user on sign in
export const upsert = mutation({
    args: {
        clerkId: v.string(),
        email: v.string(),
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();

        const now = Date.now();

        if (existing) {
            // Update existing user
            await ctx.db.patch(existing._id, {
                email: args.email,
                firstName: args.firstName,
                lastName: args.lastName,
                imageUrl: args.imageUrl,
                updatedAt: now,
            });
            return existing._id;
        }

        // Create new user
        return await ctx.db.insert("users", {
            clerkId: args.clerkId,
            email: args.email,
            firstName: args.firstName,
            lastName: args.lastName,
            imageUrl: args.imageUrl,
            onboardingCompleted: false,
            unipileConnected: false,
            createdAt: now,
            updatedAt: now,
        });
    },
});

// Update user preferences (from onboarding)
export const updatePreferences = mutation({
    args: {
        clerkId: v.string(),
        preferences: v.object({
            primaryGoal: v.optional(v.string()),
            targetIndustries: v.optional(v.array(v.string())),
            targetCompanySize: v.optional(v.string()),
            targetTitles: v.optional(v.array(v.string())),
            weeklyVolume: v.optional(v.string()),
            messageTone: v.optional(v.string()),
        }),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();

        if (!user) {
            throw new Error("User not found");
        }

        await ctx.db.patch(user._id, {
            preferences: args.preferences,
            onboardingCompleted: true,
            updatedAt: Date.now(),
        });

        return user._id;
    },
});

// Mark onboarding as complete
export const completeOnboarding = mutation({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();

        if (!user) {
            throw new Error("User not found");
        }

        await ctx.db.patch(user._id, {
            onboardingCompleted: true,
            updatedAt: Date.now(),
        });

        return user._id;
    },
});

// Update Unipile connection status
export const updateUnipileConnection = mutation({
    args: {
        clerkId: v.string(),
        connected: v.boolean(),
        accountId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();

        if (!user) {
            throw new Error("User not found");
        }

        await ctx.db.patch(user._id, {
            unipileConnected: args.connected,
            unipileAccountId: args.accountId,
            updatedAt: Date.now(),
        });

        return user._id;
    },
});
