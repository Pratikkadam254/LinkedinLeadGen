// Shared type definitions for LeadFlow AI

export interface Lead {
    id: string
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
    createdAt: string

    // Extended data for scoring
    companySize?: number
    followers?: number
    lastPostDays?: number
    postContent?: string
    mutualConnections?: number
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
