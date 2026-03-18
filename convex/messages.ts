import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upsert = internalMutation({
  args: {
    leadId: v.id("leads"),
    chatId: v.string(),
    messageText: v.string(),
    senderType: v.union(v.literal("us"), v.literal("them")),
    isReply: v.boolean(),
    receivedAt: v.number(),
    providerMessageId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("messages")
      .withIndex("by_provider_message", (q) =>
        q.eq("providerMessageId", args.providerMessageId)
      )
      .first();

    if (existing) return existing._id;
    return await ctx.db.insert("messages", args);
  },
});

export const getByLead = query({
  args: { leadId: v.id("leads") },
  handler: async (ctx, { leadId }) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_lead", (q) => q.eq("leadId", leadId))
      .collect();
  },
});
