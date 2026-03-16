import { useUser } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { useSyncedUser, useLeadsStats, useActivitySummary } from '../hooks'
import { mockLeads } from '../data/mockLeads'
import PageHeader from '../components/layout/PageHeader'
import './DashboardPage.css'

function DashboardPage() {
    const clerkLoaded = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

    if (clerkLoaded) {
        return <DashboardWithClerk />
    }

    // Demo mode without Clerk
    return <DashboardDemo />
}

function DashboardDemo() {
    return (
        <div className="dashboard-content">
            <PageHeader
                title="Welcome to LeadFlow AI! 👋"
                subtitle="You're in demo mode. Add your Clerk key to enable authentication."
                breadcrumbs={[{ label: 'Dashboard' }]}
            />

                    <QuickActions />

            <div className="stats-overview">
                <div className="stats-header">
                    <h2>Overview</h2>
                    <Link to="/dashboard/leads" className="view-all-link">View All Leads →</Link>
                </div>
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-number">{mockLeads.length}</div>
                        <div className="stat-label">Total Leads</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{mockLeads.filter(l => l.messageStatus === 'sent').length}</div>
                        <div className="stat-label">Messages Sent</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{Math.round(mockLeads.filter(l => l.outreachStatus === 'accepted' || l.outreachStatus === 'replied').length / mockLeads.length * 100)}%</div>
                        <div className="stat-label">Accept Rate</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{mockLeads.filter(l => l.outreachStatus === 'replied').length}</div>
                        <div className="stat-label">Replies</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function DashboardWithClerk() {
    const { user } = useUser()
    const syncedUser = useSyncedUser()

    // Get real stats from Convex (falls back to undefined if not connected)
    const stats = useLeadsStats(syncedUser.convexId || undefined)
    const activitySummary = useActivitySummary(syncedUser.convexId || undefined, 7)

    // Compute stats - use Convex data if available, fall back to mock
    const displayStats = stats || {
        total: mockLeads.length,
        pending: mockLeads.filter(l => l.outreachStatus === 'pending').length,
        sent: mockLeads.filter(l => l.messageStatus === 'sent').length,
        accepted: mockLeads.filter(l => l.outreachStatus === 'accepted').length,
        replied: mockLeads.filter(l => l.outreachStatus === 'replied').length,
    }

    const acceptRate = displayStats.total > 0
        ? Math.round((displayStats.accepted + displayStats.replied) / displayStats.total * 100)
        : 0

    return (
        <div className="dashboard-content">
            <PageHeader
                title={`Welcome back, ${user?.firstName || 'there'}! 👋`}
                subtitle="Here's what's happening with your leads today."
                breadcrumbs={[{ label: 'Dashboard' }]}
            />

            {!syncedUser.onboardingCompleted && (
                <div className="onboarding-prompt">
                    <span>⚡</span>
                    <p>Complete your setup to get personalized recommendations.</p>
                    <Link to="/onboarding" className="btn btn-sm btn-primary">Complete Setup</Link>
                </div>
            )}

            <QuickActions unipileConnected={syncedUser.unipileConnected} />

            {/* Activity Summary */}
            {activitySummary && (
                <div className="activity-summary">
                    <h2>Last 7 Days</h2>
                    <div className="activity-grid">
                        <div className="activity-item">
                            <span className="activity-value">{activitySummary.leadsImported}</span>
                            <span className="activity-label">Leads Imported</span>
                        </div>
                        <div className="activity-item">
                            <span className="activity-value">{activitySummary.connectionsSent}</span>
                            <span className="activity-label">Connections Sent</span>
                        </div>
                        <div className="activity-item">
                            <span className="activity-value">{activitySummary.connectionsAccepted}</span>
                            <span className="activity-label">Accepted</span>
                        </div>
                        <div className="activity-item">
                            <span className="activity-value">{activitySummary.repliesReceived}</span>
                            <span className="activity-label">Replies</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="stats-overview">
                <div className="stats-header">
                    <h2>Overview</h2>
                    <Link to="/dashboard/leads" className="view-all-link">View All Leads →</Link>
                </div>
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-number">{displayStats.total}</div>
                        <div className="stat-label">Total Leads</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{displayStats.sent}</div>
                        <div className="stat-label">Messages Sent</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{acceptRate}%</div>
                        <div className="stat-label">Accept Rate</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{displayStats.replied}</div>
                        <div className="stat-label">Replies</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function QuickActions({ unipileConnected = false }: { unipileConnected?: boolean }) {
    return (
        <div className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="action-cards">
                <Link to="/dashboard/upload" className="action-card">
                    <div className="action-icon">📤</div>
                    <h3>Import Leads</h3>
                    <p>Upload CSV, Excel, or connect Google Sheets</p>
                </Link>
                <Link to="/onboarding" className="action-card">
                    <div className="action-icon">⚙️</div>
                    <h3>Setup Preferences</h3>
                    <p>Customize your lead scoring and messaging</p>
                </Link>
                <Link to="/dashboard/connect" className={`action-card ${unipileConnected ? 'connected' : ''}`}>
                    <div className="action-icon">{unipileConnected ? '✓' : '🔗'}</div>
                    <h3>{unipileConnected ? 'LinkedIn Connected' : 'Connect LinkedIn'}</h3>
                    <p>{unipileConnected ? 'Ready to send messages' : 'Link via Unipile for automation'}</p>
                </Link>
            </div>
        </div>
    )
}

export default DashboardPage
