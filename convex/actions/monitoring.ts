"use node";

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";

export const checkConnections = internalAction({
  handler: async (ctx) => {
    const users = await ctx.runQuery(internal.users.getConnectedUsers);
    for (const user of users) {
      if (!user.unipileAccountId) continue;
      const sentLeads = await ctx.runQuery(internal.leads.getSentLeads, { userId: user._id });
      if (sentLeads.length === 0) continue;

      const byIdentifier = new Map<string, string>();
      const byProviderId = new Map<string, string>();
      for (const lead of sentLeads) {
        if (lead.linkedinIdentifier) byIdentifier.set(lead.linkedinIdentifier.toLowerCase(), lead._id);
        if (lead.providerId) byProviderId.set(lead.providerId, lead._id);
      }

      const relations = await ctx.runAction(internal.actions.unipile.fetchRelations, {
        accountId: user.unipileAccountId,
      });

      for (const relation of relations) {
        const identifier = relation.public_identifier?.toLowerCase();
        const leadId =
          (identifier && byIdentifier.get(identifier)) ||
          byProviderId.get(relation.member_id || "") ||
          byProviderId.get(relation.provider_id || "");
        if (leadId) {
          await ctx.runMutation(internal.leads.updateStatus, {
            leadId: leadId as any, status: "accepted",
          });
          await ctx.runMutation(internal.activities.log, {
            userId: user._id, leadId: leadId as any, type: "connection_accepted",
          });
        }
      }
    }
  },
});

export const detectReplies = internalAction({
  handler: async (ctx) => {
    const users = await ctx.runQuery(internal.users.getConnectedUsers);
    for (const user of users) {
      if (!user.unipileAccountId) continue;
      const acceptedLeads = await ctx.runQuery(internal.leads.getAcceptedLeads, { userId: user._id });
      if (acceptedLeads.length === 0) continue;

      const providerIdToLeadId = new Map<string, string>();
      const nameToLeadId = new Map<string, string>();
      for (const lead of acceptedLeads) {
        if (lead.providerId) providerIdToLeadId.set(lead.providerId, lead._id);
        const name = [lead.firstName, lead.lastName].filter(Boolean).join(" ").toLowerCase();
        if (name) nameToLeadId.set(name, lead._id);
      }

      const chats = await ctx.runAction(internal.actions.unipile.fetchChats, {
        accountId: user.unipileAccountId,
      });

      for (const chat of chats) {
        let matchedLeadId: string | null = null;

        if (chat.attendee_provider_id) {
          matchedLeadId = providerIdToLeadId.get(chat.attendee_provider_id as string) || null;
        }
        if (!matchedLeadId && Array.isArray(chat.attendees)) {
          for (const a of chat.attendees as Array<Record<string, unknown>>) {
            if (a.provider_id) {
              matchedLeadId = providerIdToLeadId.get(a.provider_id as string) || null;
              if (matchedLeadId) break;
            }
          }
        }
        if (!matchedLeadId) {
          const displayName = (chat.attendee_display_name || chat.name) as string;
          if (displayName) matchedLeadId = nameToLeadId.get(displayName.toLowerCase().trim()) || null;
        }
        if (!matchedLeadId && Array.isArray(chat.attendees)) {
          for (const a of chat.attendees as Array<Record<string, unknown>>) {
            const name = (a.display_name || a.name) as string;
            if (name) {
              matchedLeadId = nameToLeadId.get(name.toLowerCase().trim()) || null;
              if (matchedLeadId) break;
            }
          }
        }

        if (!matchedLeadId) continue;

        const messages = await ctx.runAction(internal.actions.unipile.fetchChatMessages, {
          accountId: user.unipileAccountId, chatId: chat.id as string,
        });

        let hasReply = false;
        for (const msg of messages) {
          const isReply = msg.is_sender === 0 || msg.is_sender === false;
          const messageText = (msg.text || msg.body || "") as string;
          if (!messageText) continue;
          const providerMessageId = (msg.id || `synth_${matchedLeadId}_${chat.id}_${Date.now()}`) as string;
          await ctx.runMutation(internal.messages.upsert, {
            leadId: matchedLeadId as any,
            chatId: chat.id as string,
            messageText,
            senderType: isReply ? "them" : "us",
            isReply,
            receivedAt: msg.timestamp ? new Date(msg.timestamp as string).getTime() : Date.now(),
            providerMessageId,
          });
          if (isReply) hasReply = true;
        }

        if (hasReply) {
          await ctx.runMutation(internal.leads.updateStatus, {
            leadId: matchedLeadId as any, status: "replied",
          });
          await ctx.runMutation(internal.activities.log, {
            userId: user._id, leadId: matchedLeadId as any, type: "reply_received",
          });
        }
      }
    }
  },
});

export const healthCheckAll = internalAction({
  handler: async (ctx) => {
    const users = await ctx.runQuery(internal.users.getConnectedUsers);
    for (const user of users) {
      if (!user.unipileAccountId) continue;
      const result = await ctx.runAction(internal.actions.unipile.healthCheck, {
        accountId: user.unipileAccountId,
      });
      await ctx.runMutation(internal.users.setUnipileHealth, {
        userId: user._id, healthy: result.healthy,
      });
      if (!result.healthy) {
        const batch = await ctx.runQuery(internal.batches.getActiveBatchInternal, { userId: user._id });
        if (batch && batch.status === "running") {
          await ctx.runMutation(internal.batches.setStatus, {
            batchId: batch._id, status: "error_disconnected",
            pauseReason: "LinkedIn disconnected",
          });
          await ctx.runMutation(internal.activities.log, {
            userId: user._id, batchId: batch._id, type: "linkedin_disconnected",
            metadata: { error: result.error },
          });
        }
      }
    }
  },
});

export const autoResume = internalAction({
  handler: async (ctx) => {
    const pausedBatches = await ctx.runQuery(internal.batches.getPausedWithAutoResume);
    const now = Date.now();
    for (const batch of pausedBatches) {
      if (batch.autoResumeAt && batch.autoResumeAt <= now) {
        await ctx.runMutation(internal.batches.setStatus, {
          batchId: batch._id, status: "running",
        });
        await ctx.runMutation(internal.activities.log, {
          userId: batch.userId, batchId: batch._id, type: "batch_resumed",
          metadata: { autoResumed: true },
        });
      }
    }
  },
});

export const resetDailyCounts = internalAction({
  handler: async (ctx) => {
    await ctx.runMutation(internal.batches.resetAllDailyCounts);
  },
});

export const resetWeeklyCounts = internalAction({
  handler: async (ctx) => {
    await ctx.runMutation(internal.batches.resetAllWeeklyCounts);
  },
});
