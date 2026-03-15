import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { GoogleGenerativeAI } from "@google/generative-ai";

declare const process: { env: { GEMINI_API_KEY: string } };

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const processBatch = internalAction({
    args: {},
    handler: async (ctx) => {
        // Get active autopilot campaigns (internal query)
        const activeCampaigns = await ctx.runQuery(
            internal.campaigns.getActiveAutopilotCampaigns
        );

        if (!activeCampaigns || activeCampaigns.length === 0) return;

        for (const campaign of activeCampaigns) {
            // Get strategy for this campaign (internal query)
            const strategy = await ctx.runQuery(internal.strategies.getStrategy, {
                strategyId: campaign.strategyId,
            });
            if (!strategy) continue;

            // Get pending leads for this campaign (internal query)
            const pendingLeads = await ctx.runQuery(
                internal.leads.getPendingLeadsForCampaign,
                { campaignId: campaign._id, limit: 5 }
            );

            for (const lead of pendingLeads) {
                const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
                const prompt = `
             Write a LinkedIn connection message (max 300 chars).

             Context:
             - My Offer: ${strategy.offerDocument}
             - Prospect: ${lead.firstName} ${lead.lastName}, ${lead.title} at ${lead.company}

             Keep it direct and focused on the value proposition.
           `;

                try {
                    const result = await model.generateContent(prompt);
                    const message = result.response.text();

                    // Update lead with generated message (internal mutation)
                    await ctx.runMutation(internal.leads.updateGeneratedMessage, {
                        leadId: lead._id,
                        message,
                        status: "draft" as const,
                    });
                } catch (e) {
                    console.error(`Failed to generate message for lead ${lead._id}`, e);
                }
            }
        }
    },
});
