// Lead Scoring Algorithm
// Scores leads 0-100 based on multiple weighted factors

export interface ScoringInput {
    // Company data
    companySize?: number;
    companyIndustry?: string;

    // Person data
    title: string;
    followers?: number;

    // Engagement data
    lastPostDays?: number;
    postContent?: string;
    mutualConnections?: number;

    // User preferences (target matching)
    targetTitles?: string[];
    targetIndustries?: string[];
    targetCompanySize?: string;
}

export interface ScoreBreakdown {
    companySize: number;       // 0-15
    followerInfluence: number; // 0-15
    recentActivity: number;    // 0-20
    eventKeywords: number;     // 0-15
    mutualConnections: number; // 0-15
    titleMatch: number;        // 0-20
}

export interface ScoringResult {
    score: number;
    tier: 'hot' | 'warm' | 'cold';
    breakdown: ScoreBreakdown;
    insights: string[];
}

// Title seniority keywords (weighted by importance)
const SENIORITY_KEYWORDS: Record<string, number> = {
    'ceo': 20, 'cto': 20, 'cfo': 20, 'coo': 20, 'cmo': 20,
    'chief': 18, 'founder': 18, 'co-founder': 18, 'cofounder': 18,
    'president': 17, 'partner': 16,
    'vp': 16, 'vice president': 16,
    'svp': 15, 'evp': 15,
    'director': 14, 'head': 14,
    'senior manager': 12, 'sr. manager': 12,
    'manager': 10,
    'lead': 9, 'principal': 9,
    'senior': 8, 'sr.': 8,
    'specialist': 6, 'consultant': 6,
    'analyst': 5, 'associate': 4,
    'coordinator': 3, 'assistant': 2,
    'intern': 1,
};

// Industry-relevant keywords in posts
const ENGAGEMENT_KEYWORDS = [
    'hiring', 'growing', 'expansion', 'announcing', 'launched',
    'looking for', 'seeking', 'need', 'challenge', 'opportunity',
    'excited', 'thrilled', 'proud', 'partnership', 'collaboration',
    'revenue', 'growth', 'scale', 'funding', 'series',
    'automation', 'ai', 'digital', 'transformation', 'innovation',
    'b2b', 'saas', 'startup', 'enterprise',
];

// Company size scoring ranges
function scoreCompanySize(size?: number, targetSize?: string): number {
    if (!size) return 5; // Default neutral score

    // If user has target preference
    if (targetSize) {
        const ranges: Record<string, [number, number]> = {
            '1-10': [1, 10],
            '11-50': [11, 50],
            '51-200': [51, 200],
            '201-1000': [201, 1000],
            '1001-5000': [1001, 5000],
            '5000+': [5000, 100000],
        };

        const target = ranges[targetSize];
        if (target && size >= target[0] && size <= target[1]) {
            return 15; // Perfect match
        }
        // Close match
        if (target) {
            const mid = (target[0] + target[1]) / 2;
            const distance = Math.abs(size - mid) / mid;
            return Math.max(3, Math.round(15 - distance * 10));
        }
    }

    // General scoring: mid-size companies tend to be better leads
    if (size >= 50 && size <= 1000) return 12;
    if (size >= 10 && size <= 5000) return 10;
    if (size > 5000) return 8;
    return 6;
}

// Follower influence scoring
function scoreFollowerInfluence(followers?: number): number {
    if (!followers) return 5;
    if (followers >= 10000) return 15;
    if (followers >= 5000) return 13;
    if (followers >= 2000) return 11;
    if (followers >= 1000) return 9;
    if (followers >= 500) return 7;
    return 5;
}

// Recent activity scoring
function scoreRecentActivity(lastPostDays?: number): number {
    if (lastPostDays === undefined) return 8; // Unknown = neutral
    if (lastPostDays <= 3) return 20;   // Very active
    if (lastPostDays <= 7) return 17;   // Active
    if (lastPostDays <= 14) return 14;  // Moderately active
    if (lastPostDays <= 30) return 10;  // Somewhat active
    if (lastPostDays <= 60) return 6;   // Low activity
    return 3;                            // Inactive
}

// Event/engagement keywords in posts
function scoreEventKeywords(postContent?: string): number {
    if (!postContent) return 5;

    const lower = postContent.toLowerCase();
    let matchCount = 0;

    for (const keyword of ENGAGEMENT_KEYWORDS) {
        if (lower.includes(keyword)) matchCount++;
    }

    if (matchCount >= 5) return 15;
    if (matchCount >= 3) return 12;
    if (matchCount >= 2) return 10;
    if (matchCount >= 1) return 7;
    return 5;
}

// Mutual connections scoring
function scoreMutualConnections(count?: number): number {
    if (!count) return 3;
    if (count >= 20) return 15;
    if (count >= 10) return 13;
    if (count >= 5) return 10;
    if (count >= 2) return 7;
    return 5;
}

// Title match scoring
function scoreTitleMatch(title: string, targetTitles?: string[]): number {
    const lowerTitle = title.toLowerCase();

    // Check against target titles if provided
    if (targetTitles && targetTitles.length > 0) {
        for (const target of targetTitles) {
            if (lowerTitle.includes(target.toLowerCase())) return 20;
        }
    }

    // Score based on seniority
    let bestScore = 0;
    for (const [keyword, value] of Object.entries(SENIORITY_KEYWORDS)) {
        if (lowerTitle.includes(keyword)) {
            bestScore = Math.max(bestScore, value);
        }
    }

    return bestScore || 5;
}

// Main scoring function
export function scoreLead(input: ScoringInput): ScoringResult {
    const breakdown: ScoreBreakdown = {
        companySize: scoreCompanySize(input.companySize, input.targetCompanySize),
        followerInfluence: scoreFollowerInfluence(input.followers),
        recentActivity: scoreRecentActivity(input.lastPostDays),
        eventKeywords: scoreEventKeywords(input.postContent),
        mutualConnections: scoreMutualConnections(input.mutualConnections),
        titleMatch: scoreTitleMatch(input.title, input.targetTitles),
    };

    const score = Math.min(100,
        breakdown.companySize +
        breakdown.followerInfluence +
        breakdown.recentActivity +
        breakdown.eventKeywords +
        breakdown.mutualConnections +
        breakdown.titleMatch
    );

    // Determine tier
    let tier: 'hot' | 'warm' | 'cold' = 'cold';
    if (score >= 75) tier = 'hot';
    else if (score >= 50) tier = 'warm';

    // Generate insights
    const insights: string[] = [];
    if (breakdown.recentActivity >= 17) insights.push('Very active on LinkedIn recently');
    if (breakdown.titleMatch >= 16) insights.push('Senior decision-maker');
    if (breakdown.eventKeywords >= 12) insights.push('Post signals buying intent');
    if (breakdown.mutualConnections >= 10) insights.push('Strong network overlap');
    if (breakdown.followerInfluence >= 13) insights.push('High-influence professional');
    if (breakdown.companySize >= 12) insights.push('Company fits target profile');
    if (score < 40) insights.push('Consider lower priority for outreach');

    return { score, tier, breakdown, insights };
}

// Batch score multiple leads
export function scoreLeads(leads: ScoringInput[]): ScoringResult[] {
    return leads.map(scoreLead);
}
