import { action } from "../_generated/server";
import { v } from "convex/values";
// @ts-ignore - GoogleGenerativeAI types
import { GoogleGenerativeAI } from "@google/generative-ai";

declare const process: { env: { GEMINI_API_KEY: string } };

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const generateICP = action({
    args: {
        businessDescription: v.string(),
        targetAudienceHints: v.string(),
    },
    handler: async (_ctx, args) => {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
      You are an expert B2B Marketing Strategist.

      Create a detailed IDEAL CUSTOMER PROFILE (ICP) based on the following:
      - Business: ${args.businessDescription}
      - Target Hints: ${args.targetAudienceHints}

      Structure the response as a markdown document with:
      1. Job Titles & Roles
      2. Company Size & Industry
      3. Key Pain Points (Emotional & Logical)
      4. Goals & Desires
      5. Objections to buying

      Keep it actionable and specific.
    `;

        const result = await model.generateContent(prompt);
        return result.response.text();
    },
});

export const generateOffer = action({
    args: {
        businessDescription: v.string(),
        icpDocument: v.string(),
        primaryOffer: v.string(),
    },
    handler: async (_ctx, args) => {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
      You are an expert Direct Response Copywriter (Alex Hormozi style).

      Refine this offer into a "Grand Slam Offer" based on the ICP.

      Business: ${args.businessDescription}
      Primary Offer: ${args.primaryOffer}
      ICP Summary: ${args.icpDocument.substring(0, 500)}...

      Output a markdown document with:
      1. The Core Transformation (From X to Y)
      2. The "Grand Slam" Headline (e.g. "We get you 30 calls in 30 days or you don't pay")
      3. Risk Reversal / Guarantees
      4. Bonuses / Sweeteners
      
      Make it irresistible.
    `;

        const result = await model.generateContent(prompt);
        return result.response.text();
    },
});
