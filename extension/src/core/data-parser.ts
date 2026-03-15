/**
 * Data Parser
 *
 * Normalizes and cleans extracted lead data from both
 * Voyager API responses and DOM scraping.
 */

import type { ExtractedLead, PostData } from '../shared/types';

/**
 * Parse lead data from a Voyager API search results response.
 */
export function parseVoyagerSearchResults(data: unknown): ExtractedLead[] {
  const leads: ExtractedLead[] = [];

  try {
    const response = data as Record<string, unknown>;
    const elements = (response.included || response.elements || []) as Record<string, unknown>[];

    for (const element of elements) {
      // Skip non-profile elements
      const entityUrn = element.entityUrn as string || '';
      if (!entityUrn.includes('miniProfile') && !entityUrn.includes('salesProfile')) {
        continue;
      }

      const lead = parseVoyagerProfile(element);
      if (lead) {
        leads.push(lead);
      }
    }
  } catch (error) {
    console.warn('[LeadFlow] Failed to parse Voyager search results:', error);
  }

  return leads;
}

/**
 * Parse a single profile from Voyager API response data.
 */
function parseVoyagerProfile(profile: Record<string, unknown>): ExtractedLead | null {
  try {
    const firstName = cleanName(profile.firstName as string || '');
    const lastName = cleanName(profile.lastName as string || '');

    if (!firstName && !lastName) return null;

    // Extract headline/title
    const headline = profile.headline as string || profile.occupation as string || '';

    // Extract company from current position
    let company = '';
    let companyLinkedInUrl: string | undefined;
    const currentPositions = profile.currentPositions as Record<string, unknown>[] | undefined;
    if (currentPositions && currentPositions.length > 0) {
      const position = currentPositions[0];
      company = (position.companyName as string) || '';
      const companyUrn = position.companyUrn as string || '';
      if (companyUrn) {
        const companyId = companyUrn.split(':').pop();
        companyLinkedInUrl = `https://www.linkedin.com/company/${companyId}/`;
      }
    }

    // Extract LinkedIn URL
    const publicIdentifier = profile.publicIdentifier as string || '';
    const linkedInUrl = publicIdentifier
      ? `https://www.linkedin.com/in/${publicIdentifier}/`
      : '';

    // Extract location
    const geoRegion = profile.geoRegion as string
      || ((profile.location as Record<string, any>)?.geo as Record<string, any>)?.full as string
      || '';

    // Connection data
    const connectionDegree = parseConnectionDegree(
      profile.connectionDegree as string || profile.degree as number
    );
    const sharedConnections = profile.sharedConnectionsCount as number
      || profile.numSharedConnections as number
      || undefined;

    // Company data
    const company_data = profile.company as Record<string, unknown> | undefined;
    const companyHeadcount = company_data?.staffCount as number
      || profile.companyStaffCount as number
      || undefined;
    const companyIndustry = company_data?.industryName as string
      || profile.industry as string
      || undefined;

    // Engagement data
    const followers = profile.followersCount as number
      || profile.numFollowers as number
      || undefined;

    const premium = profile.premium as boolean || false;

    // Guess email from name + company domain
    const email = guessEmail(firstName, lastName, companyLinkedInUrl);

    return {
      firstName,
      lastName,
      title: cleanTitle(headline),
      company: cleanCompanyName(company),
      linkedInUrl,
      email,
      location: geoRegion || undefined,
      connectionDegree,
      sharedConnections,
      companyLinkedInUrl,
      companyHeadcount,
      companyIndustry,
      followers,
      inMailAvailable: premium,
      salesNavProfileId: profile.objectUrn as string || profile.entityUrn as string || undefined,
    };
  } catch (error) {
    console.warn('[LeadFlow] Failed to parse Voyager profile:', error);
    return null;
  }
}

/**
 * Parse connection degree from various formats.
 */
function parseConnectionDegree(degree: string | number | undefined): number | undefined {
  if (typeof degree === 'number') return degree;
  if (!degree) return undefined;

  const str = String(degree).toLowerCase();
  if (str.includes('1') || str === 'distance_1') return 1;
  if (str.includes('2') || str === 'distance_2') return 2;
  if (str.includes('3') || str === 'distance_3') return 3;
  return undefined;
}

// ============================================
// NAME CLEANING
// ============================================

/**
 * Clean a person's name — remove emojis, special chars, extra whitespace.
 * Fixes casing (ALL CAPS → Title Case).
 */
