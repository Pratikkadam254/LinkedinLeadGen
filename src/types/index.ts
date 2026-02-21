// Shared type definitions for LeadFlow AI

export interface Lead {
    _id: string
    firstName: string
    lastName: string
    company: string
    title: string
    linkedInUrl: string
    email?: string
    score: number
    messageStatus: 'empty' | 'draft' | 'ready' | 'sent'
    outreachStatus: 'pending' | 'sent' | 'accepted' | 'replied'
    postScraped: boolean
    createdAt: number

    // Campaign & Outcome
    campaignId?: string
    bookingStatus: 'not_booked' | 'booked' | 'cancelled'
    potentialValue: number
    lastInteractionAt?: number

    // Extended data for scoring
    companySize?: number
    followers?: number
    lastPostDays?: number
    postContent?: string
    mutualConnections?: number
}

export interface Strategy {
    _id: string
    name: string
    rawInputs: {
        businessDescription: string
        targetAudienceHints: string
        primaryOffer: string
    }
    icpDocument: string
    offerDocument: string
    isActive: boolean
    createdAt: number
}

export interface Campaign {
    _id: string
    strategyId: string
    name: string
    status: 'active' | 'paused' | 'completed'
    autoPilot: boolean
    schedule: {
        timezone: string
        days: string[]
        hours: { start: string; end: string }
    }
    stats: {
        sent: number
        replied: number
        booked: number
        revenue: number
    }
    createdAt: number
}

export interface UserPreferences {
    primaryGoal: string
    targetIndustries: string[]
    companySize: string
    targetTitles: string[]
    weeklyVolume: string
    messageTone: 'professional' | 'friendly' | 'direct' | 'conversational'
    hasExistingLeads: string
    linkedInReady: string
}
