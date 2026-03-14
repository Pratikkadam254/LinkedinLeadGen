import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClerk } from '@clerk/clerk-react'
import { useQuery, useAction } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useSyncedUser } from '../hooks'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import { useToast } from '../components/ui/Toast'
import {
    User,
    Target,
    CreditCard,
    Linkedin,
    LogOut,
    Pencil,
    ExternalLink,
    Check,
    Zap,
    Crown,
    Loader2,
} from 'lucide-react'
import './SettingsPage.css'

export default function SettingsPage() {
    const navigate = useNavigate()
    const { signOut } = useClerk()
    const { showToast } = useToast()
    const user = useSyncedUser()

    const planLimits = useQuery(
        api.users.checkPlanLimits,
        user.convexId ? { userId: user.convexId } : 'skip'
    )

    const createCheckoutSession = useAction(api.stripe.createCheckoutSession)
    const createPortalSession = useAction(api.stripe.createPortalSession)

    const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
    const [portalLoading, setPortalLoading] = useState(false)
    const [signOutLoading, setSignOutLoading] = useState(false)

    const handleSubscribe = async (planId: 'pro' | 'elite') => {
        if (!user.clerkId) return
        setCheckoutLoading(planId)
        try {
            const result = await createCheckoutSession({
                clerkId: user.clerkId,
                planId,
            })
            if (result.url) {
                window.location.href = result.url
            }
        } catch (error) {
            showToast('error', 'Failed to start checkout. Please try again.')
            console.error('Checkout error:', error)
        } finally {
            setCheckoutLoading(null)
        }
    }

    const handleManageBilling = async () => {
        if (!user.clerkId) return
        setPortalLoading(true)
        try {
            const result = await createPortalSession({ clerkId: user.clerkId })
            if (result.url) {
                window.location.href = result.url
            }
        } catch (error) {
            showToast('error', 'Failed to open billing portal. Please try again.')
            console.error('Portal error:', error)
        } finally {
            setPortalLoading(false)
        }
    }

    const handleSignOut = async () => {
        setSignOutLoading(true)
        try {
            await signOut()
            navigate('/')
        } catch (error) {
            showToast('error', 'Failed to sign out.')
            console.error('Sign out error:', error)
            setSignOutLoading(false)
        }
    }

    const preferences = user.preferences
    const hasPlan = planLimits?.hasPlan ?? false

    const getStatusBadgeClass = (status: string | null) => {
        switch (status) {
            case 'active':
                return 'status-badge status-active'
            case 'past_due':
                return 'status-badge status-past-due'
            case 'canceled':
                return 'status-badge status-canceled'
            default:
                return 'status-badge'
        }
    }

    const getStatusLabel = (status: string | null) => {
        switch (status) {
            case 'active':
                return 'Active'
            case 'past_due':
                return 'Past Due'
            case 'canceled':
                return 'Canceled'
            default:
                return status || 'Unknown'
        }
    }

    const getPlanDisplayName = (plan: string | null) => {
        switch (plan) {
            case 'pro':
                return 'Pro'
            case 'elite':
                return 'Elite'
            default:
                return plan || 'Free'
        }
    }

    const leadsLimit = user.plan === 'elite' ? 2000 : 500
    const outreachLimit = user.plan === 'elite' ? 800 : 200
    const leadsUsed = leadsLimit - (planLimits?.leadsRemaining ?? 0)
    const outreachUsed = outreachLimit - (planLimits?.outreachRemaining ?? 0)

    return (
        <DashboardLayout>
            <div className="settings-page">
                <div className="settings-header">
                    <h1>Settings</h1>
                    <p>Manage your account, preferences, and billing.</p>
                </div>

                <div className="settings-sections">
                    {/* Account Section */}
                    <section className="settings-card">
                        <div className="settings-card-header">
                            <User size={20} />
                            <h2>Account</h2>
                        </div>
                        <div className="settings-card-body">
                            <div className="account-info">
                                <div className="account-avatar">
                                    {user.imageUrl ? (
                                        <img
                                            src={user.imageUrl}
                                            alt={`${user.firstName || 'User'}'s avatar`}
                                            className="avatar-image"
                                        />
                                    ) : (
                                        <div className="avatar-placeholder">
                                            {(user.firstName?.[0] || user.email[0] || 'U').toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="account-details">
                                    <div className="account-name">
                                        {user.firstName} {user.lastName}
                                    </div>
                                    <div className="account-email">{user.email}</div>
                                </div>
                            </div>
                            <button
                                className="btn btn-secondary btn-sign-out"
                                onClick={handleSignOut}
                                disabled={signOutLoading}
                            >
                                {signOutLoading ? (
                                    <Loader2 size={16} className="spin-icon" />
                                ) : (
                                    <LogOut size={16} />
                                )}
                                Sign Out
                            </button>
                        </div>
                    </section>

                    {/* ICP Preferences Section */}
                    <section className="settings-card">
                        <div className="settings-card-header">
                            <Target size={20} />
                            <h2>ICP Preferences</h2>
                        </div>
                        <div className="settings-card-body">
                            {preferences ? (
                                <div className="icp-content">
                                    <div className="icp-grid">
                                        <div className="icp-field">
                                            <span className="icp-label">Target Industries</span>
                                            <span className="icp-value">
                                                {preferences.targetIndustries?.length
                                                    ? preferences.targetIndustries.join(', ')
                                                    : 'Not set'}
                                            </span>
                                        </div>
                                        <div className="icp-field">
                                            <span className="icp-label">Target Titles</span>
                                            <span className="icp-value">
                                                {preferences.targetTitles?.length
                                                    ? preferences.targetTitles.join(', ')
                                                    : 'Not set'}
                                            </span>
                                        </div>
                                        <div className="icp-field">
                                            <span className="icp-label">Company Size</span>
                                            <span className="icp-value">
                                                {preferences.targetCompanySize || 'Not set'}
                                            </span>
                                        </div>
                                        <div className="icp-field">
                                            <span className="icp-label">Message Tone</span>
                                            <span className="icp-value">
                                                {preferences.messageTone || 'Not set'}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => navigate('/onboarding')}
                                    >
                                        <Pencil size={16} />
                                        Edit ICP
                                    </button>
                                </div>
                            ) : (
                                <div className="icp-empty">
                                    <div className="icp-empty-text">
                                        <p>You haven't set up your Ideal Customer Profile yet.</p>
                                        <span>
                                            Define your target audience to get personalized lead
                                            scoring and messaging.
                                        </span>
                                    </div>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => navigate('/onboarding')}
                                    >
                                        <Target size={16} />
                                        Set Up Your ICP
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Subscription & Billing Section */}
                    <section className="settings-card">
                        <div className="settings-card-header">
                            <CreditCard size={20} />
                            <h2>Subscription & Billing</h2>
                        </div>
                        <div className="settings-card-body">
                            {hasPlan ? (
                                <div className="billing-active">
                                    <div className="plan-overview">
                                        <div className="plan-name-row">
                                            <span className="plan-name">
                                                {getPlanDisplayName(user.plan)} Plan
                                            </span>
                                            <span
                                                className={getStatusBadgeClass(
                                                    user.subscriptionStatus
                                                )}
                                            >
                                                {getStatusLabel(user.subscriptionStatus)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="usage-meters">
                                        <div className="usage-meter">
                                            <div className="usage-meter-header">
                                                <span className="usage-meter-label">
                                                    Leads Used
                                                </span>
                                                <span className="usage-meter-value">
                                                    {leadsUsed} / {leadsLimit}
                                                </span>
                                            </div>
                                            <div className="usage-bar">
                                                <div
                                                    className="usage-bar-fill"
                                                    style={{
                                                        width: `${Math.min((leadsUsed / leadsLimit) * 100, 100)}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="usage-meter">
                                            <div className="usage-meter-header">
                                                <span className="usage-meter-label">
                                                    Outreach Sent
                                                </span>
                                                <span className="usage-meter-value">
                                                    {outreachUsed} / {outreachLimit}
                                                </span>
                                            </div>
                                            <div className="usage-bar">
                                                <div
                                                    className="usage-bar-fill"
                                                    style={{
                                                        width: `${Math.min((outreachUsed / outreachLimit) * 100, 100)}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        className="btn btn-secondary"
                                        onClick={handleManageBilling}
                                        disabled={portalLoading}
                                    >
                                        {portalLoading ? (
                                            <Loader2 size={16} className="spin-icon" />
                                        ) : (
                                            <ExternalLink size={16} />
                                        )}
                                        Manage Billing
                                    </button>
                                </div>
                            ) : (
                                <div className="plan-cards">
                                    <div className="plan-card">
                                        <div className="plan-card-header">
                                            <Zap size={24} className="plan-icon plan-icon-pro" />
                                            <h3>Pro</h3>
                                            <div className="plan-price">
                                                <span className="price-amount">$59</span>
                                                <span className="price-period">/mo</span>
                                            </div>
                                        </div>
                                        <ul className="plan-features">
                                            <li>
                                                <Check size={16} />
                                                500 leads per month
                                            </li>
                                            <li>
                                                <Check size={16} />
                                                200 outreach messages
                                            </li>
                                            <li>
                                                <Check size={16} />
                                                1 LinkedIn account
                                            </li>
                                        </ul>
                                        <button
                                            className="btn btn-primary btn-full"
                                            onClick={() => handleSubscribe('pro')}
                                            disabled={checkoutLoading !== null}
                                        >
                                            {checkoutLoading === 'pro' ? (
                                                <Loader2 size={16} className="spin-icon" />
                                            ) : null}
                                            Subscribe
                                        </button>
                                    </div>

                                    <div className="plan-card plan-card-featured">
                                        <div className="plan-card-badge">Most Popular</div>
                                        <div className="plan-card-header">
                                            <Crown
                                                size={24}
                                                className="plan-icon plan-icon-elite"
                                            />
                                            <h3>Elite</h3>
                                            <div className="plan-price">
                                                <span className="price-amount">$249</span>
                                                <span className="price-period">/mo</span>
                                            </div>
                                        </div>
                                        <ul className="plan-features">
                                            <li>
                                                <Check size={16} />
                                                2,000 leads per month
                                            </li>
                                            <li>
                                                <Check size={16} />
                                                800 outreach messages
                                            </li>
                                            <li>
                                                <Check size={16} />
                                                3 LinkedIn accounts
                                            </li>
                                            <li>
                                                <Check size={16} />
                                                Autopilot mode
                                            </li>
                                        </ul>
                                        <button
                                            className="btn btn-primary btn-full"
                                            onClick={() => handleSubscribe('elite')}
                                            disabled={checkoutLoading !== null}
                                        >
                                            {checkoutLoading === 'elite' ? (
                                                <Loader2 size={16} className="spin-icon" />
                                            ) : null}
                                            Subscribe
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* LinkedIn Connection Section */}
                    <section className="settings-card">
                        <div className="settings-card-header">
                            <Linkedin size={20} />
                            <h2>LinkedIn Connection</h2>
                        </div>
                        <div className="settings-card-body">
                            <div className="linkedin-status">
                                {user.unipileConnected ? (
                                    <>
                                        <div className="linkedin-connected">
                                            <span className="connection-badge connection-badge-connected">
                                                <Check size={14} />
                                                Connected
                                            </span>
                                            <span className="connection-info">
                                                Your LinkedIn account is linked and ready for
                                                outreach.
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="linkedin-disconnected">
                                        <span className="connection-badge connection-badge-disconnected">
                                            Not Connected
                                        </span>
                                        <span className="connection-info">
                                            Connect your LinkedIn account to enable automated
                                            outreach.
                                        </span>
                                        <button className="btn btn-secondary" disabled>
                                            <Linkedin size={16} />
                                            Connect LinkedIn
                                            <span className="coming-soon-label">Coming soon</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </DashboardLayout>
    )
}
