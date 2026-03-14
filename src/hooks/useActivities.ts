import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

// Hook to get recent activities
export function useActivities(userId: Id<"users"> | undefined, limit?: number) {
    return useQuery(
        api.activities.listRecent,
        userId ? { userId, limit } : "skip"
    );
}

// Hook to get activities for a lead
export function useLeadActivities(leadId: Id<"leads"> | undefined) {
    return useQuery(
        api.activities.listByLead,
        leadId ? { leadId } : "skip"
    );
}

// Hook to get activity summary
export function useActivitySummary(userId: Id<"users"> | undefined, days?: number) {
    return useQuery(
        api.activities.getSummary,
        userId ? { userId, days } : "skip"
    );
}
