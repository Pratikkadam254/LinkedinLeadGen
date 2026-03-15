import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import DashboardPage from './pages/DashboardPage'
import OnboardingPage from './pages/OnboardingPage'
import UploadPage from './pages/UploadPage'
import LeadsPage from './pages/LeadsPage'
import ConnectPage from './pages/ConnectPage'
import ExtractionsPage from './pages/ExtractionsPage'
import WebhooksPage from './pages/WebhooksPage'

// Get the Clerk publishable key from environment
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// ClerkProvider with routing
function ClerkProviderWithRoutes() {
    const navigate = useNavigate()

    // If no Clerk key, show landing page without auth
    if (!PUBLISHABLE_KEY) {
        return (
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/dashboard/upload" element={<UploadPage />} />
                <Route path="/dashboard/leads" element={<LeadsPage />} />
                <Route path="/dashboard/extractions" element={<ExtractionsPage />} />
                <Route path="/dashboard/webhooks" element={<WebhooksPage />} />
                <Route path="/dashboard/connect" element={<ConnectPage />} />
                <Route path="*" element={<LandingPage />} />
            </Routes>
        )
    }

    return (
        <ClerkProvider
            publishableKey={PUBLISHABLE_KEY}
            routerPush={(to: string) => navigate(to)}
            routerReplace={(to: string) => navigate(to, { replace: true })}
        >
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/signin/*" element={<SignInPage />} />
                <Route path="/signup/*" element={<SignUpPage />} />

                {/* Protected routes - require sign in */}
                <Route
                    path="/onboarding"
                    element={
                        <>
                            <SignedIn>
                                <OnboardingPage />
                            </SignedIn>
                            <SignedOut>
                                <SignInPage />
                            </SignedOut>
                        </>
                    }
                />
                <Route
                    path="/dashboard/*"
                    element={
                        <>
                            <SignedIn>
                                <DashboardPage />
                            </SignedIn>
                            <SignedOut>
                                <SignInPage />
                            </SignedOut>
                        </>
                    }
                />
                <Route
                    path="/dashboard/upload"
                    element={
                        <>
                            <SignedIn>
                                <UploadPage />
                            </SignedIn>
                            <SignedOut>
                                <SignInPage />
                            </SignedOut>
                        </>
                    }
                />
                <Route
                    path="/dashboard/leads"
                    element={
                        <>
                            <SignedIn>
                                <LeadsPage />
                            </SignedIn>
                            <SignedOut>
                                <SignInPage />
                            </SignedOut>
                        </>
                    }
                />
                <Route
                    path="/dashboard/extractions"
                    element={
                        <>
                            <SignedIn>
                                <ExtractionsPage />
                            </SignedIn>
                            <SignedOut>
                                <SignInPage />
                            </SignedOut>
                        </>
                    }
                />
                <Route
                    path="/dashboard/webhooks"
                    element={
                        <>
                            <SignedIn>
                                <WebhooksPage />
                            </SignedIn>
                            <SignedOut>
                                <SignInPage />
                            </SignedOut>
                        </>
                    }
                />
                <Route
                    path="/dashboard/connect"
                    element={
                        <>
                            <SignedIn>
                                <ConnectPage />
                            </SignedIn>
                            <SignedOut>
                                <SignInPage />
                            </SignedOut>
                        </>
                    }
                />

                {/* Fallback */}
                <Route path="*" element={<LandingPage />} />
            </Routes>
        </ClerkProvider>
    )
}

function App() {
    return <ClerkProviderWithRoutes />
}

export default App
