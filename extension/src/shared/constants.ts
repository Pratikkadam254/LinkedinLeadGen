// Extension configuration constants

// ============================================
// RATE LIMITING & SAFETY
// ============================================
export const DAILY_EXTRACTION_LIMIT = 2500;
export const MAX_LEADS_PER_EXTRACTION = 2500;
export const LEADS_PER_PAGE = 25;
export const MIN_DELAY_BETWEEN_PAGES_MS = 2000;
export const MAX_DELAY_BETWEEN_PAGES_MS = 5000;
export const MIN_SCROLL_DELAY_MS = 800;
export const MAX_SCROLL_DELAY_MS = 2500;
export const MAX_SESSION_DURATION_MS = 45 * 60 * 1000; // 45 minutes
export const BATCH_SIZE = 50; // Leads per Convex mutation call
export const SAFE_MODE_DURATION_MS = 15 * 60 * 1000; // 15 minutes cooldown when detection suspected

// ============================================
// VOYAGER API ENDPOINTS (LinkedIn internal)
// ============================================
export const VOYAGER_API_PATTERNS = [
  '/voyager/api/',
  '/salesApi',
  '/sales-api/',
  '/voyager/api/search/dash/clusters',
  '/voyager/api/identity/profiles/',
  '/voyager/api/salesApiLeadSearch',
] as const;

// ============================================
// SALES NAVIGATOR DOM SELECTORS
// Priority: data-anonymize > aria-label > data-* > structural
// NEVER use dynamic class names (artdeco-*, hashed classes)
// Last updated: 2026-03-14
// ============================================
export const SELECTORS = {
  // Page detection
  salesNavApp: '[data-test-id="sales-navigator"]',
  searchResultsPage: '.search-results-container',
  leadListPage: '[data-test-id="lead-list"]',

  // Lead search results container
  resultsList: '[class*="search-results"] ol, [class*="search-results"] ul',
  resultCard: 'li[class*="artdeco-list__item"], [data-view-name="search-results-lead-card"]',

  // Within each result card — use data-anonymize for stability
  personName: '[data-anonymize="person-name"]',
  title: '[data-anonymize="title"]',
  company: '[data-anonymize="company-name"]',
  location: '[data-anonymize="location"]',

  // Profile link
  profileLink: 'a[href*="/sales/lead/"], a[href*="/sales/people/"]',

  // Structural fallbacks
  connectionDegree: '[class*="entity-lockup__degree"], [class*="connection-degree"]',
  sharedConnections: '[aria-label*="shared connection"], [aria-label*="mutual"]',
  companyLink: 'a[href*="/sales/company/"]',

  // Pagination
  nextButton: 'button[aria-label="Next"], button[class*="artdeco-pagination__button--next"]',
  prevButton: 'button[aria-label="Previous"]',
  pageIndicator: '[class*="artdeco-pagination__indicator--number"]',
  totalResults: '[class*="search-results__total"]',

  // Sales Navigator specific
  saveToListBtn: 'button[aria-label*="Save"]',
  searchFiltersBar: '[class*="search-results-filter-bar"], [class*="search-filter"]',

  // Action bar (where we inject the Extract button)
  actionBar: '[class*="search-results__action-bar"], [class*="search-results-container"] header',
  listActionBar: '[class*="list-detail__action-bar"]',
} as const;

// ============================================
// ANTI-DETECTION SETTINGS
// ============================================
export const ANTI_DETECTION = {
  // Time-of-day throttle multipliers
  throttleMultipliers: {
    businessHours: 1.0,     // 9am-5pm
    extendedHours: 1.5,     // 7am-9am, 5pm-8pm
    offHours: 3.0,          // 8pm-7am
  },

  // Gaussian distribution parameters for delay jitter
  jitterStdDev: 0.3, // 30% of base delay

  // Scroll behavior
  scrollStepsMin: 8,
  scrollStepsMax: 15,
  scrollStepDelayMin: 30,
  scrollStepDelayMax: 80,

  // Mouse simulation
  mouseMovementInterval: 5000, // ms between simulated mouse movements

  // Dwell time on individual results
  dwellTimeMin: 400,
  dwellTimeMax: 1200,

  // Pause between batches (every N results)
  pauseEveryMin: 3,
  pauseEveryMax: 7,
  pauseDurationMin: 800,
  pauseDurationMax: 2500,

  // Long pause thresholds
  longPauseThreshold: 100, // After this many leads, take a long pause
  longPauseDurationMin: 10000,
  longPauseDurationMax: 30000,
} as const;

// ============================================
// CREDIT PLANS
// ============================================
export const CREDIT_PLANS = {
  free: { monthlyAllocation: 100, label: 'Free' },
  starter: { monthlyAllocation: 500, label: 'Starter' },
  pro: { monthlyAllocation: 2500, label: 'Pro' },
  enterprise: { monthlyAllocation: 10000, label: 'Enterprise' },
} as const;

// ============================================
// CONVEX CONFIGURATION
// ============================================
export const CONVEX_URL = (import.meta as any).env?.WXT_CONVEX_URL || 'https://YOUR_CONVEX_URL.convex.cloud';
