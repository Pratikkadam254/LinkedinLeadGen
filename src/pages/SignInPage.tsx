import { SignIn, useAuth } from '@clerk/clerk-react'
import { Link, Navigate } from 'react-router-dom'
import Logo from '../components/ui/Logo'
import './AuthPage.css'

function SignInPage() {
    const clerkLoaded = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

    // If Clerk is not configured, render with useAuth hook
    if (clerkLoaded) {
        return <SignInWithClerk />
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
                    <h1>Sign in to your account</h1>
                    <p className="auth-subtitle">Welcome back! Please enter your details.</p>

                    <div className="auth-notice">
                        <p>⚠️ Clerk is not configured yet.</p>
                        <p>Add your <code>VITE_CLERK_PUBLISHABLE_KEY</code> to <code>.env.local</code></p>
                    </div>

                    <div className="auth-divider">
                        <span>Demo Mode</span>
                    </div>

                    <Link to="/dashboard" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                        Continue to Dashboard →
                    </Link>

                    <p className="auth-footer">
                        Don't have an account? <Link to="/signup">Sign up</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

function SignInWithClerk() {
    const { isSignedIn } = useAuth()

    if (isSignedIn) {
        return <Navigate to="/dashboard" replace />
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <Link to="/" className="auth-logo">
                    <Logo />
                    <span>LeadFlow AI</span>
                </Link>

                <SignIn
                    routing="path"
                    path="/signin"
                    signUpUrl="/signup"
                    afterSignInUrl="/dashboard"
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
                            fontFamily: 'Inter, sans-serif',
                        }
                    }}
                />
            </div>
        </div>
    )
}

export default SignInPage
