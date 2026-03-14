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

// Get user by ID
export const getById = query({
    args: { id: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

// Update subscription (called by Stripe webhook)
export const updateSubscription = mutation({
    args: {
        clerkId: v.string(),
        plan: v.union(v.literal("free"), v.literal("pro"), v.literal("elite")),
        stripeCustomerId: v.string(),
        stripeSubscriptionId: v.string(),
        subscriptionStatus: v.union(
            v.literal("active"),
            v.literal("past_due"),
            v.literal("canceled"),
            v.literal("trialing")
        ),
        planLimits: v.object({
            leadsPerMonth: v.number(),
            outreachPerMonth: v.number(),
            linkedInAccounts: v.number(),
        }),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();

        if (!user) throw new Error("User not found");

        await ctx.db.patch(user._id, {
            plan: args.plan,
            stripeCustomerId: args.stripeCustomerId,
            stripeSubscriptionId: args.stripeSubscriptionId,
            subscriptionStatus: args.subscriptionStatus,
            planLimits: args.planLimits,
            currentMonthUsage: user.currentMonthUsage || {
                leadsUploaded: 0,
                outreachSent: 0,
                resetAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
            },
            updatedAt: Date.now(),
        });

        return user._id;
    },
});

// Cancel subscription
export const cancelSubscription = mutation({
    args: { stripeCustomerId: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_stripe_customer", (q) => q.eq("stripeCustomerId", args.stripeCustomerId))
            .first();
        if (!user) return;

        await ctx.db.patch(user._id, {
            plan: "free",
            subscriptionStatus: "canceled",
            updatedAt: Date.now(),
        });
    },
});

// Increment usage counters
export const incrementUsage = mutation({
    args: {
        userId: v.id("users"),
        field: v.union(v.literal("leadsUploaded"), v.literal("outreachSent")),
        amount: v.number(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("User not found");

        const now = Date.now();
        let usage = user.currentMonthUsage || {
            leadsUploaded: 0,
            outreachSent: 0,
            resetAt: now + 30 * 24 * 60 * 60 * 1000,
        };

        // Reset if past reset date
        if (now > usage.resetAt) {
            usage = {
                leadsUploaded: 0,
                outreachSent: 0,
                resetAt: now + 30 * 24 * 60 * 60 * 1000,
            };
        }

        usage[args.field] += args.amount;

        await ctx.db.patch(user._id, {
            currentMonthUsage: usage,
            updatedAt: now,
        });
    },
});

// Check plan limits
export const checkPlanLimits = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user || !user.planLimits) {
            return {
                canUploadLeads: false,
                canSendOutreach: false,
                leadsRemaining: 0,
                outreachRemaining: 0,
                hasPlan: false,
            };
        }

        const usage = user.currentMonthUsage || { leadsUploaded: 0, outreachSent: 0, resetAt: 0 };
        const leadsRemaining = Math.max(0, user.planLimits.leadsPerMonth - usage.leadsUploaded);
        const outreachRemaining = Math.max(0, user.planLimits.outreachPerMonth - usage.outreachSent);

        return {
            canUploadLeads: leadsRemaining > 0,
            canSendOutreach: outreachRemaining > 0,
            leadsRemaining,
            outreachRemaining,
            hasPlan: user.plan === "pro" || user.plan === "elite",
        };
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
