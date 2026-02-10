import { useEffect, useState } from 'react';
import { useUser as useClerkUser } from '@clerk/clerk-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface SyncedUser {
    clerkId: string;
    convexId: Id<"users"> | null;
    email: string;
    firstName: string | undefined;
    lastName: string | undefined;
    imageUrl: string | undefined;
    isLoaded: boolean;
    isSignedIn: boolean;
    onboardingCompleted: boolean;
    unipileConnected: boolean;
}

/**
 * Hook that syncs Clerk user with Convex database
 * Automatically creates/updates user in Convex when signed in
 */
export function useSyncedUser(): SyncedUser {
    const { user: clerkUser, isLoaded: clerkLoaded, isSignedIn } = useClerkUser();
    const [synced, setSynced] = useState(false);

    // Get Convex user
    const convexUser = useQuery(
        api.users.getByClerkId,
        clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
    );

    // Mutation to upsert user
    const upsertUser = useMutation(api.users.upsert);

    // Sync Clerk user to Convex on sign in
    useEffect(() => {
        if (!clerkLoaded || !isSignedIn || !clerkUser || synced) return;

        const syncUser = async () => {
            try {
                await upsertUser({
                    clerkId: clerkUser.id,
                    email: clerkUser.primaryEmailAddress?.emailAddress || '',
                    firstName: clerkUser.firstName || undefined,
                    lastName: clerkUser.lastName || undefined,
                    imageUrl: clerkUser.imageUrl || undefined,
                });
                setSynced(true);
            } catch (error) {
                console.error('[useSyncedUser] Failed to sync user:', error);
            }
        };

        syncUser();
    }, [clerkLoaded, isSignedIn, clerkUser, synced, upsertUser]);

    return {
        clerkId: clerkUser?.id || '',
        convexId: convexUser?._id || null,
        email: clerkUser?.primaryEmailAddress?.emailAddress || '',
        firstName: clerkUser?.firstName || undefined,
        lastName: clerkUser?.lastName || undefined,
        imageUrl: clerkUser?.imageUrl || undefined,
        isLoaded: clerkLoaded && (convexUser !== undefined || !isSignedIn),
        isSignedIn: !!isSignedIn,
        onboardingCompleted: convexUser?.onboardingCompleted || false,
        unipileConnected: convexUser?.unipileConnected || false,
    };
}

/**
 * Hook to get just the Convex user ID (for queries)
 */
export function useConvexUserId(): Id<"users"> | undefined {
    const { convexId } = useSyncedUser();
    return convexId || undefined;
}
