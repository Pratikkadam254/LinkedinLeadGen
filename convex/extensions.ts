import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Import leads from the Chrome extension.
 * Handles batch insertion, deduplication, enrichment, and credit deduction.
 */
export const importFromExtension = mutation({
    args: {
        leads: v.array(v.object({
            firstName: v.string(),
            lastName: v.string(),
            title: v.string(),
            company: v.string(),
            linkedInUrl: v.string(),
            email: v.optional(v.string()),
            location: v.optional(v.string()),
            // Enrichment data
            companyHeadcount: v.optional(v.number()),
            companyIndustry: v.optional(v.string()),
            companyHeadquarters: v.optional(v.string()),
            companyLinkedInUrl: v.optional(v.string()),
            companyType: v.optional(v.string()),
            companyFounded: v.optional(v.number()),
            companyGrowthRate: v.optional(v.number()),
            connectionDegree: v.optional(v.number()),
            sharedConnections: v.optional(v.number()),
            sharedGroups: v.optional(v.array(v.string())),
            sharedExperiences: v.optional(v.array(v.string())),
            teamLinkConnections: v.optional(v.number()),
            inMailAvailable: v.optional(v.boolean()),
            followers: v.optional(v.number()),
            recentPosts: v.optional(v.array(v.object({
                content: v.string(),
                likes: v.number(),
                comments: v.number(),
                postedAt: v.number(),
            }))),
            lastPostDays: v.optional(v.number()),
            profileViewCount: v.optional(v.number()),
            salesNavProfileId: v.optional(v.string()),
            filterMatch: v.optional(v.boolean()),
            filterMismatchReasons: v.optional(v.array(v.string())),
        })),
        extractionId: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        // Find user
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .first();
        if (!user) throw new Error("User not found");

        // Validate extraction belongs to user
        if (args.extractionId) {
            const extraction = await ctx.db
                .query("extractions")
                .filter((q) => q.eq(q.field("_id"), args.extractionId as any))
                .first();
            if (extraction && extraction.userId !== user._id) {
                throw new Error("Unauthorized: extraction belongs to another user");
            }
        }

        // Check credits
        const creditRecord = await ctx.db
            .query("credits")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .first();

        const availableCredits = creditRecord ? creditRecord.balance : 0;
        if (availableCredits <= 0) {
            throw new Error("Insufficient credits");
        }
        // Only process leads we can afford
        const leadsToProcess = args.leads.slice(0, availableCredits);

        const now = Date.now();
        let imported = 0;

        for (const lead of leadsToProcess) {
            // Deduplication: check if lead with same LinkedIn URL exists
            if (lead.linkedInUrl) {
                const existing = await ctx.db
                    .query("leads")
                    .withIndex("by_linkedin_url", (q) => q.eq("linkedInUrl", lead.linkedInUrl))
                    .first();
                if (existing) continue; // Skip duplicate
            }

            // Insert lead
            const leadId = await ctx.db.insert("leads", {
                userId: user._id,
                firstName: lead.firstName,
                lastName: lead.lastName,
                company: lead.company,
                title: lead.title,
                linkedInUrl: lead.linkedInUrl,
                email: lead.email,
                filterMatch: lead.filterMatch,
                filterMismatchReasons: lead.filterMismatchReasons,
                score: 0, // Will be scored in enrichment pipeline
                scoreTier: "cold" as const,
                companySize: lead.companyHeadcount,
                followers: lead.followers,
                lastPostDays: lead.lastPostDays,
                mutualConnections: lead.sharedConnections,
                postScraped: false,
                messageStatus: "empty" as const,
                outreachStatus: "pending" as const,
                bookingStatus: "not_booked" as const,
                potentialValue: 0,
                source: "sales_navigator",
                importedAt: now,
                createdAt: now,
                updatedAt: now,
            });

            // Insert enrichment data
            const hasEnrichment = lead.companyHeadcount || lead.connectionDegree ||
                lead.companyIndustry || lead.sharedGroups || lead.recentPosts;

            if (hasEnrichment) {
                await ctx.db.insert("leadEnrichments", {
                    leadId,
                    companyHeadcount: lead.companyHeadcount,
                    companyGrowthRate: lead.companyGrowthRate,
                    companyIndustry: lead.companyIndustry,
                    companyHeadquarters: lead.companyHeadquarters,
                    companyFounded: lead.companyFounded,
                    companyType: lead.companyType,
                    companyLinkedInUrl: lead.companyLinkedInUrl,
                    connectionDegree: lead.connectionDegree,
                    sharedConnections: lead.sharedConnections,
                    sharedGroups: lead.sharedGroups,
                    sharedExperiences: lead.sharedExperiences,
                    teamLinkConnections: lead.teamLinkConnections,
                    inMailAvailable: lead.inMailAvailable,
                    recentPosts: lead.recentPosts,
                    profileViewCount: lead.profileViewCount,
                    salesNavProfileId: lead.salesNavProfileId,
                    extractedAt: now,
                    updatedAt: now,
                });
            }

            // Log activity
            await ctx.db.insert("activities", {
                userId: user._id,
                leadId,
                type: "lead_imported" as const,
                metadata: { source: "sales_navigator", extractionId: args.extractionId },
                createdAt: now,
            });

            imported++;
        }

        // Deduct credits
        if (imported > 0 && creditRecord) {
            await ctx.db.patch(creditRecord._id, {
                balance: creditRecord.balance - imported,
                updatedAt: now,
            });

            // Log credit transaction
            await ctx.db.insert("creditTransactions", {
                userId: user._id,
                amount: -imported,
                type: "extraction" as const,
                description: `Extracted ${imported} leads from Sales Navigator`,
                createdAt: now,
            });
        }

        return { imported, creditsUsed: imported, skipped: args.leads.length - leadsToProcess.length };
    },
});

