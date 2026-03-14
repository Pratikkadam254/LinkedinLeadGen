// Lead type for component props - matches Convex lead shape
export interface Lead {
    id: string
    firstName: string
    lastName: string
    company: string
    title: string
    linkedInUrl: string
    email?: string
    score: number
    messageStatus: 'empty' | 'draft' | 'approved' | 'ready' | 'sent'
    outreachStatus: 'pending' | 'sent' | 'accepted' | 'replied'
    postScraped: boolean
    createdAt: string
    generatedMessage?: string
    messageTone?: string
}
