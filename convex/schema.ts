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

        // Subscription / billing
        plan: v.optional(v.union(v.literal("free"), v.literal("pro"), v.literal("elite"))),
        stripeCustomerId: v.optional(v.string()),
        stripeSubscriptionId: v.optional(v.string()),
        subscriptionStatus: v.optional(v.union(
            v.literal("active"),
            v.literal("past_due"),
            v.literal("canceled"),
            v.literal("trialing")
        )),
        planLimits: v.optional(v.object({
            leadsPerMonth: v.number(),
            outreachPerMonth: v.number(),
            linkedInAccounts: v.number(),
        })),
        currentMonthUsage: v.optional(v.object({
            leadsUploaded: v.number(),
            outreachSent: v.number(),
            resetAt: v.number(),
        })),

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
            v.literal("approved"),
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

        // Campaign & Outcome
        campaignId: v.optional(v.id("campaigns")),
        bookingStatus: v.union(
            v.literal("not_booked"),
            v.literal("booked"),
            v.literal("cancelled")
        ),
        potentialValue: v.number(),          // Estimated revenue
        lastInteractionAt: v.optional(v.number()),

        // Metadata
        source: v.optional(v.string()), // csv, google_sheets, manual
        importedAt: v.number(),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_user_and_status", ["userId", "outreachStatus"])
        .index("by_user_and_score", ["userId", "score"])
        .index("by_campaign", ["campaignId"])
        .index("by_linkedin_url", ["linkedInUrl"]),

    // Activity log - tracks all actions
    activities: defineTable({
        userId: v.id("users"),
        leadId: v.optional(v.id("leads")),
        campaignId: v.optional(v.id("campaigns")),

        type: v.union(
            v.literal("lead_imported"),
            v.literal("lead_scored"),
            v.literal("message_generated"),
            v.literal("message_approved"),
            v.literal("connection_sent"),
            v.literal("connection_accepted"),
            v.literal("message_replied"),
            v.literal("strategy_created"),
            v.literal("campaign_created"),
            v.literal("lead_booked")
        ),

        metadata: v.optional(v.any()),

        createdAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_lead", ["leadId"])
        .index("by_user_and_type", ["userId", "type"]),

    // Strategies table (The "Brain")
    strategies: defineTable({
        userId: v.id("users"),
        name: v.string(), // e.g. "Q1 Marketing Agency Push"

        // User's unrefined answers
        rawInputs: v.object({
            businessDescription: v.string(),
            targetAudienceHints: v.string(),
            primaryOffer: v.string(),
        }),

        // AI Generated Assets
        icpDocument: v.string(),
        offerDocument: v.string(),

        isActive: v.boolean(),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_user_active", ["userId", "isActive"]),

    // Campaigns table (The "Engine")
    campaigns: defineTable({
        userId: v.id("users"),
        strategyId: v.id("strategies"),
        name: v.string(),

        status: v.union(v.literal("active"), v.literal("paused"), v.literal("completed")),
        autoPilot: v.boolean(),

        // Schedule settings
        schedule: v.object({
            timezone: v.string(),
            days: v.array(v.string()), // ["Mon", "Tue", ...]
            hours: v.object({
                start: v.string(), // "09:00"
                end: v.string(),   // "17:00"
            }),
        }),

        // Aggregated Stats
        stats: v.object({
            sent: v.number(),
            replied: v.number(),
            booked: v.number(),
            revenue: v.number(),
        }),

        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_strategy", ["strategyId"])
        .index("by_status", ["status"]),
});
