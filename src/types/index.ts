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
    messageStatus: 'empty' | 'draft' | 'approved' | 'ready' | 'sent'
    outreachStatus: 'pending' | 'sent' | 'accepted' | 'replied'
    generatedMessage?: string
    messageTone?: string
    postScraped: boolean
    createdAt: number

    // Extended data for scoring
    companySize?: number
    followers?: number
    lastPostDays?: number
    postContent?: string
    mutualConnections?: number
}

export interface UserPreferences {
    targetIndustries?: string[]
    targetCompanySize?: string
    targetTitles?: string[]
    messageTone?: string
}