/**
 * Create an extraction record.
 */
export const createExtraction = mutation({
    args: {
        searchUrl: v.string(),
        searchFilters: v.optional(v.any()),
        name: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .first();
        if (!user) throw new Error("User not found");

        const now = Date.now();
        const extractionId = await ctx.db.insert("extractions", {
            userId: user._id,
            searchUrl: args.searchUrl,
            searchFilters: args.searchFilters,
            name: args.name,
            status: "in_progress",
            leadsFound: 0,
            leadsExtracted: 0,
            creditsUsed: 0,
            startedAt: now,
        });

        return extractionId;
    },
});

/**
 * Update extraction progress.
 */
export const updateExtractionProgress = mutation({
    args: {
        extractionId: v.id("extractions"),
        leadsExtracted: v.number(),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.extractionId, {
            leadsExtracted: args.leadsExtracted,
            status: args.status as "in_progress" | "completed" | "paused" | "failed" | "cancelled",
        });
    },
});

/**
 * Complete an extraction.
 */
export const completeExtraction = mutation({
    args: {
        extractionId: v.id("extractions"),
        totalLeads: v.number(),
        creditsUsed: v.number(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.extractionId, {
            status: "completed" as const,
            leadsExtracted: args.totalLeads,
            creditsUsed: args.creditsUsed,
            completedAt: Date.now(),
        });
    },
});

/**
 * Get extraction history for the current user.
 */
export const getExtractions = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .first();
        if (!user) return [];

        return ctx.db
            .query("extractions")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .order("desc")
            .take(50);
    },
});

/**
 * Internal mutation: clean up stale extractions that have been in_progress for over 24 hours.
 */
export const cleanupStaleExtractions = internalMutation({
    handler: async (ctx) => {
        const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
        const stale = await ctx.db
            .query("extractions")
            .withIndex("by_status", (q) => q.eq("status", "in_progress"))
            .filter((q) => q.lt(q.field("startedAt"), twentyFourHoursAgo))
            .collect();

        for (const extraction of stale) {
            await ctx.db.patch(extraction._id, {
                status: "failed" as const,
                errorMessage: "Extraction timed out after 24 hours",
                completedAt: Date.now(),
            });
        }
    },
});
