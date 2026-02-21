import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import { internal, api } from "../_generated/api";
import { GoogleGenerativeAI } from "@google/generative-ai";

declare const process: { env: { GEMINI_API_KEY: string } };

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const processBatch = internalAction({
    args: {},
    handler: async (ctx) => {
        // 1. Get active campaigns with autopilot on
        const campaigns = await ctx.runQuery(api.campaigns.list); // This gets ALL, filter effectively
        // Ideally we'd have a specific query for active auto-pilot campaigns relative to current time
        // For MVP, we'll fetch and filter

        // Actually, we can't call public query from internal action easily with auth context.
        // We should use an internalQuery.
        const activeCampaigns = await ctx.runQuery(internal.queries.campaigns.getActiveAutopilotCampaigns);

        if (!activeCampaigns || activeCampaigns.length === 0) return;

        for (const campaign of activeCampaigns) {
            // Check schedule (simplified: assume 9-5 M-F match for now or just run)
            // 2. Find eligible leads for this campaign
            const leads = await ctx.runQuery(internal.queries.leads.getPendingLeadsForCampaign, {
                campaignId: campaign._id,
                limit: 5
            });

            for (const lead of leads) {
                // 3. Generate message
                const strategy = await ctx.runQuery(internal.queries.strategies.getStrategy, { strategyId: campaign.strategyId });

                if (!strategy) continue;

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

                    // 4. Update lead
                    await ctx.runMutation(internal.mutations.leads.updateGeneratedMessage, {
                        leadId: lead._id,
                        message: message,
                        status: "draft" // Or 'ready' if fully autonomous
                    });
                } catch (e) {
                    console.error(`Failed to generate message for lead ${lead._id}`, e);
                }
            }
        }
    },
});
