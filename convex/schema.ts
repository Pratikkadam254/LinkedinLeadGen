import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // Users table - stores user preferences and settings
    users: defineTable({
        clerkId: v.string(),
        email: v.string(),
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
        imageUrl: v.optional(v.string()),

        // Onboarding preferences
        preferences: v.optional(v.object({
            primaryGoal: v.optional(v.string()),
            targetIndustries: v.optional(v.array(v.string())),
            targetCompanySize: v.optional(v.string()),
            targetTitles: v.optional(v.array(v.string())),
            weeklyVolume: v.optional(v.string()),
            messageTone: v.optional(v.string()),
        })),

        // Onboarding status
        onboardingCompleted: v.boolean(),

        // Unipile connection
        unipileConnected: v.boolean(),
        unipileAccountId: v.optional(v.string()),

        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_clerk_id", ["clerkId"])
        .index("by_email", ["email"]),

    // Leads table - stores imported leads
    leads: defineTable({
        userId: v.id("users"),

        // Basic info
        firstName: v.string(),
        lastName: v.string(),
        company: v.string(),
        title: v.string(),
        linkedInUrl: v.string(),
        email: v.optional(v.string()),

        // Scoring data
        score: v.number(),
        scoreTier: v.union(v.literal("hot"), v.literal("warm"), v.literal("cold")),
        scoreBreakdown: v.optional(v.object({
            companySize: v.number(),
            followerInfluence: v.number(),
            recentActivity: v.number(),
            eventKeywords: v.number(),
            mutualConnections: v.number(),
            titleMatch: v.number(),
        })),

        // Enrichment data
        companySize: v.optional(v.number()),
        followers: v.optional(v.number()),
        lastPostDays: v.optional(v.number()),
        postContent: v.optional(v.string()),
        mutualConnections: v.optional(v.number()),
        postScraped: v.boolean(),

        // Message status
        messageStatus: v.union(
            v.literal("empty"),
            v.literal("draft"),
            v.literal("ready"),
            v.literal("sent")
        ),
        generatedMessage: v.optional(v.string()),
        messageTone: v.optional(v.string()),

        // Outreach status
        outreachStatus: v.union(
            v.literal("pending"),
            v.literal("sent"),
            v.literal("accepted"),
            v.literal("replied")
        ),
        outreachSentAt: v.optional(v.number()),
        outreachRespondedAt: v.optional(v.number()),

        // Metadata
        source: v.optional(v.string()), // csv, google_sheets, manual
        importedAt: v.number(),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_user_and_status", ["userId", "outreachStatus"])
        .index("by_user_and_score", ["userId", "score"])
        .index("by_linkedin_url", ["linkedInUrl"]),

    // Activity log - tracks all actions
    activities: defineTable({
        userId: v.id("users"),
        leadId: v.optional(v.id("leads")),

        type: v.union(
            v.literal("lead_imported"),
            v.literal("lead_scored"),
            v.literal("message_generated"),
            v.literal("message_approved"),
            v.literal("connection_sent"),
            v.literal("connection_accepted"),
            v.literal("message_replied")
        ),

        metadata: v.optional(v.any()),

        createdAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_lead", ["leadId"])
        .index("by_user_and_type", ["userId", "type"]),
});
