/**
 * Filter Match Validator
 *
 * Compares each extracted lead against the original Sales Navigator
 * search filters and marks them as MATCH or NO_MATCH with reasons.
 *
 * Evaboot reports 20-30% of SN results don't match the original filters.
 * This module replicates that quality assurance layer.
 */

import type { ExtractedLead } from '../shared/types';

// ============================================
// TYPES
// ============================================

export interface SearchFilters {
  titles?: string[];
  seniorityLevels?: string[];
  companyHeadcount?: HeadcountRange[];
  industries?: string[];
  geographies?: string[];
  companyNames?: string[];
  keywords?: string[];
}

export interface HeadcountRange {
  min: number;
  max: number;
  label: string; // e.g., "11-50", "51-200"
}

export interface FilterMismatch {
  field: string;
  filter: string;
  actual: string;
  reason: string;
}

export interface FilterMatchResult {
  isMatch: boolean;
  confidence: number;
  mismatches: FilterMismatch[];
}

// ============================================
// SENIORITY MAPPING
// ============================================

const SENIORITY_MAP: Record<string, string[]> = {
  'Owner': ['owner', 'founder', 'co-founder', 'cofounder', 'proprietor'],
  'Partner': ['partner', 'principal', 'managing partner'],
  'CXO': ['ceo', 'cto', 'cfo', 'coo', 'cmo', 'cio', 'cso', 'cpo', 'chief'],
  'VP': ['vp', 'vice president', 'vice-president', 'svp', 'evp', 'avp'],
  'Director': ['director', 'head of', 'head,'],
  'Manager': ['manager', 'lead', 'team lead', 'supervisor'],
  'Senior': ['senior', 'sr.', 'sr ', 'principal', 'staff'],
  'Entry': ['junior', 'jr.', 'jr ', 'associate', 'assistant', 'intern', 'trainee', 'entry'],
};

// SN seniority filter codes
const SN_SENIORITY_CODES: Record<string, string> = {
  '1': 'Entry',
  '2': 'Entry',
  '3': 'Senior',
  '4': 'Manager',
  '5': 'Director',
  '6': 'VP',
  '7': 'CXO',
  '8': 'Partner',
  '9': 'Owner',
  '10': 'CXO',
};

// SN headcount range codes
const SN_HEADCOUNT_CODES: Record<string, HeadcountRange> = {
  'A': { min: 1, max: 1, label: 'Self-employed' },
  'B': { min: 1, max: 10, label: '1-10' },
  'C': { min: 11, max: 50, label: '11-50' },
  'D': { min: 51, max: 200, label: '51-200' },
  'E': { min: 201, max: 500, label: '201-500' },
  'F': { min: 501, max: 1000, label: '501-1000' },
  'G': { min: 1001, max: 5000, label: '1001-5000' },
  'H': { min: 5001, max: 10000, label: '5001-10000' },
  'I': { min: 10001, max: Infinity, label: '10001+' },
};

// ============================================
// URL PARSING
// ============================================

/**
 * Parse Sales Navigator search URL into structured filters.
 * SN URL format: /sales/search/people?query=(...)&titleIncluded=CEO&seniorityIncluded=10&companySize=D
 */
export function parseSalesNavFilters(
  url: string,
  voyagerPayload?: unknown
): SearchFilters {
  const filters: SearchFilters = {};

  try {
    const urlObj = new URL(url);
    const params = urlObj.searchParams;

    // Title filters
    const titleIncluded = params.get('titleIncluded') || params.get('titleKeywords');
    if (titleIncluded) {
      filters.titles = titleIncluded.split(',').map((t) => t.trim().toLowerCase());
    }

    // Seniority filters
    const seniority = params.get('seniorityIncluded') || params.get('seniority');
    if (seniority) {
      filters.seniorityLevels = seniority.split(',').map((code) => {
        return SN_SENIORITY_CODES[code.trim()] || code.trim();
      });
    }

    // Company headcount
    const companySize = params.get('companySize') || params.get('companyHeadcount');
    if (companySize) {
      filters.companyHeadcount = companySize.split(',').map((code) => {
        return SN_HEADCOUNT_CODES[code.trim()] || { min: 0, max: Infinity, label: code.trim() };
      });
    }

    // Industry
    const industry = params.get('industryIncluded') || params.get('industry');
    if (industry) {
      filters.industries = industry.split(',').map((i) => i.trim().toLowerCase());
    }

    // Geography
    const geo = params.get('geoIncluded') || params.get('geoUrn') || params.get('geography');
    if (geo) {
      filters.geographies = geo.split(',').map((g) => {
        // Remove URN prefix if present
        return g.replace(/^urn:li:fs_geo:/, '').trim().toLowerCase();
      });
    }

    // Company names
    const companyName = params.get('companyIncluded') || params.get('company');
    if (companyName) {
      filters.companyNames = companyName.split(',').map((c) => c.trim().toLowerCase());
    }

    // Keywords (general search query)
    const keywords = params.get('keywords') || params.get('query');
    if (keywords) {
      filters.keywords = keywords.split(/[\s,]+/).filter(Boolean).map((k) => k.toLowerCase());
    }

    // Try to extract from Voyager payload if available
    if (voyagerPayload) {
      mergeVoyagerFilters(filters, voyagerPayload);
    }
  } catch {
    // URL parsing failed, return empty filters
  }

  return filters;
}

