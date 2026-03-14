import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get the current user's credit balance.
 */
export const getBalance = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .first();
        if (!user) return null;

        const credits = await ctx.db
            .query("credits")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .first();

        if (!credits) {
            // Return default free plan
            return {
                balance: 100,
                plan: "free" as const,
                monthlyAllocation: 100,
                resetDate: getNextMonthReset(),
            };
        }

        return {
            balance: credits.balance,
            plan: credits.plan,
            monthlyAllocation: credits.monthlyAllocation,
            resetDate: credits.resetDate,
        };
    },
});

/**
 * Initialize credits for a new user (called during onboarding).
 */
export const initializeCredits = mutation({
    args: {
        plan: v.optional(v.union(
            v.literal("free"),
            v.literal("starter"),
            v.literal("pro"),
            v.literal("enterprise")
        )),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .first();
        if (!user) throw new Error("User not found");

        // Check if credits already exist
        const existing = await ctx.db
            .query("credits")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .first();
        if (existing) return existing._id;

        const plan = args.plan || "free";
        const allocations: Record<string, number> = {
            free: 100,
            starter: 500,
            pro: 2500,
            enterprise: 10000,
        };

        const now = Date.now();
        const creditId = await ctx.db.insert("credits", {
            userId: user._id,
            balance: allocations[plan],
            plan,
            monthlyAllocation: allocations[plan],
            resetDate: getNextMonthReset(),
            createdAt: now,
            updatedAt: now,
        });

        // Log initial allocation
        await ctx.db.insert("creditTransactions", {
            userId: user._id,
            amount: allocations[plan],
            type: "monthly_allocation",
            description: `Initial ${plan} plan allocation`,
            createdAt: now,
        });

        return creditId;
    },
});

/**
 * Purchase additional credits.
 */
export const purchaseCredits = mutation({
    args: {
        amount: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .first();
        if (!user) throw new Error("User not found");

        const credits = await ctx.db
            .query("credits")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .first();
        if (!credits) throw new Error("Credits not initialized");

        const now = Date.now();

        // Add credits
        await ctx.db.patch(credits._id, {
            balance: credits.balance + args.amount,
            updatedAt: now,
        });

        // Log transaction
        await ctx.db.insert("creditTransactions", {
            userId: user._id,
            amount: args.amount,
            type: "purchase",
            description: `Purchased ${args.amount} credits`,
            createdAt: now,
        });

        return { newBalance: credits.balance + args.amount };
    },
});

/**
 * Get credit transaction history.
 */
export const getTransactions = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .first();
        if (!user) return [];

        return ctx.db
            .query("creditTransactions")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .order("desc")
            .take(100);
    },
});

/**
 * Helper: get the timestamp for the start of next month.
 */
function getNextMonthReset(): number {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth.getTime();
}
