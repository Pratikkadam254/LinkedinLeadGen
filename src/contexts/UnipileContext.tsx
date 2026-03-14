import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import {
    unipileService,
    initializeUnipile,
    type LinkedInAccount,
    type ConnectionRequest,
    type DirectMessage,
    type UnipileResponse,
    type ConnectionStatus,
    type MessageStatus,
} from '../lib/unipile'

interface UnipileContextType {
    isConfigured: boolean
    isConnected: boolean
    account: LinkedInAccount | null
    limits: {
        connectionRequests: { limit: number; used: number; remaining: number }
        messages: { limit: number; used: number; remaining: number }
    }
    connect: () => Promise<void>
    disconnect: () => Promise<void>
    sendConnectionRequest: (request: ConnectionRequest) => Promise<UnipileResponse<ConnectionStatus>>
    sendMessage: (message: DirectMessage) => Promise<UnipileResponse<MessageStatus>>
    refreshLimits: () => void
}

const UnipileContext = createContext<UnipileContextType | null>(null)

export function UnipileProvider({ children }: { children: ReactNode }) {
    const [account, setAccount] = useState<LinkedInAccount | null>(null)
    const [limits, setLimits] = useState(unipileService.getDailyLimits())

    useEffect(() => {
        initializeUnipile()
        const existingAccount = unipileService.getAccount()
        if (existingAccount) {
            setAccount(existingAccount)
        }
    }, [])

    const connect = async () => {
        // For demo mode without API key
        if (!import.meta.env.VITE_UNIPILE_API_KEY) {
            await new Promise(resolve => setTimeout(resolve, 1500))
            const mockAccount: LinkedInAccount = {
                id: 'demo_account',
                provider: 'linkedin',
                status: 'connected',
                name: 'Demo User',
                email: 'demo@example.com',
                profileUrl: 'https://linkedin.com/in/demo-user',
                connectedAt: new Date().toISOString(),
            }
            setAccount(mockAccount)
            return
        }

        const oauthUrl = await unipileService.getOAuthUrl()
        window.location.href = oauthUrl
    }

    const disconnect = async () => {
        await unipileService.disconnect()
        setAccount(null)
    }

    const sendConnectionRequest = async (request: ConnectionRequest) => {
        const result = await unipileService.sendConnectionRequest(request)
        if (result.success) {
            setLimits(unipileService.getDailyLimits())
        }
        return result
    }

    const sendMessage = async (message: DirectMessage) => {
        const result = await unipileService.sendMessage(message)
        if (result.success) {
            setLimits(unipileService.getDailyLimits())
        }
        return result
    }

    const refreshLimits = () => {
        setLimits(unipileService.getDailyLimits())
    }

    const value: UnipileContextType = {
        isConfigured: unipileService.isConfigured(),
        isConnected: !!account && account.status === 'connected',
        account,
        limits,
        connect,
        disconnect,
        sendConnectionRequest,
        sendMessage,
        refreshLimits,
    }

    return (
        <UnipileContext.Provider value={value}>
            {children}
        </UnipileContext.Provider>
    )
}

export function useUnipile() {
    const context = useContext(UnipileContext)
    if (!context) {
        throw new Error('useUnipile must be used within a UnipileProvider')
    }
    return context
}