/**
 * Extract structured filters from Voyager API request body.
 */
function mergeVoyagerFilters(filters: SearchFilters, payload: unknown): void {
  try {
    const data = payload as Record<string, unknown>;

    // Voyager uses nested filter objects
    const filterValues = data.filters as Record<string, unknown>[] | undefined;
    if (!Array.isArray(filterValues)) return;

    for (const filter of filterValues) {
      const type = filter.type as string;
      const values = filter.values as string[] | undefined;
      if (!values?.length) continue;

      switch (type) {
        case 'CURRENT_TITLE':
        case 'TITLE':
          if (!filters.titles?.length) {
            filters.titles = values.map((v) => v.toLowerCase());
          }
          break;
        case 'SENIORITY_LEVEL':
          if (!filters.seniorityLevels?.length) {
            filters.seniorityLevels = values.map((v) => SN_SENIORITY_CODES[v] || v);
          }
          break;
        case 'COMPANY_HEADCOUNT':
          if (!filters.companyHeadcount?.length) {
            filters.companyHeadcount = values.map((v) =>
              SN_HEADCOUNT_CODES[v] || { min: 0, max: Infinity, label: v }
            );
          }
          break;
        case 'INDUSTRY':
          if (!filters.industries?.length) {
            filters.industries = values.map((v) => v.toLowerCase());
          }
          break;
        case 'REGION':
        case 'GEO':
          if (!filters.geographies?.length) {
            filters.geographies = values.map((v) => v.toLowerCase());
          }
          break;
      }
    }
  } catch {
    // Voyager payload parsing failed, ignore
  }
}

// ============================================
// VALIDATION
// ============================================

/**
 * Validate a lead against search filters.
 * Returns match status with confidence and mismatch reasons.
 */
export function validateLeadAgainstFilters(
  lead: ExtractedLead,
  filters: SearchFilters
): FilterMatchResult {
  const mismatches: FilterMismatch[] = [];
  let checksPerformed = 0;
  let checksPassed = 0;

  // Title match
  if (filters.titles?.length) {
    checksPerformed++;
    if (validateTitleMatch(lead.title, filters.titles)) {
      checksPassed++;
    } else {
      mismatches.push({
        field: 'title',
        filter: filters.titles.join(', '),
        actual: lead.title || '(empty)',
        reason: `Title "${lead.title}" does not match filter: ${filters.titles.join(', ')}`,
      });
    }
  }

  // Seniority match
  if (filters.seniorityLevels?.length) {
    checksPerformed++;
    if (validateSeniorityMatch(lead.title, filters.seniorityLevels)) {
      checksPassed++;
    } else {
      const detectedLevel = detectSeniorityLevel(lead.title);
      mismatches.push({
        field: 'seniority',
        filter: filters.seniorityLevels.join(', '),
        actual: detectedLevel || '(unknown)',
        reason: `Seniority level "${detectedLevel}" does not match filter: ${filters.seniorityLevels.join(', ')}`,
      });
    }
  }

  // Company headcount match
  if (filters.companyHeadcount?.length && lead.companyHeadcount !== undefined) {
    checksPerformed++;
    if (validateHeadcountMatch(lead.companyHeadcount, filters.companyHeadcount)) {
      checksPassed++;
    } else {
      mismatches.push({
        field: 'company_headcount',
        filter: filters.companyHeadcount.map((r) => r.label).join(', '),
        actual: String(lead.companyHeadcount),
        reason: `Company headcount ${lead.companyHeadcount} is outside filter range: ${filters.companyHeadcount.map((r) => r.label).join(', ')}`,
      });
    }
  }

  // Industry match
  if (filters.industries?.length && lead.companyIndustry) {
    checksPerformed++;
    if (validateIndustryMatch(lead.companyIndustry, filters.industries)) {
      checksPassed++;
    } else {
      mismatches.push({
        field: 'industry',
        filter: filters.industries.join(', '),
        actual: lead.companyIndustry,
        reason: `Industry "${lead.companyIndustry}" does not match filter: ${filters.industries.join(', ')}`,
      });
    }
  }

  // Geography match
  if (filters.geographies?.length && lead.location) {
    checksPerformed++;
    if (validateGeographyMatch(lead.location, filters.geographies)) {
      checksPassed++;
    } else {
      mismatches.push({
        field: 'geography',
        filter: filters.geographies.join(', '),
        actual: lead.location,
        reason: `Location "${lead.location}" does not match filter: ${filters.geographies.join(', ')}`,
      });
    }
  }

  // Company name match
  if (filters.companyNames?.length && lead.company) {
    checksPerformed++;
    if (validateCompanyNameMatch(lead.company, filters.companyNames)) {
      checksPassed++;
    } else {
      mismatches.push({
        field: 'company',
        filter: filters.companyNames.join(', '),
        actual: lead.company,
        reason: `Company "${lead.company}" does not match filter: ${filters.companyNames.join(', ')}`,
      });
    }
  }

  const confidence = checksPerformed > 0
    ? Math.round((checksPassed / checksPerformed) * 100)
    : 100; // No filters to check = assumed match

  return {
    isMatch: mismatches.length === 0,
    confidence,
    mismatches,
  };
}

