// Unipile Integration — Type definitions and client-side helpers
// Actual API calls happen server-side in convex/actions/
// Docs: https://docs.unipile.com/

export interface LinkedInAccount {
    id: string
    provider: 'linkedin'
    status: 'connected' | 'disconnected' | 'expired'
    name: string
    email?: string
    profileUrl: string
    connectedAt: string
}

export interface ConnectionRequest {
    recipientUrl: string
    message?: string // Max 300 chars for connection requests
}

export interface DirectMessage {
    recipientUrl: string
    message: string
}

export interface UnipileResponse<T> {
    success: boolean
    data?: T
    error?: {
        code: string
        message: string
    }
}

export interface MessageStatus {
    id: string
    status: 'pending' | 'sent' | 'delivered' | 'failed'
    sentAt?: string
    error?: string
}

export interface ConnectionStatus {
    id: string
    status: 'pending' | 'accepted' | 'declined' | 'withdrawn'
    sentAt: string
    respondedAt?: string
}

// Webhook event types from Unipile
export type WebhookEventType =
    | 'connection.accepted'
    | 'connection.declined'
    | 'message.received'
    | 'message.delivered'
    | 'account.disconnected'

export interface WebhookEvent {
    type: WebhookEventType
    timestamp: string
    data: Record<string, unknown>
}

// LinkedIn connection limits (Unipile enforced)
export const LINKEDIN_LIMITS = {
    connectionRequestsPerDay: 100,
    messagesPerDay: 150,
    maxConnectionMessage: 300, // characters
} as const
