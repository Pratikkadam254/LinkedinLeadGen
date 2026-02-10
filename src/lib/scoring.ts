// Lead Scoring Engine - Calculates scores based on ICP (Ideal Customer Profile)
// Score ranges: 0-100, broken down into weighted categories

export interface ScoringCriteria {
    companySize: {
        weight: number
        ranges: { min: number; max: number; score: number }[]
    }
    followerInfluence: {
        weight: number
        ranges: { min: number; max: number; score: number }[]
    }
    recentActivity: {
        weight: number
        daysThreshold: number
        hasPostsScore: number
        noPostsScore: number
    }
    eventKeywords: {
        weight: number
        keywords: string[]
        matchScore: number
        noMatchScore: number
    }
    mutualConnections: {
        weight: number
        ranges: { min: number; max: number; score: number }[]
    }
    titleMatch: {
        weight: number
        targetTitles: string[]
        matchScore: number
        partialMatchScore: number
        noMatchScore: number
    }
}

export interface LeadData {
    firstName: string
    lastName: string
    company: string
    title: string
    companySize?: number
    followers?: number
    lastPostDays?: number
    postContent?: string
    mutualConnections?: number
}

export interface ScoreBreakdown {
    label: string
    score: number
    maxScore: number
    reason: string
}

export interface ScoringResult {
    totalScore: number
    breakdown: ScoreBreakdown[]
    tier: 'hot' | 'warm' | 'cold'
    recommendation: string
}

// Default scoring criteria based on common B2B ICP
export const defaultScoringCriteria: ScoringCriteria = {
    companySize: {
        weight: 25,
        ranges: [
            { min: 51, max: 200, score: 25 },   // Sweet spot
            { min: 201, max: 500, score: 22 },
            { min: 11, max: 50, score: 18 },
            { min: 501, max: 1000, score: 15 },
            { min: 1, max: 10, score: 10 },
            { min: 1001, max: Infinity, score: 8 },
        ],
    },
    followerInfluence: {
        weight: 20,
        ranges: [
            { min: 5000, max: Infinity, score: 20 },
            { min: 2000, max: 4999, score: 17 },
            { min: 1000, max: 1999, score: 14 },
            { min: 500, max: 999, score: 10 },
            { min: 0, max: 499, score: 5 },
        ],
    },
    recentActivity: {
        weight: 20,
        daysThreshold: 14,
        hasPostsScore: 20,
        noPostsScore: 5,
    },
    eventKeywords: {
        weight: 15,
        keywords: [
            'funding', 'series', 'raised', 'growth', 'hiring', 'expansion',
            'launch', 'announcement', 'milestone', 'revenue', 'scale',
            'promoted', 'new role', 'excited', 'thrilled', 'proud'
        ],
        matchScore: 15,
        noMatchScore: 3,
    },
    mutualConnections: {
        weight: 10,
        ranges: [
            { min: 10, max: Infinity, score: 10 },
            { min: 5, max: 9, score: 8 },
            { min: 2, max: 4, score: 5 },
            { min: 0, max: 1, score: 2 },
        ],
    },
    titleMatch: {
        weight: 10,
        targetTitles: [
            'ceo', 'cto', 'cfo', 'coo', 'founder', 'co-founder', 'owner',
            'vp', 'vice president', 'director', 'head of', 'chief'
        ],
        matchScore: 10,
        partialMatchScore: 6,
        noMatchScore: 2,
    },
}

// Score a single category based on ranges
function scoreByRange(
    value: number,
    ranges: { min: number; max: number; score: number }[]
): number {
    for (const range of ranges) {
        if (value >= range.min && value <= range.max) {
            return range.score
        }
    }
    return 0
}

// Check if title matches target titles
function scoreTitle(
    title: string,
    criteria: ScoringCriteria['titleMatch']
): { score: number; matched: boolean } {
    const lowerTitle = title.toLowerCase()

    for (const targetTitle of criteria.targetTitles) {
        if (lowerTitle.includes(targetTitle)) {
            return { score: criteria.matchScore, matched: true }
        }
    }

    // Partial match for management keywords
    const managementKeywords = ['manager', 'lead', 'senior', 'principal']
    for (const keyword of managementKeywords) {
        if (lowerTitle.includes(keyword)) {
            return { score: criteria.partialMatchScore, matched: true }
        }
    }

    return { score: criteria.noMatchScore, matched: false }
}

