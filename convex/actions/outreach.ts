"use node";

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";

function getConfig() {
  const baseUrl = process.env.UNIPILE_BASE_URL;
  const apiKey = process.env.UNIPILE_API_KEY;
  if (!baseUrl || !apiKey) throw new Error("UNIPILE_BASE_URL and UNIPILE_API_KEY must be set");
  return { baseUrl, apiKey };
}

async function unipileFetch(path: string, options?: RequestInit) {
  const { baseUrl, apiKey } = getConfig();
  const url = path.startsWith("http") ? path : `${baseUrl}/api/v1${path}`;
  return fetch(url, {
    ...options,
    headers: {
      "X-API-KEY": apiKey,
      accept: "application/json",
      "content-type": "application/json",
      ...(options?.headers || {}),
    },
  });
}

const RATE_DELAYS = {
  conservative: { min: 45 * 60 * 1000, max: 90 * 60 * 1000 },
  normal:       { min: 20 * 60 * 1000, max: 40 * 60 * 1000 },
  aggressive:   { min: 10 * 60 * 1000, max: 20 * 60 * 1000 },
};

const DAILY_LIMITS = { conservative: 16, normal: 36, aggressive: 72 };
const WEEKLY_LIMIT = 200;

export const processOutreach = internalAction({
  handler: async (ctx) => {
    const allBatches = await ctx.runQuery(internal.batches.getRunningBatches);

    for (const batch of allBatches) {
      const user = await ctx.runQuery(internal.users.getById, { userId: batch.userId });
      if (!user || !user.unipileConnected || !user.unipileAccountId) continue;

      const dailyLimit = DAILY_LIMITS[batch.rateTier];
      if (batch.dailySentCount >= dailyLimit) {
        await ctx.runMutation(internal.batches.setStatus, {
          batchId: batch._id, status: "daily_limit_reached",
          pauseReason: `Daily limit of ${dailyLimit} reached`,
        });
        continue;
      }

      if (batch.weeklySentCount >= WEEKLY_LIMIT) {
        await ctx.runMutation(internal.batches.setStatus, {
          batchId: batch._id, status: "weekly_limit_reached",
          pauseReason: "LinkedIn weekly limit of 200 reached",
        });
        await ctx.runMutation(internal.activities.log, {
          userId: batch.userId, batchId: batch._id, type: "weekly_limit_warning",
        });
        continue;
      }

      if (batch.nextSendAt && Date.now() < batch.nextSendAt) continue;

      const lead = await ctx.runQuery(internal.leads.getNextPending, { batchId: batch._id });
      if (!lead) {
        await ctx.runMutation(internal.batches.updateStatsInternal, { batchId: batch._id });
        continue;
      }

      const identifier = lead.linkedinIdentifier;
      if (!identifier) {
        await ctx.runMutation(internal.leads.updateStatus, {
          leadId: lead._id, status: "error",
          errorType: "invalid_url", errorDetail: "Could not extract LinkedIn identifier",
        });
        await ctx.runMutation(internal.batches.updateStatsInternal, { batchId: batch._id });
        continue;
      }

      let providerId: string | null = null;
      try {
        const profileRes = await unipileFetch(
          `/users/${identifier}?account_id=${user.unipileAccountId}`
        );
        if (!profileRes.ok) {
          await ctx.runMutation(internal.leads.updateStatus, {
            leadId: lead._id, status: "error",
            errorType: "profile_not_found", errorDetail: `${profileRes.status}`,
          });
          await ctx.runMutation(internal.activities.log, {
            userId: batch.userId, batchId: batch._id, leadId: lead._id,
            type: "error", metadata: { error: "profile_not_found", identifier },
          });
          await ctx.runMutation(internal.batches.updateStatsInternal, { batchId: batch._id });
          continue;
        }
        const profile = await profileRes.json();
        providerId = profile.provider_id || profile.id || null;
      } catch (err) {
        await ctx.runMutation(internal.leads.updateStatus, {
          leadId: lead._id, status: "error",
          errorType: "api_error", errorDetail: String(err),
        });
        await ctx.runMutation(internal.batches.updateStatsInternal, { batchId: batch._id });
        continue;
      }

      if (!providerId) {
        await ctx.runMutation(internal.leads.updateStatus, {
          leadId: lead._id, status: "error",
          errorType: "profile_not_found", errorDetail: "No provider_id returned",
        });
        await ctx.runMutation(internal.batches.updateStatsInternal, { batchId: batch._id });
        continue;
      }

      try {
        const message = lead.message ? lead.message.slice(0, 300) : undefined;
        const body: Record<string, string> = {
          provider_id: providerId,
          account_id: user.unipileAccountId,
        };
        if (message) body.message = message;

        const inviteRes = await unipileFetch("/users/invite", {
          method: "POST",
          body: JSON.stringify(body),
        });

        if (!inviteRes.ok) {
          const errText = await inviteRes.text();
          const isAlreadyInvited = errText.toLowerCase().includes("already_invited");

          if (isAlreadyInvited) {
            await ctx.runMutation(internal.leads.updateStatus, {
              leadId: lead._id, status: "already_connected", providerId,
            });
            await ctx.runMutation(internal.activities.log, {
              userId: batch.userId, batchId: batch._id, leadId: lead._id,
              type: "connection_sent", metadata: { alreadyConnected: true },
            });
          } else if (inviteRes.status === 422) {
            await ctx.runMutation(internal.batches.setStatus, {
              batchId: batch._id, status: "paused",
              pauseReason: "rate_limited",
              autoResumeAt: Date.now() + 60 * 60 * 1000,
            });
            await ctx.runMutation(internal.activities.log, {
              userId: batch.userId, batchId: batch._id, type: "rate_limit_hit",
            });
          } else {
            await ctx.runMutation(internal.leads.updateStatus, {
              leadId: lead._id, status: "error",
              errorType: "api_error", errorDetail: `${inviteRes.status}: ${errText.slice(0, 200)}`,
              providerId,
            });
            await ctx.runMutation(internal.activities.log, {
              userId: batch.userId, batchId: batch._id, leadId: lead._id,
              type: "error", metadata: { error: errText.slice(0, 200) },
            });
          }
        } else {
          await ctx.runMutation(internal.leads.updateStatus, {
            leadId: lead._id, status: "sent", providerId,
          });
          await ctx.runMutation(internal.activities.log, {
            userId: batch.userId, batchId: batch._id, leadId: lead._id,
            type: "connection_sent",
          });
          const delay = RATE_DELAYS[batch.rateTier];
          const nextDelay = Math.floor(Math.random() * (delay.max - delay.min)) + delay.min;
          await ctx.runMutation(internal.batches.incrementSentCount, {
            batchId: batch._id, nextSendAt: Date.now() + nextDelay,
          });
        }
      } catch (err) {
        await ctx.runMutation(internal.leads.updateStatus, {
          leadId: lead._id, status: "error",
          errorType: "api_error", errorDetail: String(err), providerId,
        });
      }

      await ctx.runMutation(internal.batches.updateStatsInternal, { batchId: batch._id });
    }
  },
});
