import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convexUrl = import.meta.env.VITE_CONVEX_URL;

// Create Convex client
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

interface ConvexClientProviderProps {
    children: ReactNode;
}

export function ConvexClientProvider({ children }: ConvexClientProviderProps) {
    if (!convex) {
        // Convex not configured, render children without provider
        console.warn('[Convex] URL not configured. Set VITE_CONVEX_URL in .env.local');
        return <>{children}</>;
    }

    return (
        <ConvexProvider client={convex}>
            {children}
        </ConvexProvider>
    );
}

// Export the client for direct usage if needed
export { convex };
