import { mutation, query, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();
  },
});

export const current = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();
  },
});

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

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        imageUrl: args.imageUrl,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      ...args,
      onboardingCompleted: false,
      unipileConnected: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const completeOnboarding = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();
    if (!user) throw new Error("User not found");
    await ctx.db.patch(user._id, {
      onboardingCompleted: true,
      updatedAt: Date.now(),
    });
  },
});

export const updateUnipileConnection = mutation({
  args: {
    clerkId: v.string(),
    unipileConnected: v.boolean(),
    unipileAccountId: v.optional(v.string()),
  },
  handler: async (ctx, { clerkId, unipileConnected, unipileAccountId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();
    if (!user) throw new Error("User not found");
    await ctx.db.patch(user._id, {
      unipileConnected,
      unipileAccountId,
      unipileHealthy: unipileConnected ? true : undefined,
      updatedAt: Date.now(),
    });
  },
});

export const setUnipileHealth = internalMutation({
  args: {
    userId: v.id("users"),
    healthy: v.boolean(),
  },
  handler: async (ctx, { userId, healthy }) => {
    await ctx.db.patch(userId, {
      unipileHealthy: healthy,
      unipileLastChecked: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Internal queries for server-side actions
export const getById = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db.get(userId);
  },
});

export const getConnectedUsers = internalQuery({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.filter((u) => u.unipileConnected && u.unipileAccountId);
  },
});
