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

        const results: { leadId: string; success: boolean; mock: boolean }[] = [];

        for (const leadId of args.leadIds) {
            const lead = await ctx.runQuery(api.leads.get, { id: leadId });
            if (!lead || lead.messageStatus !== "approved" || lead.outreachStatus !== "pending") continue;

            // Check remaining outreach limit
            if (results.length >= limits.outreachRemaining) break;

            if (user.unipileConnected && user.unipileAccountId) {
                // REAL MODE: Call Unipile API to send connection request
                // TODO: Implement when Unipile API key is available
                // const response = await fetch(`https://api.unipile.com/api/v1/users/me/invite`, {
                //     method: "POST",
                //     headers: {
                //         "Authorization": `Bearer ${process.env.UNIPILE_API_KEY}`,
                //         "Content-Type": "application/json",
                //     },
                //     body: JSON.stringify({
                //         account_id: user.unipileAccountId,
                //         provider: "LINKEDIN",
                //         recipient_url: lead.linkedInUrl,
                //         message: lead.generatedMessage,
                //     }),
                // });
            }

            // MOCK MODE: Mark as sent (simulates sending)
            await ctx.runMutation(api.leads.markAsSent, { id: leadId });
            results.push({ leadId: leadId as string, success: true, mock: !user.unipileConnected });
        }

        // Increment usage
        if (results.length > 0) {
            await ctx.runMutation(api.users.incrementUsage, {
                userId: args.userId,
                field: "outreachSent",
                amount: results.length,
            });
        }

        return { sent: results.length, results };
    },
});
