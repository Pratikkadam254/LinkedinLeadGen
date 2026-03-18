import { SignUp, useAuth } from '@clerk/clerk-react'
import { Link, Navigate } from 'react-router-dom'
import Logo from '../components/ui/Logo'
import './AuthPage.css'

function SignUpPage() {
    const clerkLoaded = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

    if (clerkLoaded) {
        return <SignUpWithClerk />
    }

    // Fallback UI when Clerk is not configured
    return (
        <div className="auth-page">
            <div className="auth-container">
                <Link to="/" className="auth-logo">
                    <Logo />
                    <span>LeadFlow AI</span>
                </Link>

                <div className="auth-card">
                    <h1>Create your account</h1>
                    <p className="auth-subtitle">Start your 7-day free trial today.</p>

                    <div className="auth-notice">
                        <p>⚠️ Clerk is not configured yet.</p>
                        <p>Add your <code>VITE_CLERK_PUBLISHABLE_KEY</code> to <code>.env.local</code></p>
                    </div>

                    <div className="auth-divider">
                        <span>Demo Mode</span>
                    </div>

                    <Link to="/onboarding" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                        Continue to Setup →
                    </Link>

                    <p className="auth-footer">
                        Already have an account? <Link to="/signin">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

function SignUpWithClerk() {
    const { isSignedIn } = useAuth()

    if (isSignedIn) {
        return <Navigate to="/onboarding" replace />
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <Link to="/" className="auth-logo">
                    <Logo />
                    <span>LeadFlow AI</span>
                </Link>

                <SignUp
                    routing="path"
                    path="/signup"
                    signInUrl="/signin"
                    afterSignUpUrl="/onboarding"
                    appearance={{
                        elements: {
                            rootBox: 'clerk-root',
                            card: 'clerk-card',
                            headerTitle: 'clerk-title',
                            headerSubtitle: 'clerk-subtitle',
                            socialButtonsBlockButton: 'clerk-social-btn',
                            formButtonPrimary: 'clerk-primary-btn',
                            footerAction: 'clerk-footer',
                        },
                        variables: {
                            colorPrimary: '#0A66C2',
                            colorBackground: '#FFFFFF',
                            colorText: '#191919',
                            colorTextSecondary: '#666666',
                            borderRadius: '8px',
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                        }
                    }}
                />
            </div>
        </div>
    )
}

export default SignUpPage
