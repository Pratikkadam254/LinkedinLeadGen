import { createContext, useContext, ReactNode } from 'react'
import { useAction } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useSyncedUser } from '../hooks'

interface UnipileContextType {
    isConnected: boolean
    connectLinkedIn: () => Promise<void>
    isConfigured: boolean
}

const UnipileContext = createContext<UnipileContextType | null>(null)

export function UnipileProvider({ children }: { children: ReactNode }) {
    const user = useSyncedUser()
    const getConnectionLink = useAction(api.actions.unipileConnect.getConnectionLink)

    const connectLinkedIn = async () => {
        const callbackUrl = `${window.location.origin}/dashboard/settings`
        try {
            const result = await getConnectionLink({ callbackUrl })
            if (result.url) {
                window.location.href = result.url
            }
        } catch (err) {
            console.error('Failed to get Unipile connection link:', err)
            throw err
        }
    }

    const value: UnipileContextType = {
        isConnected: user.unipileConnected ?? false,
        connectLinkedIn,
        isConfigured: true,
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
