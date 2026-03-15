// Shared types between extension and web app

export interface ExtractedLead {
  // Basic info
  firstName: string;
  lastName: string;
  title: string;
  company: string;
  linkedInUrl: string;
  email?: string;
  location?: string;

  // Enrichment data (Sales Navigator specific)
  companyHeadcount?: number;
  companyIndustry?: string;
  companyHeadquarters?: string;
  companyLinkedInUrl?: string;
  companyType?: string;
  companyFounded?: number;
  companyGrowthRate?: number;

  // Connection context
  connectionDegree?: number;
  sharedConnections?: number;
  sharedGroups?: string[];
  sharedExperiences?: string[];
  teamLinkConnections?: number;
  inMailAvailable?: boolean;

  // Engagement signals
  followers?: number;
  recentPosts?: PostData[];
  lastPostDays?: number;
  profileViewCount?: number;

  // Sales Navigator metadata
  salesNavProfileId?: string;
  savedToList?: string;

  // Filter match validation (Evaboot parity)
  filterMatch?: boolean;
  filterMismatchReasons?: string[];

  // Additional fields for enhanced export
  yearsAtPosition?: number;
  numConnections?: number;
  companyWebsite?: string;
}

export interface PostData {
  content: string;
  likes: number;
  comments: number;
  postedAt: number;
}

export interface ExtractionConfig {
  name?: string;
  maxLeads: number;
  searchUrl: string;
  searchFilters?: Record<string, unknown>;
}

export interface ExtractionProgress {
  status: 'idle' | 'extracting' | 'paused' | 'completed' | 'failed' | 'cancelled';
  currentPage: number;
  totalPages: number;
  leadsExtracted: number;
  totalLeads: number;
  creditsUsed: number;
  startedAt?: number;
  estimatedTimeRemaining?: number;
  error?: string;
}

export interface CreditBalance {
  balance: number;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  monthlyAllocation: number;
  resetDate: number;
}

export interface UserSession {
  isAuthenticated: boolean;
  clerkToken?: string;
  userId?: string;
  credits?: CreditBalance;
}

// Message types for chrome.runtime.sendMessage
export type ExtensionMessage =
  | { type: 'GET_AUTH_STATE' }
  | { type: 'AUTH_STATE'; data: UserSession }
  | { type: 'START_EXTRACTION'; config: ExtractionConfig }
  | { type: 'PAUSE_EXTRACTION' }
  | { type: 'RESUME_EXTRACTION' }
  | { type: 'CANCEL_EXTRACTION' }
  | { type: 'LEADS_EXTRACTED'; data: ExtractedLead[]; page: number; total: number }
  | { type: 'EXTRACTION_PROGRESS'; progress: ExtractionProgress }
  | { type: 'EXTRACTION_COMPLETE'; summary: ExtractionSummary }
  | { type: 'CHECK_CREDITS' }
  | { type: 'CREDIT_BALANCE'; data: CreditBalance }
  | { type: 'SAFE_MODE' }
  | { type: 'VOYAGER_RESPONSE'; url: string; data: unknown };

export interface ExtractionSummary {
  totalLeads: number;
  creditsUsed: number;
  duration: number;
  searchUrl: string;
  matchedLeads: number;
  unmatchedLeads: number;
  dataQuality: {
    withCompanyData: number;
    withConnectionData: number;
    withEngagementData: number;
  };
}
