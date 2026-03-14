import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";

// Tone instructions for message generation
const TONE_INSTRUCTIONS: Record<string, string> = {
    professional: "Write in a professional, business-oriented tone. Be polite, direct, and focused on mutual value.",
    friendly: "Write in a warm, friendly tone. Be approachable and genuine. Show authentic interest.",
    casual: "Write in a casual, relaxed tone. Be natural and personable. Keep it light but genuine.",
    bold: "Write in a confident, bold tone. Be direct about the value you bring. Stand out from generic messages.",
};

function buildPrompt(
    lead: { firstName: string; lastName: string; company: string; title: string; postContent?: string; mutualConnections?: number },
    user: { firstName?: string; lastName?: string; preferences?: { targetIndustries?: string[]; targetTitles?: string[]; targetCompanySize?: string; messageTone?: string } | null },
    tone: string
): string {
    const parts: string[] = [];

    parts.push("You are an expert at writing highly personalized LinkedIn connection request messages that get accepted.");
    parts.push(`\nTONE: ${TONE_INSTRUCTIONS[tone] || TONE_INSTRUCTIONS.professional}`);

    parts.push("\nRECIPIENT INFORMATION:");
    parts.push(`- Name: ${lead.firstName} ${lead.lastName}`);
    parts.push(`- Title: ${lead.title}`);
    parts.push(`- Company: ${lead.company}`);
    if (lead.postContent) {
        parts.push(`- Recent LinkedIn Post: "${lead.postContent.substring(0, 200)}"`);
    }
    if (lead.mutualConnections && lead.mutualConnections > 0) {
        parts.push(`- Mutual Connections: ${lead.mutualConnections}`);
    }

    parts.push("\nSENDER INFORMATION:");
    if (user.firstName) parts.push(`- Name: ${user.firstName}${user.lastName ? " " + user.lastName : ""}`);

    // ICP context for better personalization
    if (user.preferences) {
        if (user.preferences.targetIndustries?.length) {
            parts.push(`- Target Industries: ${user.preferences.targetIndustries.join(", ")}`);
        }
        if (user.preferences.targetTitles?.length) {
            parts.push(`- Looking to connect with: ${user.preferences.targetTitles.join(", ")}`);
        }
    }

    parts.push("\nRULES:");
    parts.push("1. Maximum 280 characters (STRICT - LinkedIn limit is 300).");
    parts.push('2. DO NOT use generic openings like "I came across your profile" or "I noticed you work at".');
    parts.push("3. Be specific and reference something unique about the recipient.");
    parts.push("4. Include a genuine, specific compliment about their work or company.");
    parts.push("5. End with a soft, engaging question that invites a response.");
    parts.push('6. NO hashtags, NO emojis, NO "let\'s connect" cliches.');
    parts.push("7. Sound like a real human, not a sales bot.");
    parts.push("8. Output ONLY the message text. No explanations, no options, no quotation marks.");

    return parts.join("\n");
}

export const generateForLeads = action({
    args: {
        userId: v.id("users"),
        leadIds: v.array(v.id("leads")),
        tone: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(api.users.getById, { id: args.userId });
        if (!user) throw new Error("User not found");

        const tone = args.tone || user.preferences?.messageTone || "professional";
        const results: { leadId: string; message: string; success: boolean }[] = [];

        for (const leadId of args.leadIds) {
            const lead = await ctx.runQuery(api.leads.get, { id: leadId });
            if (!lead) continue;

            const prompt = buildPrompt(
                {
                    firstName: lead.firstName,
                    lastName: lead.lastName,
                    company: lead.company,
                    title: lead.title,
                    postContent: lead.postContent,
                    mutualConnections: lead.mutualConnections,
                },
                user,
                tone
            );

            try {
                const response = await fetch("https://api.anthropic.com/v1/messages", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-api-key": process.env.ANTHROPIC_API_KEY!,
                        "anthropic-version": "2023-06-01",
                    },
                    body: JSON.stringify({
                        model: "claude-sonnet-4-20250514",
                        max_tokens: 200,
                        messages: [{ role: "user", content: prompt }],
                    }),
                });

                if (!response.ok) {
                    throw new Error(`Claude API error: ${response.status}`);
                }

                const data = await response.json();
                let message = data.content[0].text.trim().replace(/^["']|["']$/g, "");

                // Enforce LinkedIn character limit
                if (message.length > 300) {
                    message = message.substring(0, 297) + "...";
                }

                await ctx.runMutation(api.leads.updateMessage, {
                    id: leadId,
                    message,
                    tone,
                    status: "draft",
                });

                results.push({ leadId: leadId as string, message, success: true });
            } catch (error) {
                console.error(`Failed to generate message for lead ${leadId}:`, error);
                // Use fallback template
                const fallback = `Hi ${lead.firstName}, your work as ${lead.title} at ${lead.company} caught my attention. I'd love to connect and exchange ideas on the space.`;
                await ctx.runMutation(api.leads.updateMessage, {
                    id: leadId,
                    message: fallback,
                    tone,
                    status: "draft",
                });
                results.push({ leadId: leadId as string, message: fallback, success: true });
            }
        }

        return results;
    },
});