export function cleanName(name: string): string {
  if (!name) return '';

  // Remove emojis
  let cleaned = name.replace(
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{FE0F}]/gu,
    ''
  );

  // Remove special characters (keep letters, spaces, hyphens, apostrophes)
  cleaned = cleaned.replace(/[^\p{L}\s'-]/gu, '');

  // Fix casing
  cleaned = fixCasing(cleaned);

  // Collapse whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

/**
 * Fix casing: ALL CAPS → Title Case, all lower → Title Case.
 */
function fixCasing(str: string): string {
  if (!str) return '';

  // If ALL CAPS or all lowercase, convert to Title Case
  if (str === str.toUpperCase() || str === str.toLowerCase()) {
    return str
      .toLowerCase()
      .split(/[\s-]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .replace(/\s-\s/g, '-');
  }

  return str;
}

/**
 * Clean a job title — normalize formatting.
 */
export function cleanTitle(title: string): string {
  if (!title) return '';

  let cleaned = title;

  // Remove company name if duplicated (e.g., "CEO at CompanyX | CompanyX")
  cleaned = cleaned.replace(/\s*\|.*$/, '');

  // Remove "at CompanyName" suffix (we have company separately)
  cleaned = cleaned.replace(/\s+at\s+.*$/i, '');

  // Clean emojis and special chars
  cleaned = cleaned.replace(
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}]/gu,
    ''
  );

  // Fix casing
  cleaned = fixCasing(cleaned);

  return cleaned.trim();
}

/**
 * Clean a company name — remove legal suffixes, fix casing.
 */
export function cleanCompanyName(name: string): string {
  if (!name) return '';

  let cleaned = name;

  // Remove common legal suffixes
  cleaned = cleaned.replace(
    /\s*(Inc\.?|LLC|Ltd\.?|Corp\.?|GmbH|S\.A\.?|B\.V\.?|Pty\.?|PLC)\s*$/i,
    ''
  );

  // Clean emojis
  cleaned = cleaned.replace(
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}]/gu,
    ''
  );

  // Fix casing
  cleaned = fixCasing(cleaned);

  return cleaned.trim();
}

/**
 * Guess a professional email from name and company LinkedIn URL.
 * Uses common B2B email patterns (first.last@domain).
 */
export function guessEmail(
  firstName: string,
  lastName: string,
  companyLinkedInUrl?: string
): string | undefined {
  if (!firstName || !lastName || !companyLinkedInUrl) return undefined;

  // Extract company slug from LinkedIn URL
  const match = companyLinkedInUrl.match(/linkedin\.com\/company\/([^/]+)/);
  if (!match) return undefined;

  const slug = match[1].toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!slug) return undefined;

  // Most common B2B pattern: first.last@company.com
  const first = firstName.toLowerCase().replace(/[^a-z]/g, '');
  const last = lastName.toLowerCase().replace(/[^a-z]/g, '');
  if (!first || !last) return undefined;

  return `${first}.${last}@${slug}.com`;
}

/**
 * Deduplicate leads by LinkedIn URL.
 */
export function deduplicateLeads(leads: ExtractedLead[]): ExtractedLead[] {
  const seen = new Set<string>();
  return leads.filter((lead) => {
    const key = lead.linkedInUrl || `${lead.firstName}-${lead.lastName}-${lead.company}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Merge data from Voyager API and DOM scraping for the same lead.
 * API data takes priority, DOM data fills gaps.
 */
export function mergeLeadData(
  apiLead: Partial<ExtractedLead>,
  domLead: Partial<ExtractedLead>
): ExtractedLead {
  return {
    firstName: apiLead.firstName || domLead.firstName || '',
    lastName: apiLead.lastName || domLead.lastName || '',
    title: apiLead.title || domLead.title || '',
    company: apiLead.company || domLead.company || '',
    linkedInUrl: apiLead.linkedInUrl || domLead.linkedInUrl || '',
    location: apiLead.location || domLead.location,
    companyHeadcount: apiLead.companyHeadcount ?? domLead.companyHeadcount,
    companyIndustry: apiLead.companyIndustry ?? domLead.companyIndustry,
    companyHeadquarters: apiLead.companyHeadquarters ?? domLead.companyHeadquarters,
    companyLinkedInUrl: apiLead.companyLinkedInUrl ?? domLead.companyLinkedInUrl,
    companyType: apiLead.companyType ?? domLead.companyType,
    companyFounded: apiLead.companyFounded ?? domLead.companyFounded,
    companyGrowthRate: apiLead.companyGrowthRate ?? domLead.companyGrowthRate,
    connectionDegree: apiLead.connectionDegree ?? domLead.connectionDegree,
    sharedConnections: apiLead.sharedConnections ?? domLead.sharedConnections,
    sharedGroups: apiLead.sharedGroups ?? domLead.sharedGroups,
    sharedExperiences: apiLead.sharedExperiences ?? domLead.sharedExperiences,
    teamLinkConnections: apiLead.teamLinkConnections ?? domLead.teamLinkConnections,
    inMailAvailable: apiLead.inMailAvailable ?? domLead.inMailAvailable,
    followers: apiLead.followers ?? domLead.followers,
    recentPosts: apiLead.recentPosts ?? domLead.recentPosts,
    lastPostDays: apiLead.lastPostDays ?? domLead.lastPostDays,
    profileViewCount: apiLead.profileViewCount ?? domLead.profileViewCount,
    salesNavProfileId: apiLead.salesNavProfileId ?? domLead.salesNavProfileId,
    savedToList: apiLead.savedToList ?? domLead.savedToList,
  };
}