// Check for event keywords in post content
function scoreEventKeywords(
    postContent: string | undefined,
    criteria: ScoringCriteria['eventKeywords']
): { score: number; matchedKeywords: string[] } {
    if (!postContent) {
        return { score: criteria.noMatchScore, matchedKeywords: [] }
    }

    const lowerContent = postContent.toLowerCase()
    const matchedKeywords = criteria.keywords.filter(kw =>
        lowerContent.includes(kw.toLowerCase())
    )

    if (matchedKeywords.length > 0) {
        // Bonus for multiple keyword matches (max 1.5x)
        const multiplier = Math.min(1 + (matchedKeywords.length - 1) * 0.1, 1.5)
        return {
            score: Math.round(criteria.matchScore * multiplier),
            matchedKeywords
        }
    }

    return { score: criteria.noMatchScore, matchedKeywords: [] }
}

// Main scoring function
export function calculateLeadScore(
    lead: LeadData,
    criteria: ScoringCriteria = defaultScoringCriteria
): ScoringResult {
    const breakdown: ScoreBreakdown[] = []

    // 1. Company Size Score
    const companySizeValue = lead.companySize || 50 // Default assumption
    const companySizeScore = scoreByRange(companySizeValue, criteria.companySize.ranges)
    breakdown.push({
        label: `Company Size (${companySizeValue} employees)`,
        score: companySizeScore,
        maxScore: criteria.companySize.weight,
        reason: companySizeScore >= 20
            ? 'Ideal company size for your ICP'
            : 'Outside primary target range'
    })

    // 2. Follower Influence Score
    const followersValue = lead.followers || 1000 // Default assumption
    const followersScore = scoreByRange(followersValue, criteria.followerInfluence.ranges)
    breakdown.push({
        label: 'Follower Influence',
        score: followersScore,
        maxScore: criteria.followerInfluence.weight,
        reason: followersValue >= 2000
            ? 'Strong industry presence'
            : 'Moderate reach'
    })

    // 3. Recent Activity Score
    const lastPostDays = lead.lastPostDays ?? 30 // Default: no recent post
    const activityScore = lastPostDays <= criteria.recentActivity.daysThreshold
        ? criteria.recentActivity.hasPostsScore
        : criteria.recentActivity.noPostsScore
    breakdown.push({
        label: 'Recent Activity',
        score: activityScore,
        maxScore: criteria.recentActivity.weight,
        reason: lastPostDays <= 14
            ? `Posted ${lastPostDays} days ago - actively engaged`
            : 'No recent posts detected'
    })

    // 4. Event Keywords Score
    const { score: keywordsScore, matchedKeywords } = scoreEventKeywords(
        lead.postContent,
        criteria.eventKeywords
    )
    breakdown.push({
        label: 'Event Keywords',
        score: Math.min(keywordsScore, criteria.eventKeywords.weight),
        maxScore: criteria.eventKeywords.weight,
        reason: matchedKeywords.length > 0
            ? `Found: ${matchedKeywords.slice(0, 3).join(', ')}`
            : 'No trigger events detected'
    })

    // 5. Mutual Connections Score
    const mutualValue = lead.mutualConnections || 0
    const mutualScore = scoreByRange(mutualValue, criteria.mutualConnections.ranges)
    breakdown.push({
        label: 'Mutual Connections',
        score: mutualScore,
        maxScore: criteria.mutualConnections.weight,
        reason: mutualValue >= 5
            ? `${mutualValue} shared connections`
            : 'Few mutual connections'
    })

    // 6. Title Match Score
    const { score: titleScore } = scoreTitle(lead.title, criteria.titleMatch)
    breakdown.push({
        label: 'Title Match',
        score: titleScore,
        maxScore: criteria.titleMatch.weight,
        reason: titleScore >= 8
            ? 'Decision maker title'
            : titleScore >= 5
                ? 'Influencer role'
                : 'Lower seniority'
    })

    // Calculate total score
    const totalScore = breakdown.reduce((sum, item) => sum + item.score, 0)

    // Determine tier
    let tier: 'hot' | 'warm' | 'cold'
    let recommendation: string

    if (totalScore >= 80) {
        tier = 'hot'
        recommendation = 'High priority - send personalized message immediately'
    } else if (totalScore >= 60) {
        tier = 'warm'
        recommendation = 'Good fit - add to outreach sequence'
    } else {
        tier = 'cold'
        recommendation = 'Low priority - consider for follow-up sequence'
    }

    return {
        totalScore,
        breakdown,
        tier,
        recommendation,
    }
}

// Generate score for display with simulated data
export function generateMockScore(lead: {
    firstName: string
    lastName: string
    company: string
    title: string
}): ScoringResult {
    // Simulate additional data based on lead info
    const mockData: LeadData = {
        ...lead,
        companySize: Math.floor(Math.random() * 500) + 20,
        followers: Math.floor(Math.random() * 5000) + 200,
        lastPostDays: Math.floor(Math.random() * 30),
        postContent: Math.random() > 0.3
            ? 'Excited to share our latest funding round! Looking forward to scaling...'
            : undefined,
        mutualConnections: Math.floor(Math.random() * 15),
    }

    return calculateLeadScore(mockData)
}
