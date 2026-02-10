// Unipile Integration Service
// Handles LinkedIn automation via Unipile API
// Docs: https://docs.unipile.com/

export interface UnipileConfig {
    apiKey: string
    accountId?: string
    webhookUrl?: string
}

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

// Webhook event types
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

class UnipileService {
    private config: UnipileConfig | null = null
    private account: LinkedInAccount | null = null

    // Initialize with API key
    initialize(config: UnipileConfig) {
        this.config = config
        console.log('[Unipile] Initialized with config')
    }

    // Check if service is configured
    isConfigured(): boolean {
        return !!this.config?.apiKey
    }

    // Check if LinkedIn is connected
    isConnected(): boolean {
        return this.account?.status === 'connected'
    }

    // Get connected account
    getAccount(): LinkedInAccount | null {
        return this.account
    }

    // Generate OAuth URL for LinkedIn connection
    async getOAuthUrl(): Promise<string> {
        if (!this.config) {
            throw new Error('Unipile not initialized')
        }

        // In production, this calls Unipile API to get OAuth URL
        // For demo, return a mock URL
        const baseUrl = 'https://app.unipile.com/oauth/linkedin'
        const params = new URLSearchParams({
            api_key: this.config.apiKey,
            redirect_uri: `${window.location.origin}/dashboard/connect/callback`,
            state: crypto.randomUUID(),
        })

        return `${baseUrl}?${params.toString()}`
    }

    // Handle OAuth callback
    async handleOAuthCallback(_code: string): Promise<LinkedInAccount> {
        if (!this.config) {
            throw new Error('Unipile not initialized')
        }

        // In production, exchange code for account connection
        // For demo, simulate successful connection
        await this.simulateDelay(1500)

        this.account = {
            id: `acc_${crypto.randomUUID().slice(0, 8)}`,
            provider: 'linkedin',
            status: 'connected',
            name: 'Demo User',
            email: 'demo@example.com',
            profileUrl: 'https://linkedin.com/in/demo-user',
            connectedAt: new Date().toISOString(),
        }

        return this.account
    }

    // Disconnect LinkedIn account
    async disconnect(): Promise<void> {
        if (!this.config) {
            throw new Error('Unipile not initialized')
        }

        await this.simulateDelay(500)
        this.account = null
    }

    // Send connection request
    async sendConnectionRequest(
        request: ConnectionRequest
    ): Promise<UnipileResponse<ConnectionStatus>> {
        if (!this.isConnected()) {
            return {
                success: false,
                error: { code: 'NOT_CONNECTED', message: 'LinkedIn account not connected' },
            }
        }

        // Validate message length
        if (request.message && request.message.length > 300) {
            return {
                success: false,
                error: { code: 'MESSAGE_TOO_LONG', message: 'Message exceeds 300 characters' },
            }
        }

        // In production, call Unipile API
        await this.simulateDelay(1000)

        const status: ConnectionStatus = {
            id: `conn_${crypto.randomUUID().slice(0, 8)}`,
            status: 'pending',
            sentAt: new Date().toISOString(),
        }

        console.log('[Unipile] Connection request sent:', request.recipientUrl)
        return { success: true, data: status }
    }

    // Send direct message (requires existing connection)
    async sendMessage(
        message: DirectMessage
    ): Promise<UnipileResponse<MessageStatus>> {
        if (!this.isConnected()) {
            return {
                success: false,
                error: { code: 'NOT_CONNECTED', message: 'LinkedIn account not connected' },
            }
        }

        // In production, call Unipile API
        await this.simulateDelay(800)

        const status: MessageStatus = {
            id: `msg_${crypto.randomUUID().slice(0, 8)}`,
            status: 'sent',
            sentAt: new Date().toISOString(),
        }

        console.log('[Unipile] Message sent to:', message.recipientUrl)
        return { success: true, data: status }
    }

    // Bulk send connection requests
    async sendBulkConnections(
        requests: ConnectionRequest[],
        onProgress?: (completed: number, total: number) => void
    ): Promise<UnipileResponse<ConnectionStatus>[]> {
        const results: UnipileResponse<ConnectionStatus>[] = []

        for (let i = 0; i < requests.length; i++) {
            const result = await this.sendConnectionRequest(requests[i])
            results.push(result)
            onProgress?.(i + 1, requests.length)

            // Rate limiting: wait between requests
            if (i < requests.length - 1) {
                await this.simulateDelay(2000) // 2 seconds between requests
            }
        }

        return results
    }

    // Get daily limits
    getDailyLimits() {
        return {
            connectionRequests: {
                limit: 100,
                used: 23,
                remaining: 77,
            },
            messages: {
                limit: 150,
                used: 45,
                remaining: 105,
            },
        }
    }

    // Process webhook event
    processWebhook(event: WebhookEvent): void {
        console.log('[Unipile] Webhook received:', event.type, event.data)

        switch (event.type) {
            case 'connection.accepted':
                // Update lead status in database
                break
            case 'connection.declined':
                // Mark lead as declined
                break
            case 'message.received':
                // Store reply and notify user
                break
            case 'message.delivered':
                // Update message status
                break
            case 'account.disconnected':
                // Alert user to reconnect
                this.account = null
                break
        }
    }

    // Helper: simulate network delay
    private simulateDelay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
}

// Export singleton instance
export const unipileService = new UnipileService()

// Helper to initialize from environment
export function initializeUnipile(): void {
    const apiKey = import.meta.env.VITE_UNIPILE_API_KEY

    if (apiKey) {
        unipileService.initialize({ apiKey })
    } else {
        console.warn('[Unipile] API key not configured. Set VITE_UNIPILE_API_KEY in .env.local')
    }
}
