"use node";
import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

export const fireWebhook = internalAction({
  args: {
    webhookId: v.id("webhookEndpoints"),
    event: v.string(),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    const endpoint = await ctx.runQuery(internal.webhooks.getById, { id: args.webhookId });
    if (!endpoint || !endpoint.isActive) return;

    const body = JSON.stringify({
      event: args.event,
      timestamp: Date.now(),
      data: args.payload,
    });

    // HMAC-SHA256 signature
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(endpoint.secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
    const signature = "sha256=" + Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Retry up to 3 times
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch(endpoint.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-LeadFlow-Signature": signature,
            "X-LeadFlow-Event": args.event,
          },
          body,
        });

        if (res.ok) {
          await ctx.runMutation(internal.webhooks.markSuccess, { id: args.webhookId });
          return;
        }
      } catch {
        // Retry on next iteration
      }

      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
      }
    }

    // All retries failed
    await ctx.runMutation(internal.webhooks.markFailure, { id: args.webhookId });
  },
});
