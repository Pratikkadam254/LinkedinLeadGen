import { Component, type ReactNode } from 'react'
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import DashboardPage from './pages/DashboardPage'
import OnboardingPage from './pages/OnboardingPage'
import UploadPage from './pages/UploadPage'
import LeadsPage from './pages/LeadsPage'
import ApprovalPage from './pages/ApprovalPage'
import SettingsPage from './pages/SettingsPage'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    return (
        <>
            <SignedIn>{children}</SignedIn>
            <SignedOut><SignInPage /></SignedOut>
        </>
    )
}

function ClerkProviderWithRoutes() {
    const navigate = useNavigate()

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
                <Route path="/dashboard/approve" element={<ApprovalPage />} />
                <Route path="/dashboard/settings" element={<SettingsPage />} />
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

                {/* Protected routes */}
                <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/dashboard/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
                <Route path="/dashboard/leads" element={<ProtectedRoute><LeadsPage /></ProtectedRoute>} />
                <Route path="/dashboard/approve" element={<ProtectedRoute><ApprovalPage /></ProtectedRoute>} />
                <Route path="/dashboard/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

                {/* Fallback */}
                <Route path="*" element={<LandingPage />} />
            </Routes>
        </ClerkProvider>
    )
}

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
    state = { hasError: false }
    static getDerivedStateFromError() { return { hasError: true } }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '4rem', textAlign: 'center' }}>
                    <h1>Something went wrong</h1>
                    <p style={{ color: '#6B7280', marginTop: '1rem' }}>Please refresh the page to try again.</p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{ marginTop: '1.5rem', padding: '0.5rem 1.5rem', background: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    >
                        Refresh
                    </button>
                </div>
            )
        }
        return this.props.children
    }
}

function App() {
    return <ErrorBoundary><ClerkProviderWithRoutes /></ErrorBoundary>
}

export default App
