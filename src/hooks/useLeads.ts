import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

// Hook to get all leads for current user
export function useLeads(userId: Id<"users"> | undefined) {
    return useQuery(
        api.leads.listByUser,
        userId ? { userId } : "skip"
    );
}

// Hook to get leads by status
export function useLeadsByStatus(
    userId: Id<"users"> | undefined,
    status: "pending" | "sent" | "accepted" | "replied"
) {
    return useQuery(
        api.leads.listByStatus,
        userId ? { userId, status } : "skip"
    );
}

// Hook to get single lead
export function useLead(leadId: Id<"leads"> | undefined) {
    return useQuery(
        api.leads.get,
        leadId ? { id: leadId } : "skip"
    );
}

// Hook to get leads stats
export function useLeadsStats(userId: Id<"users"> | undefined) {
    return useQuery(
        api.leads.getStats,
        userId ? { userId } : "skip"
    );
}

// Hook to get leads by message status
export function useLeadsByMessageStatus(
    userId: Id<"users"> | undefined,
    messageStatus: "empty" | "draft" | "approved" | "ready" | "sent"
) {
    return useQuery(
        api.leads.listByMessageStatus,
        userId ? { userId, messageStatus } : "skip"
    );
}

// Hook for lead mutations
export function useLeadMutations() {
    const createLead = useMutation(api.leads.create);
    const bulkCreateLeads = useMutation(api.leads.bulkCreate);
    const updateScore = useMutation(api.leads.updateScore);
    const updateMessage = useMutation(api.leads.updateMessage);
    const approveMessage = useMutation(api.leads.approveMessage);
    const markAsSent = useMutation(api.leads.markAsSent);
    const updateOutreachStatus = useMutation(api.leads.updateOutreachStatus);
    const removeLead = useMutation(api.leads.remove);
    const bulkRemoveLeads = useMutation(api.leads.bulkRemove);
    const bulkApprove = useMutation(api.leads.bulkApprove);

    return {
        createLead,
        bulkCreateLeads,
        updateScore,
        updateMessage,
        approveMessage,
        markAsSent,
        updateOutreachStatus,
        removeLead,
        bulkRemoveLeads,
        bulkApprove,
    };
}
