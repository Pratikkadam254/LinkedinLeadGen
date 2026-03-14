import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

// Hook to get or create user
export function useUser(clerkId: string | undefined) {
    return useQuery(
        api.users.getByClerkId,
        clerkId ? { clerkId } : "skip"
    );
}

// Hook for user mutations
export function useUserMutations() {
    const upsertUser = useMutation(api.users.upsert);
    const updatePreferences = useMutation(api.users.updatePreferences);
    const completeOnboarding = useMutation(api.users.completeOnboarding);
    const updateUnipileConnection = useMutation(api.users.updateUnipileConnection);

    return {
        upsertUser,
        updatePreferences,
        completeOnboarding,
        updateUnipileConnection,
    };
}
