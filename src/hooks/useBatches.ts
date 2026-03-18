import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

export function useBatches(userId: Id<"users"> | undefined) {
  const batches = useQuery(
    api.batches.getByUser,
    userId ? { userId } : "skip"
  );
  const activeBatch = useQuery(
    api.batches.getActiveBatch,
    userId ? { userId } : "skip"
  );
  return { batches: batches ?? [], activeBatch: activeBatch ?? null };
}
