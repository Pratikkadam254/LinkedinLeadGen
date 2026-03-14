import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";

export const sendApproved = action({
    args: {
        userId: v.id("users"),
        leadIds: v.array(v.id("leads")),
    },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(api.users.getById, { id: args.userId });
        if (!user) throw new Error("User not found");

        // Check plan limits
        const limits = await ctx.runQuery(api.users.checkPlanLimits, { userId: args.userId });
        if (!limits.hasPlan) throw new Error("Active subscription required to send outreach");
        if (!limits.canSendOutreach) throw new Error("Monthly outreach limit reached");

        const results: { leadId: string; success: boolean; mock: boolean; error?: string }[] = [];

        for (const leadId of args.leadIds) {
            const lead = await ctx.runQuery(api.leads.get, { id: leadId });
            if (!lead || lead.messageStatus !== "approved" || lead.outreachStatus !== "pending") continue;

            // Check remaining outreach limit
            if (results.length >= limits.outreachRemaining) break;

            const uniDSN = process.env.UNIPILE_DSN;
            const uniKey = process.env.UNIPILE_API_KEY;

            if (user.unipileConnected && user.unipileAccountId && uniDSN && uniKey) {
                // REAL MODE: Call Unipile API to send connection request
                try {
                    const response = await fetch(`https://${uniDSN}/api/v1/users/invite`, {
                        method: "POST",
                        headers: {
                            "X-API-KEY": uniKey,
                            "Content-Type": "application/json",
                            "Accept": "application/json",
                        },
                        body: JSON.stringify({
                            account_id: user.unipileAccountId,
                            provider: "LINKEDIN",
                            recipient_url: lead.linkedInUrl,
                            message: lead.generatedMessage,
                        }),
                    });

                    if (!response.ok) {
                        const errBody = await response.text();
                        console.error(`Unipile API error for ${leadId}:`, response.status, errBody);
                        results.push({ leadId: leadId as string, success: false, mock: false, error: `API error: ${response.status}` });
                        continue;
                    }

                    await ctx.runMutation(api.leads.markAsSent, { id: leadId });
                    results.push({ leadId: leadId as string, success: true, mock: false });
                } catch (err) {
                    console.error(`Unipile request failed for ${leadId}:`, err);
                    results.push({ leadId: leadId as string, success: false, mock: false, error: "Network error" });
                    continue;
                }
            } else {
                // MOCK MODE: Mark as sent (simulates sending when Unipile is not configured)
                await ctx.runMutation(api.leads.markAsSent, { id: leadId });
                results.push({ leadId: leadId as string, success: true, mock: true });
            }
        }

        // Increment usage for successful sends
        const successCount = results.filter(r => r.success).length;
        if (successCount > 0) {
            await ctx.runMutation(api.users.incrementUsage, {
                userId: args.userId,
                field: "outreachSent",
                amount: successCount,
            });
        }

        return { sent: successCount, results };
    },
});