// ============================================
// INDIVIDUAL VALIDATORS
// ============================================

function validateTitleMatch(title: string, filterTitles: string[]): boolean {
  if (!title) return false;
  const normalizedTitle = title.toLowerCase();

  return filterTitles.some((filterTitle) => {
    const normalized = filterTitle.toLowerCase();
    // Exact substring match
    if (normalizedTitle.includes(normalized)) return true;
    // Check common abbreviations
    if (matchesAbbreviation(normalizedTitle, normalized)) return true;
    // Fuzzy: check if all words in filter appear in title
    const filterWords = normalized.split(/\s+/);
    return filterWords.every((word) => normalizedTitle.includes(word));
  });
}

function validateSeniorityMatch(title: string, filterLevels: string[]): boolean {
  if (!title) return false;
  const detectedLevel = detectSeniorityLevel(title);
  if (!detectedLevel) return false;
  return filterLevels.some((level) =>
    level.toLowerCase() === detectedLevel.toLowerCase()
  );
}

function detectSeniorityLevel(title: string): string | null {
  if (!title) return null;
  const lower = title.toLowerCase();

  for (const [level, keywords] of Object.entries(SENIORITY_MAP)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return level;
    }
  }
  return null;
}

function validateHeadcountMatch(
  headcount: number,
  ranges: HeadcountRange[]
): boolean {
  return ranges.some((range) => headcount >= range.min && headcount <= range.max);
}

function validateIndustryMatch(
  industry: string,
  filterIndustries: string[]
): boolean {
  const normalized = industry.toLowerCase();
  return filterIndustries.some((fi) => {
    const filterNorm = fi.toLowerCase();
    return normalized.includes(filterNorm) || filterNorm.includes(normalized);
  });
}

function validateGeographyMatch(
  location: string,
  filterGeos: string[]
): boolean {
  const normalized = location.toLowerCase();
  return filterGeos.some((geo) => {
    const geoNorm = geo.toLowerCase();
    // Check if location contains the geo filter or vice versa
    return normalized.includes(geoNorm) || geoNorm.includes(normalized);
  });
}

function validateCompanyNameMatch(
  company: string,
  filterCompanies: string[]
): boolean {
  const normalized = company.toLowerCase();
  return filterCompanies.some((fc) => {
    const filterNorm = fc.toLowerCase();
    return normalized.includes(filterNorm) || filterNorm.includes(normalized);
  });
}

// ============================================
// HELPERS
// ============================================

const ABBREVIATIONS: Record<string, string[]> = {
  'vp': ['vice president', 'vice-president'],
  'ceo': ['chief executive officer'],
  'cto': ['chief technology officer', 'chief technical officer'],
  'cfo': ['chief financial officer'],
  'coo': ['chief operating officer'],
  'cmo': ['chief marketing officer'],
  'cio': ['chief information officer'],
  'svp': ['senior vice president'],
  'evp': ['executive vice president'],
  'avp': ['assistant vice president'],
  'sr': ['senior'],
  'jr': ['junior'],
  'mgr': ['manager'],
  'dir': ['director'],
  'eng': ['engineering', 'engineer'],
  'dev': ['development', 'developer'],
  'mktg': ['marketing'],
  'hr': ['human resources'],
  'ops': ['operations'],
};

function matchesAbbreviation(title: string, filter: string): boolean {
  for (const [abbr, expansions] of Object.entries(ABBREVIATIONS)) {
    // Filter uses abbreviation, title has expansion
    if (filter.includes(abbr)) {
      if (expansions.some((exp) => title.includes(exp))) return true;
    }
    // Filter uses expansion, title has abbreviation
    for (const expansion of expansions) {
      if (filter.includes(expansion) && title.includes(abbr)) return true;
    }
  }
  return false;
}

/**
 * Check if any filters are present (non-empty).
 */
export function hasActiveFilters(filters: SearchFilters): boolean {
  return !!(
    filters.titles?.length ||
    filters.seniorityLevels?.length ||
    filters.companyHeadcount?.length ||
    filters.industries?.length ||
    filters.geographies?.length ||
    filters.companyNames?.length
  );
}
