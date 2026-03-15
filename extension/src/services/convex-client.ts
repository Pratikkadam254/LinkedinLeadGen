/**
 * Convex Client for Chrome Extension
 *
 * Uses ConvexHttpClient (not the reactive client) because
 * service workers can't maintain WebSocket connections.
 * Authenticated via Clerk JWT stored in chrome.storage.
 */

import { ConvexHttpClient } from 'convex/browser';
import type { ExtractedLead, CreditBalance } from '../shared/types';
import { getUserSession } from './storage';

let client: ConvexHttpClient | null = null;

/**
 * Initialize the Convex client with the deployment URL.
 */
export function initConvexClient(url: string): void {
  client = new ConvexHttpClient(url);
}

/**
 * Retry wrapper with exponential backoff.
 * Retries up to 3 times with 1s, 2s, 4s delays.
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
      }
    }
  }
  throw lastError;
}

/**
 * Get the authenticated Convex client.
 * Sets the auth token from the stored Clerk session.
 */
async function getAuthenticatedClient(): Promise<ConvexHttpClient> {
  if (!client) {
    throw new Error('Convex client not initialized. Call initConvexClient first.');
  }

  const session = await getUserSession();
  if (!session?.clerkToken) {
    throw new Error('Not authenticated. Please log in via the extension popup.');
  }

  client.setAuth(session.clerkToken);
  return client;
}

/**
 * Check the user's credit balance.
 */
export async function checkCredits(): Promise<CreditBalance> {
  const c = await getAuthenticatedClient();
  // This calls the Convex query: api.credits.getBalance
  const result = await c.query('credits:getBalance' as never);
  return result as CreditBalance;
}

/**
 * Import extracted leads into Convex.
 * Handles batching, credit deduction, and enrichment data.
 */
export async function importLeads(
  leads: ExtractedLead[],
  extractionId: string
): Promise<{ imported: number; creditsUsed: number }> {
  const c = await getAuthenticatedClient();

  // Call the Convex mutation with retry: api.extensions.importFromExtension
  const result = await withRetry(() => c.mutation('extensions:importFromExtension' as never, {
    leads: leads.map((lead) => ({
      firstName: lead.firstName,
      lastName: lead.lastName,
      title: lead.title,
      company: lead.company,
      linkedInUrl: lead.linkedInUrl,
      email: lead.email,
      location: lead.location,
      // Enrichment data
      companyHeadcount: lead.companyHeadcount,
      companyIndustry: lead.companyIndustry,
      companyHeadquarters: lead.companyHeadquarters,
      companyLinkedInUrl: lead.companyLinkedInUrl,
      companyType: lead.companyType,
      companyFounded: lead.companyFounded,
      companyGrowthRate: lead.companyGrowthRate,
      connectionDegree: lead.connectionDegree,
      sharedConnections: lead.sharedConnections,
      sharedGroups: lead.sharedGroups,
      sharedExperiences: lead.sharedExperiences,
      teamLinkConnections: lead.teamLinkConnections,
      inMailAvailable: lead.inMailAvailable,
      followers: lead.followers,
      recentPosts: lead.recentPosts,
      lastPostDays: lead.lastPostDays,
      profileViewCount: lead.profileViewCount,
      salesNavProfileId: lead.salesNavProfileId,
      filterMatch: lead.filterMatch,
      filterMismatchReasons: lead.filterMismatchReasons,
    })),
    extractionId,
  } as never));

  return result as { imported: number; creditsUsed: number };
}

/**
 * Create an extraction record in Convex.
 */
export async function createExtraction(
  searchUrl: string,
  searchFilters?: Record<string, unknown>
): Promise<string> {
  const c = await getAuthenticatedClient();
  const result = await c.mutation('extensions:createExtraction' as never, {
    searchUrl,
    searchFilters,
  } as never);
  return result as string;
}

/**
 * Update extraction progress.
 */
export async function updateExtractionProgress(
  extractionId: string,
  leadsExtracted: number,
  status: string
): Promise<void> {
  const c = await getAuthenticatedClient();
  await c.mutation('extensions:updateExtractionProgress' as never, {
    extractionId,
    leadsExtracted,
    status,
  } as never);
}

/**
 * Complete an extraction.
 */
export async function completeExtraction(
  extractionId: string,
  totalLeads: number,
  creditsUsed: number
): Promise<void> {
  const c = await getAuthenticatedClient();
  await c.mutation('extensions:completeExtraction' as never, {
    extractionId,
    totalLeads,
    creditsUsed,
  } as never);
}
