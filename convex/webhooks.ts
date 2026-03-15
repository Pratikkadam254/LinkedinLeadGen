import { mutation, query, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const register = mutation({
  args: {
    url: v.string(),
    name: v.string(),
    events: v.array(v.union(
      v.literal("lead.imported"),
      v.literal("extraction.started"),
      v.literal("extraction.completed"),
      v.literal("credits.low"),
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

    // Generate a random secret for HMAC signing
    const secret = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return ctx.db.insert("webhookEndpoints", {
      userId: user._id,
      url: args.url,
      name: args.name,
      events: args.events,
      secret,
      isActive: true,
      failureCount: 0,
      createdAt: Date.now(),
    });
  },
});

export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) return [];

    return ctx.db
      .query("webhookEndpoints")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const remove = mutation({
  args: { id: v.id("webhookEndpoints") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const endpoint = await ctx.db.get(args.id);
    if (!endpoint) throw new Error("Webhook not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user || endpoint.userId !== user._id) throw new Error("Unauthorized");

    await ctx.db.delete(args.id);
  },
});

export const toggleActive = mutation({
  args: { id: v.id("webhookEndpoints") },
  handler: async (ctx, args) => {
    const endpoint = await ctx.db.get(args.id);
    if (!endpoint) throw new Error("Webhook not found");

    await ctx.db.patch(args.id, { isActive: !endpoint.isActive });
  },
});

export const getById = internalQuery({
  args: { id: v.id("webhookEndpoints") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

export const markSuccess = internalMutation({
  args: { id: v.id("webhookEndpoints") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { lastFiredAt: Date.now(), failureCount: 0 });
  },
});

export const markFailure = internalMutation({
  args: { id: v.id("webhookEndpoints") },
  handler: async (ctx, args) => {
    const endpoint = await ctx.db.get(args.id);
    if (!endpoint) return;
    const newCount = endpoint.failureCount + 1;
    await ctx.db.patch(args.id, {
      failureCount: newCount,
      isActive: newCount < 10, // Disable after 10 consecutive failures
    });
  },
});

export const getActiveForEvent = internalQuery({
  args: { userId: v.id("users"), event: v.string() },
  handler: async (ctx, args) => {
    const endpoints = await ctx.db
      .query("webhookEndpoints")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    return endpoints.filter((e) => e.events.includes(args.event));
  },
});
