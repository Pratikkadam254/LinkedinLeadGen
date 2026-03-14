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

function App() {
    return <ClerkProviderWithRoutes />
}

export default App
